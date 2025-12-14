/**
 * @file src/lib/supabase/server.ts
 * @description 서버 사이드에서 사용하는 Supabase 클라이언트 유틸리티
 *
 * Clerk Third-Party Integration 방식 사용.
 * Supabase에서 Clerk를 Auth Provider로 등록하면 JWT 템플릿 불필요.
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

  // Clerk Third-Party Integration: 템플릿 없이 기본 토큰 사용
  const { getToken } = await auth();
  const token = await getToken();

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      },
    }
  );
}
