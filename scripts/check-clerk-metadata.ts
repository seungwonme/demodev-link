/**
 * Check Clerk user metadata
 */

import { clerkClient } from "@clerk/nextjs/server";

async function checkClerkMetadata() {
  try {
    const client = await clerkClient();

    // Get all users
    const { data: users } = await client.users.getUserList({
      limit: 10,
    });

    console.log("\n=== Clerk Users Metadata ===\n");

    for (const user of users) {
      const email = user.emailAddresses.find(
        (e) => e.id === user.primaryEmailAddressId
      )?.emailAddress;

      console.log("User:", email);
      console.log("ID:", user.id);
      console.log("Public Metadata:", JSON.stringify(user.publicMetadata, null, 2));
      console.log("Private Metadata:", JSON.stringify(user.privateMetadata, null, 2));
      console.log("---");
    }
  } catch (error) {
    console.error("Error fetching Clerk metadata:", error);
  }
}

checkClerkMetadata();
