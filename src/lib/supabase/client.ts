/**
 * @file src/lib/supabase/client.ts
 * @description 클라이언트 사이드에서 사용하는 Supabase 클라이언트 유틸리티
 *
 * 이 파일은 브라우저 환경에서 실행되는 React 컴포넌트에서 사용되는
 * Supabase 클라이언트를 생성합니다.
 *
 * 주요 기능:
 * 1. 브라우저 환경에서의 Supabase 클라이언트 생성
 * 2. 환경 변수 검증 및 오류 처리
 * 3. 클라이언트 사이드 쿠키 기반 세션 관리
 *
 * 핵심 구현 로직:
 * - createBrowserClient를 사용한 클라이언트 사이드 호환 클라이언트 생성
 * - 환경 변수 유효성 검사
 * - 싱글톤 패턴으로 클라이언트 재사용
 *
 * @dependencies
 * - @supabase/ssr: SSR 호환 Supabase 클라이언트
 *
 * @see {@link https://supabase.com/docs/guides/auth/server-side/nextjs}
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // 환경 변수 검증
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
