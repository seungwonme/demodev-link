import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(request: NextRequest) {
  // 현재 요청 URL 가져오기
  const requestUrl = new URL(request.url);

  // 응답 객체 생성
  const response = NextResponse.next();

  // Supabase 클라이언트 설정
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
    },
  );

  // 쿠키를 통해 현재 세션 확인
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 로그인이 필요한 페이지에 대한 보호
  const protectedPaths = ["/analytics", "/profile"];
  const isProtectedPath = protectedPaths.some((path) =>
    requestUrl.pathname.startsWith(path),
  );

  // 보호된 경로에 접근하려는데 로그인되지 않은 경우 리디렉션
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 로그인한 상태에서 로그인 페이지 접근 시 메인으로 리디렉션
  if (requestUrl.pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

// 특정 경로에만 미들웨어 적용
export const config = {
  matcher: ["/profile", "/login", "/reset-password", "/api"],
};
