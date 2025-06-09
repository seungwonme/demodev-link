#!/usr/bin/env node

/**
 * Seed script to create the first admin account
 * Usage: npm run seed:admin
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import readline from "readline";

// Load environment variables from .env files
config({ path: [".env.local", ".env"] });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const maskPassword = (password: string): string => {
  return "*".repeat(password.length);
};

async function main() {
  try {
    // Check for required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("❌ Missing required environment variables:");
      if (!supabaseUrl) console.error("   - NEXT_PUBLIC_SUPABASE_URL");
      if (!supabaseServiceKey) console.error("   - SUPABASE_SERVICE_ROLE_KEY");
      console.error(
        "\nPlease ensure your .env.local file contains these variables.",
      );
      process.exit(1);
    }

    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log("🚀 DemoLink Admin Account Setup\n");
    console.log(
      "This script will create the first admin account for your DemoLink instance.\n",
    );

    // Check if any admin already exists
    const { data: existingAdmins, error: checkError } = await supabase
      .from("profiles")
      .select("email")
      .eq("role", "admin")
      .eq("status", "approved");

    if (checkError) {
      console.error(
        "❌ Error checking for existing admins:",
        checkError.message,
      );
      process.exit(1);
    }

    if (existingAdmins && existingAdmins.length > 0) {
      console.log("⚠️  Warning: The following admin accounts already exist:");
      existingAdmins.forEach((admin) => {
        console.log(`   - ${admin.email}`);
      });

      const proceed = await question(
        "\nDo you want to create another admin account? (yes/no): ",
      );
      if (proceed.toLowerCase() !== "yes" && proceed.toLowerCase() !== "y") {
        console.log("\n✅ Setup cancelled.");
        process.exit(0);
      }
    }

    // Get admin email
    let email = "";
    while (!email) {
      email = await question("\nEnter admin email address: ");
      if (!email) {
        console.log("❌ Email cannot be empty.");
      } else if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        console.log("❌ Please enter a valid email address.");
        email = "";
      }
    }

    // Get admin password
    let password = "";
    let confirmPassword = "";
    while (!password || password !== confirmPassword) {
      password = await question("Enter admin password (min 6 characters): ");

      if (!password) {
        console.log("❌ Password cannot be empty.");
        continue;
      }

      if (password.length < 6) {
        console.log("❌ Password must be at least 6 characters long.");
        password = "";
        continue;
      }

      // Show masked password
      console.log(`   Password: ${maskPassword(password)}`);

      confirmPassword = await question("Confirm admin password: ");

      if (password !== confirmPassword) {
        console.log("❌ Passwords do not match. Please try again.");
        password = "";
        confirmPassword = "";
      }
    }

    console.log("\n📝 Creating admin account...");

    // Create the user account
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email
      });

    if (authError) {
      console.error("❌ Error creating user:", authError.message);
      process.exit(1);
    }

    if (!authData.user) {
      console.error("❌ User creation failed: No user data returned");
      process.exit(1);
    }

    console.log("✅ User account created successfully");

    // Update the profile to make them an admin
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role: "admin",
        status: "approved",
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("❌ Error updating user profile:", profileError.message);

      // Try to clean up the created user
      await supabase.auth.admin.deleteUser(authData.user.id);
      console.log("🧹 Cleaned up partially created user");

      process.exit(1);
    }

    console.log("✅ Admin privileges granted successfully");

    // Display success message
    console.log("\n🎉 Admin account created successfully!\n");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", maskPassword(password));
    console.log("\n👉 You can now log in at: /admin/login");
    console.log(
      "\n⚠️  Security reminder: Store the password securely and change it after first login.",
    );
  } catch (error) {
    console.error("\n❌ Unexpected error:", error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
main();
