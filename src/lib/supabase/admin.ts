/**
 * @file src/lib/supabase/admin.ts
 * @description 서버 사이드 전용 Supabase 관리자 클라이언트
 *
 * Service Role Key를 사용하여 RLS를 우회합니다.
 * 반드시 서버 사이드에서만 사용해야 합니다.
 *
 * 사용 사례:
 * - 프로필 생성/수정 (Clerk webhook, 서버 액션)
 * - 관리자 작업
 * - RLS 정책을 우회해야 하는 서버 작업
 */

import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing env.SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
