/**
 * Approve a Clerk user by setting their status to "approved"
 */

import { clerkClient } from "@clerk/nextjs/server";

async function approveUser(userId: string) {
  try {
    const client = await clerkClient();

    // Get current user
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses.find(
      (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress;

    console.log("\n=== Before Update ===");
    console.log("User:", email);
    console.log("Public Metadata:", JSON.stringify(user.publicMetadata, null, 2));
    console.log("Private Metadata:", JSON.stringify(user.privateMetadata, null, 2));

    // Update metadata
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        status: "approved",
      },
      privateMetadata: {
        ...user.privateMetadata,
        role: user.privateMetadata.role || "admin",
        approved_at: new Date().toISOString(),
      },
    });

    // Get updated user
    const updatedUser = await client.users.getUser(userId);

    console.log("\n=== After Update ===");
    console.log("Public Metadata:", JSON.stringify(updatedUser.publicMetadata, null, 2));
    console.log("Private Metadata:", JSON.stringify(updatedUser.privateMetadata, null, 2));

    console.log("\n✅ User approved successfully!");
  } catch (error) {
    console.error("Error approving user:", error);
  }
}

// Get user ID from command line
const userId = process.argv[2];

if (!userId) {
  console.error("Usage: bunx tsx scripts/approve-user.ts <user_id>");
  console.log("\nExample: bunx tsx scripts/approve-user.ts user_36DDDtsv1mjSOojdbCMAmAU9u06");
  process.exit(1);
}

approveUser(userId);
