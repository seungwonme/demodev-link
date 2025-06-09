/**
 * @file src/lib/supabase/server.ts
 * @description 서버 사이드에서 사용하는 Supabase 클라이언트 유틸리티
 *
 * 이 파일은 Next.js 서버 컴포넌트, 서버 액션, API 라우트에서 사용되는
 * Supabase 클라이언트를 생성합니다.
 *
 * 주요 기능:
 * 1. 서버 사이드 쿠키 기반 세션 관리
 * 2. Next.js 15 호환 쿠키 처리 (await cookies())
 * 3. 환경 변수 검증 및 오류 처리
 *
 * 핵심 구현 로직:
 * - createServerClient를 사용한 SSR 호환 클라이언트 생성
 * - 쿠키 읽기/쓰기를 통한 세션 유지
 * - Static generation 중 오류 방지
 *
 * @dependencies
 * - @supabase/ssr: SSR 호환 Supabase 클라이언트
 * - next/headers: Next.js 헤더 및 쿠키 관리
 *
 * @see {@link https://supabase.com/docs/guides/auth/server-side/nextjs}
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  // 환경 변수 검증
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.warn(
              "Cookie setting failed (expected in Server Components):",
              error,
            );
          }
        },
      },
    },
  );
}
