/**
 * @file src/app/admin/analytics/page.tsx
 * @description 관리자 링크 분석 페이지
 *
 * 이 컴포넌트는 링크 클릭 통계와 상위 링크 목록을 표시하는 분석 페이지입니다.
 *
 * 주요 기능:
 * 1. 클릭 분석 차트 표시
 * 2. 상위 링크 목록 (클릭 수 기준)
 * 3. 실시간 통계 데이터 조회
 *
 * 핵심 구현 로직:
 * - LinkService를 통한 상위 링크 데이터 조회
 * - ClickAnalytics 컴포넌트로 차트 표시
 * - LinkList 컴포넌트로 링크 목록 렌더링
 *
 * @dependencies
 * - @/features/links/actions/link.service: 링크 데이터 서비스
 * - @/features/links/components/link-list: 링크 목록 컴포넌트
 * - @/features/analytics/components/click-analytics: 클릭 분석 컴포넌트
 */

import { LinkService } from "@/features/links/actions/link.service";
import MarketingAnalytics from "@/features/analytics/components/marketing-analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import ClickAnalytics from "@/features/analytics/components/click-analytics";
import LinkList from "@/features/links/components/link-list";

// 동적 렌더링 강제 설정 (Supabase 클라이언트 사용으로 인한 Static Generation 방지)
export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const initialLinks = await LinkService.getTopLinks(10);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">링크 분석</h1>

      <Tabs defaultValue="marketing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="marketing">마케팅 분석</TabsTrigger>
          <TabsTrigger value="overview">전체 통계</TabsTrigger>
          <TabsTrigger value="links">링크 목록</TabsTrigger>
        </TabsList>
        
        <TabsContent value="marketing" className="space-y-6">
          <MarketingAnalytics />
        </TabsContent>
        
        <TabsContent value="overview" className="space-y-6">
          <ClickAnalytics />
        </TabsContent>
        
        <TabsContent value="links" className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <LinkList initialLinks={initialLinks} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
