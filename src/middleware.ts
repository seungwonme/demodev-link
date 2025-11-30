/**
 * @file src/middleware.ts
 * @description Next.js 미들웨어 - Clerk 기반 라우트 보호 및 인증 관리
 *
 * 이 미들웨어는 Clerk을 사용하여 사용자 인증 상태를 확인하고 적절한 페이지로 라우팅합니다.
 *
 * 주요 기능:
 * 1. 관리자 페이지 접근 제어
 * 2. 사용자 상태별 라우팅 (대기중, 승인됨, 거절됨)
 * 3. Clerk metadata 기반 권한 체크
 *
 * 핵심 구현 로직:
 * - Clerk middleware를 사용한 인증 체크
 * - publicMetadata의 status 확인
 * - privateMetadata의 role 확인
 *
 * @dependencies
 * - @clerk/nextjs: Clerk Next.js SDK
 *
 * @see {@link https://clerk.com/docs/references/nextjs/clerk-middleware}
 */

import {
  clerkMiddleware,
  clerkClient,
  createRouteMatcher,
} from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/shorten',
  '/admin/login(.*)',
  '/admin/register(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

// Admin-only routes
const isAdminRoute = createRouteMatcher(['/admin/users(.*)']);

export default clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();
  const { pathname } = request.nextUrl;

  // 1. Always allow public routes (regardless of auth status)
  if (isPublicRoute(request)) {
    return NextResponse.next();
  }

  // 2. Redirect unauthenticated users to login
  if (!userId) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // 3. Get user metadata
  // Prefer sessionClaims for speed; fall back to Clerk user fetch if metadata missing
  let publicMetadata =
    (sessionClaims?.publicMetadata as { status?: string }) || {};
  let privateMetadata =
    (sessionClaims?.privateMetadata as { role?: string }) || {};

  if (!publicMetadata.status || !privateMetadata.role) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      publicMetadata =
        (user.publicMetadata as { status?: string }) || publicMetadata;
      privateMetadata =
        (user.privateMetadata as { role?: string }) || privateMetadata;
    } catch (error) {
      console.error('[middleware] Failed to fetch user metadata', error);
    }
  }

  const userStatus = publicMetadata.status || 'pending';
  const userRole = privateMetadata.role || 'user';

  // 4. Handle admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // 5. Redirect authenticated users from auth pages to appropriate dashboard
  if (
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/admin/register')
  ) {
    const statusRedirects: Record<string, string> = {
      approved: '/admin/dashboard',
      pending: '/admin/pending',
      rejected: '/admin/rejected',
    };
    return NextResponse.redirect(
      new URL(statusRedirects[userStatus] || '/admin/pending', request.url),
    );
  }

  // 6. Status pages: only allow matching status, otherwise redirect to dashboard
  if (pathname === '/admin/pending') {
    if (userStatus === 'pending') return NextResponse.next();
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  if (pathname === '/admin/rejected') {
    if (userStatus === 'rejected') return NextResponse.next();
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // 7. Redirect non-approved users to their status page
  if (userStatus === 'pending') {
    return NextResponse.redirect(new URL('/admin/pending', request.url));
  }
  if (userStatus === 'rejected') {
    return NextResponse.redirect(new URL('/admin/rejected', request.url));
  }

  // 8. From here, only approved users can proceed
  // Check admin-only routes
  if (isAdminRoute(request) && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // 9. Allow access
  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - .well-known (for domain verification)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
