/**
 * @file src/app/admin/page.tsx
 * @description 관리자 페이지 메인 진입점
 *
 * 이 컴포넌트는 사용자가 /admin으로 접근했을 때 대시보드로 리다이렉트합니다.
 *
 * 주요 기능:
 * 1. /admin/dashboard로 자동 리다이렉트
 * 2. 미들웨어에서 인증 상태 확인
 *
 * 핵심 구현 로직:
 * - 단순 리다이렉트 처리
 * - 미들웨어에서 쿠키 기반 인증 확인
 *
 * @dependencies
 * - next/navigation: 리다이렉트 기능
 */

import { redirect } from "next/navigation";

// 동적 렌더링 강제 설정 (미들웨어에서 쿠키 사용으로 인한 Static Generation 방지)
export const dynamic = "force-dynamic";

export default function AdminPage() {
  redirect("/admin/dashboard");
}
