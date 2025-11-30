/**
 * @file scripts/migrate-users-to-clerk.ts
 * @description Supabase Auth 사용자를 Clerk로 마이그레이션하는 스크립트
 *
 * 주의사항:
 * - 이 스크립트는 한 번만 실행해야 합니다
 * - 실행 전에 반드시 데이터베이스 백업을 수행하세요
 * - Clerk API rate limit을 고려하여 batch 처리합니다
 *
 * 마이그레이션 프로세스:
 * 1. Supabase auth.users에서 모든 사용자 조회
 * 2. 각 사용자에 대해 Clerk 사용자 생성
 * 3. Clerk metadata에 status/role 설정
 * 4. profiles 테이블의 clerk_user_id 업데이트
 * 5. links 테이블의 user_id 업데이트
 */

import "dotenv/config";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { Clerk } from "@clerk/backend";

// 환경 변수 확인
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables");
}

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error("Missing CLERK_SECRET_KEY environment variable");
}

// Supabase Admin Client (service_role_key 사용)
const supabase = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Clerk Client
const clerk = new Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

interface SupabaseUser {
  id: string;
  email: string;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  status: string;
  role: string;
  approved_at?: string;
  approved_by?: string;
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  created_at: string;
}

async function migrateUsers() {
  console.log("🚀 Starting user migration from Supabase Auth to Clerk...\n");

  try {
    // 1. Supabase auth.users에서 모든 사용자 가져오기
    console.log("📥 Fetching users from Supabase Auth...");
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      throw new Error(`Failed to fetch auth users: ${authError.message}`);
    }

    const authUsers = authData.users as unknown as SupabaseUser[];
    console.log(`✓ Found ${authUsers.length} users in Supabase Auth\n`);

    // 2. profiles 테이블에서 사용자 정보 가져오기
    console.log("📥 Fetching user profiles...");
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    console.log(`✓ Found ${profiles.length} profiles\n`);

    // 3. 각 사용자를 Clerk로 마이그레이션
    let successCount = 0;
    let failCount = 0;
    const errors: { email: string; error: string }[] = [];

    for (const authUser of authUsers) {
      const profile = profiles.find((p) => p.id === authUser.id);

      if (!profile) {
        console.log(`⚠️  Profile not found for ${authUser.email}, skipping...`);
        failCount++;
        continue;
      }

      try {
        console.log(`\n📝 Processing ${authUser.email}...`);

        // Clerk에 사용자 생성
        // 주의: 비밀번호는 마이그레이션할 수 없으므로, 사용자는 "Forgot Password"로 재설정해야 함
        const clerkUser = await clerk.users.createUser({
          emailAddress: [authUser.email],
          skipPasswordRequirement: true, // 비밀번호 없이 생성
          publicMetadata: {
            status: profile.status || "pending",
          },
          privateMetadata: {
            role: profile.role || "user",
            approved_at: profile.approved_at,
            approved_by: profile.approved_by,
            rejected_at: profile.rejected_at,
            rejected_by: profile.rejected_by,
            rejection_reason: profile.rejection_reason,
          },
        });

        console.log(`  ✓ Created Clerk user: ${clerkUser.id}`);

        // profiles 테이블 업데이트
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            clerk_user_id: clerkUser.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id);

        if (updateError) {
          throw new Error(`Failed to update profile: ${updateError.message}`);
        }

        console.log(`  ✓ Updated profile with clerk_user_id`);

        // links 테이블 업데이트 (user_id를 clerk_user_id로)
        const { error: linksError } = await supabase
          .from("links")
          .update({
            user_id: clerkUser.id,
          })
          .eq("user_id", profile.id);

        if (linksError) {
          console.log(`  ⚠️  Failed to update links: ${linksError.message}`);
        } else {
          console.log(`  ✓ Updated user's links`);
        }

        successCount++;
        console.log(`  ✅ Successfully migrated ${authUser.email}`);

        // Rate limiting: Clerk API는 초당 20 requests 제한
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        failCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        errors.push({ email: authUser.email, error: errorMessage });
        console.log(`  ❌ Failed to migrate ${authUser.email}: ${errorMessage}`);
      }
    }

    // 4. 마이그레이션 결과 출력
    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary");
    console.log("=".repeat(60));
    console.log(`Total users: ${authUsers.length}`);
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);

    if (errors.length > 0) {
      console.log("\n⚠️  Errors:");
      errors.forEach(({ email, error }) => {
        console.log(`  - ${email}: ${error}`);
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log("📝 Next Steps:");
    console.log("=".repeat(60));
    console.log("1. Users will need to reset their password using 'Forgot Password'");
    console.log("2. Verify that all users have correct status/role in Clerk Dashboard");
    console.log("3. Test user login and permissions");
    console.log("4. Run database migration: pnpm run db:push");
    console.log("5. Remove old Supabase auth.users (optional, after verification)");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// 실행
migrateUsers()
  .then(() => {
    console.log("\n✨ Migration completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Migration error:", error);
    process.exit(1);
  });
