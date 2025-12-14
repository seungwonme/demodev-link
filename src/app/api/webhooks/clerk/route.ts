/**
 * @file src/app/api/webhooks/clerk/route.ts
 * @description Clerk webhook handler
 *
 * Handles Clerk webhook events, primarily user.created event to:
 * 1. Create a profile record in the database
 * 2. Set initial publicMetadata.status to "pending"
 * 3. Set initial publicMetadata.role to "user"
 */

import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  // Handle the event
  const eventType = evt.type;
  console.log(`Clerk webhook event: ${eventType}`);

  if (eventType === "user.created") {
    const { id, email_addresses, primary_email_address_id } = evt.data;

    const primaryEmail = email_addresses.find(
      (email) => email.id === primary_email_address_id
    )?.email_address;

    console.log("New user created:", id, primaryEmail);

    try {
      // Create profile in database
      const supabase = createAdminClient();
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          clerk_user_id: id,
          email: primaryEmail,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Failed to create profile:", profileError);
        return new Response("Failed to create profile", { status: 500 });
      }

      // Update Clerk user metadata
      const client = await clerkClient();
      await client.users.updateUserMetadata(id, {
        publicMetadata: {
          status: "pending",
          role: "user",
        },
      });

      console.log("User profile created and metadata set:", id);
    } catch (error) {
      console.error("Error handling user.created:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    console.log("User deleted:", id);

    try {
      // Delete profile from database
      const supabase = createAdminClient();
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("clerk_user_id", id);

      if (error) {
        console.error("Failed to delete profile:", error);
        // Don't fail the webhook if profile deletion fails
      }

      console.log("User profile deleted:", id);
    } catch (error) {
      console.error("Error handling user.deleted:", error);
      // Don't fail the webhook
    }
  }

  return new Response("Webhook processed", { status: 200 });
}
