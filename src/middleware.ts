/**
 * @file src/middleware.ts
 * @description Next.js 미들웨어 - 라우트 보호 및 인증 관리
 *
 * 이 미들웨어는 사용자 인증 상태를 확인하고 적절한 페이지로 라우팅합니다.
 *
 * 주요 기능:
 * 1. 관리자 페이지 접근 제어
 * 2. 사용자 상태별 라우팅 (대기중, 승인됨, 거절됨)
 * 3. Supabase 세션 갱신
 *
 * 핵심 구현 로직:
 * - createServerClient를 사용한 SSR 호환 클라이언트 생성
 * - 쿠키 기반 세션 관리
 * - 사용자 프로필 상태에 따른 접근 제어
 *
 * @dependencies
 * - @supabase/ssr: SSR 호환 Supabase 클라이언트
 * - next/server: Next.js 서버 유틸리티
 *
 * @see {@link https://supabase.com/docs/guides/auth/server-side/nextjs#middleware}
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const requestUrl = new URL(request.url);

  // 환경 변수 검증
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    console.error("Missing Supabase environment variables");
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // IMPORTANT: supabase.auth.getUser()를 호출하여 세션을 갱신합니다
    const {
      data: { user },
    } = await supabase.auth.getUser();

    console.log(
      "Middleware - Path:",
      requestUrl.pathname,
      "User:",
      user?.email || "none",
    );

    // Admin routes protection
    if (requestUrl.pathname.startsWith("/admin")) {
      // Public admin pages that don't require authentication
      const publicAdminPaths = ["/admin/login", "/admin/register"];
      const isPublicAdminPath = publicAdminPaths.some(
        (path) => requestUrl.pathname === path,
      );

      // Special pages that require auth but have special handling
      const specialAdminPaths = ["/admin/pending", "/admin/rejected"];
      const isSpecialAdminPath = specialAdminPaths.some(
        (path) => requestUrl.pathname === path,
      );

      // If not a public path, require authentication
      if (!isPublicAdminPath) {
        if (!user) {
          const redirectUrl = new URL("/admin/login", request.url);
          return NextResponse.redirect(redirectUrl);
        }

        // For authenticated users, check profile status
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("status, role")
          .eq("id", user.id)
          .single();

        console.log("Middleware - Profile query result:", {
          profile,
          error: profileError,
        });

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          // 프로필 조회 실패 시 로그인으로 리다이렉트
          const redirectUrl = new URL("/admin/login", request.url);
          return NextResponse.redirect(redirectUrl);
        }

        // For special pages, allow access but still check status
        if (!isSpecialAdminPath) {
          // Redirect based on user status
          if (profile?.status === "pending") {
            const redirectUrl = new URL("/admin/pending", request.url);
            return NextResponse.redirect(redirectUrl);
          }

          if (profile?.status === "rejected") {
            const redirectUrl = new URL("/admin/rejected", request.url);
            return NextResponse.redirect(redirectUrl);
          }

          // Only allow approved users to access regular admin pages
          if (profile?.status !== "approved") {
            const redirectUrl = new URL("/admin/login", request.url);
            return NextResponse.redirect(redirectUrl);
          }
        }

        // Admin-only routes
        const adminOnlyPaths = ["/admin/users"];
        const isAdminOnlyPath = adminOnlyPaths.some((path) =>
          requestUrl.pathname.startsWith(path),
        );

        if (isAdminOnlyPath && profile?.role !== "admin") {
          const redirectUrl = new URL("/admin/dashboard", request.url);
          return NextResponse.redirect(redirectUrl);
        }
      }
    }

    // Redirect authenticated users from admin login/register to dashboard
    if (
      user &&
      (requestUrl.pathname === "/admin/login" ||
        requestUrl.pathname === "/admin/register")
    ) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", user.id)
        .single();

      if (profile?.status === "approved") {
        const redirectUrl = new URL("/admin/dashboard", request.url);
        return NextResponse.redirect(redirectUrl);
      } else if (profile?.status === "pending") {
        const redirectUrl = new URL("/admin/pending", request.url);
        return NextResponse.redirect(redirectUrl);
      } else if (profile?.status === "rejected") {
        const redirectUrl = new URL("/admin/rejected", request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // IMPORTANT: supabaseResponse 객체를 그대로 반환해야 합니다
    return supabaseResponse;
  } catch (error) {
    console.error("Middleware error:", error);
    // 오류 발생 시 원본 응답 반환
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .well-known (for domain verification)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
