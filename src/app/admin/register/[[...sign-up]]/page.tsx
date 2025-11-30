/**
 * @file src/app/admin/register/[[...sign-up]]/page.tsx
 * @description Clerk 기반 관리자 회원가입 페이지
 *
 * Clerk의 SignUp 컴포넌트를 사용하여 회원가입 처리
 * 가입 후 자동으로 pending 상태로 설정됨 (webhook에서 처리)
 */

import { SignUp } from "@clerk/nextjs";

export default function AdminRegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 animate-gradient-x" />

      {/* Decorative Blurs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-card shadow-xl",
            },
          }}
          fallbackRedirectUrl="/admin/pending"
          signInUrl="/admin/login"
        />
      </div>
    </div>
  );
}
