/**
 * @file src/app/admin/links/page.tsx
 * @description 관리자 링크 관리 페이지
 *
 * 이 컴포넌트는 링크 생성 및 관리 기능을 제공하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 새 링크 생성 폼
 * 2. 기존 링크 목록 표시
 * 3. 링크 통계 및 관리
 *
 * 핵심 구현 로직:
 * - LinkService를 통한 상위 링크 데이터 조회
 * - UrlInputForm으로 새 링크 생성
 * - LinkList로 기존 링크 목록 표시
 *
 * @dependencies
 * - @/features/links/actions/link.service: 링크 데이터 서비스
 * - @/features/links/components/url/url-input-form: URL 입력 폼 컴포넌트
 * - @/features/links/components/link-list: 링크 목록 컴포넌트
 */

import { LinkService } from "@/features/links/actions/link.service";
import UrlInputForm from "@/features/links/components/url/url-input-form";
import LinkList from "@/features/links/components/link-list";

// 동적 렌더링 강제 설정 (Supabase 클라이언트 사용으로 인한 Static Generation 방지)
export const dynamic = "force-dynamic";

const LINKS_PER_PAGE = 10; // 페이지당 표시될 링크 수

export default async function AdminLinksPage() {
  // LinkService.getTopLinks 대신 LinkService.getPaginatedLinks 사용
  const { links: initialLinks, totalCount } = await LinkService.getPaginatedLinks(1, LINKS_PER_PAGE);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">링크 관리</h1>

      {/* Create new link section */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">새 링크 생성</h2>
        <UrlInputForm />
      </div>

      {/* Links list */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <LinkList initialLinks={initialLinks} totalCount={totalCount} linksPerPage={LINKS_PER_PAGE} />
      </div>
    </div>
  );
}
