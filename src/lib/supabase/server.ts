/**
 * @file src/lib/supabase/server.ts
 * @description 서버 사이드에서 사용하는 Supabase 클라이언트 유틸리티
 *
 * Clerk JWT를 Supabase에 전달하여 RLS 정책에서 사용자 인증 가능.
 * auth.jwt() ->> 'sub'로 Clerk user ID에 접근 가능.
 *
 * @dependencies
 * - @supabase/supabase-js: Supabase 클라이언트
 * - @clerk/nextjs/server: Clerk 서버 사이드 인증
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export async function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  // Clerk에서 Supabase용 JWT 토큰 가져오기
  const { getToken } = await auth();
  const supabaseToken = await getToken({ template: "supabase" });

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: supabaseToken
          ? { Authorization: `Bearer ${supabaseToken}` }
          : {},
      },
    }
  );
}
