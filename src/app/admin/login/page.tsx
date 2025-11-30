/**
 * @file src/app/admin/login/page.tsx
 * @description 관리자 로그인 페이지
 *
 * 이 컴포넌트는 관리자 로그인을 위한 페이지입니다.
 *
 * 주요 기능:
 * 1. 로그인 폼 렌더링 (클라이언트 컴포넌트)
 * 2. 로딩 상태 처리 (Suspense)
 * 3. 서버 액션 호출을 통한 인증 처리
 *
 * 핵심 구현 로직:
 * - Suspense를 사용한 로딩 상태 관리
 * - 클라이언트 컴포넌트에서 실제 로그인 로직 처리
 * - 동적 렌더링으로 서버 액션 호출 허용
 *
 * @dependencies
 * - ./login-client: 실제 로그인 폼을 담당하는 클라이언트 컴포넌트
 * - react: Suspense 컴포넌트
 */

import { Suspense } from "react";
import AdminLoginClient from "./login-client";

// 동적 렌더링 강제 설정 (서버 액션 사용으로 인한 Static Generation 방지)
export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 animate-gradient-x" />
      
      {/* Decorative Blurs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <Suspense
        fallback={
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary"></div>
        }
      >
        <AdminLoginClient />
      </Suspense>
    </div>
  );
}
