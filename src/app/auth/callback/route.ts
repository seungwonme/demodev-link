/**
 * @file src/app/auth/callback/route.ts
 * @description Supabase 인증 콜백 처리 라우트
 *
 * 이 라우트는 Supabase 인증 프로세스의 콜백을 처리합니다.
 *
 * 주요 기능:
 * 1. 인증 코드를 세션으로 교환
 * 2. 인증 에러 처리 (만료된 링크, 액세스 거부 등)
 * 3. 적절한 페이지로 리다이렉트
 *
 * 핵심 구현 로직:
 * - URL 쿼리 파라미터와 해시에서 인증 정보 추출
 * - Supabase 클라이언트로 코드 교환
 * - 에러 타입별 적절한 리다이렉트 처리
 *
 * @dependencies
 * - @/lib/supabase/server: 서버 사이드 Supabase 클라이언트
 * - next/server: Next.js 서버 유틸리티
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// 동적 렌더링 강제 설정 (Supabase 클라이언트 사용으로 인한 Static Generation 방지)
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams, origin, hash } = requestUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  // 에러 처리를 위한 로직 추가
  // URL 해시에서 에러 정보 추출 (예: #error=access_denied&error_code=otp_expired)
  let errorInfo = null;
  if (hash) {
    const hashParams = new URLSearchParams(hash.substring(1)); // # 기호 제거
    const error = hashParams.get("error");
    const errorCode = hashParams.get("error_code");
    const errorDescription = hashParams.get("error_description");

    if (error && errorCode) {
      errorInfo = {
        error,
        errorCode,
        errorDescription,
      };

      console.error("인증 해시 오류:", errorInfo);

      // 에러가 otp_expired인 경우, 로그인 페이지로 리디렉션하면서 특정 에러 메시지 전달
      if (errorCode === "otp_expired") {
        return NextResponse.redirect(
          `${origin}/login?error=expired_link&message=이메일 링크가 만료되었습니다. 다시 요청해주세요.`,
        );
      }

      // 기타 오류의 경우 메시지를 포함하여 리다이렉트
      return NextResponse.redirect(
        `${origin}/login?error=${errorCode}&message=${encodeURIComponent(
          errorDescription || "인증 과정에서 오류가 발생했습니다.",
        )}`,
      );
    }
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      console.groupCollapsed("app/auth/callback/route");
      console.log(data);
      console.log(error);
      console.groupEnd();

      if (!error) {
        // 성공적으로 세션 교환이 이루어졌을 때
        console.log("세션 교환 성공");
        return NextResponse.redirect(`${origin}${next}`);
      }

      // 에러가 발생한 경우 에러 메시지를 쿼리 파라미터로 전달
      console.error("세션 교환 오류:", error);
      return NextResponse.redirect(
        `${origin}/login?error=auth_error&message=${encodeURIComponent(
          error.message,
        )}`,
      );
    } catch (err) {
      console.error("예상치 못한 인증 오류:", err);
      return NextResponse.redirect(
        `${origin}/login?error=unknown_error&message=${encodeURIComponent(
          "인증 과정에서 예상치 못한 오류가 발생했습니다.",
        )}`,
      );
    }
  }

  // 코드가 없을 경우 일반적인 인증 오류로 처리
  console.error("인증 코드 없음");
  return NextResponse.redirect(
    `${origin}/login?error=auth_error&message=${encodeURIComponent(
      "인증 코드가 유효하지 않습니다.",
    )}`,
  );
}
