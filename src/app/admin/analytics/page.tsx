/**
 * @file src/app/admin/analytics/page.tsx
 * @description 관리자 링크 분석 페이지
 */

import { LinkService } from "@/features/links/actions/link.service";
import MarketingAnalytics from "@/features/analytics/components/marketing-analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import ClickAnalytics from "@/features/analytics/components/click-analytics";
import LinkList from "@/features/links/components/link-list";
import { BarChart3 } from "lucide-react";

// 동적 렌더링 강제 설정
export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const initialLinks = await LinkService.getTopLinks(10);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-white dark:bg-white/10 shadow-sm border border-black/5 dark:border-white/5">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">링크 분석</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">실시간 데이터와 심층 분석을 통해 인사이트를 얻으세요.</p>
        </div>
      </div>

      <Tabs defaultValue="marketing" className="space-y-8">
        <TabsList className="w-full justify-start h-12 bg-muted/50 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/10 shadow-sm backdrop-blur-md">
          <TabsTrigger value="marketing" className="h-10 px-6 rounded-lg">마케팅 분석</TabsTrigger>
          <TabsTrigger value="overview" className="h-10 px-6 rounded-lg">전체 통계</TabsTrigger>
          <TabsTrigger value="links" className="h-10 px-6 rounded-lg">링크 목록</TabsTrigger>
        </TabsList>

        <TabsContent value="marketing" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* MarketingAnalytics might contain its own cards, so we just ensure it has a nice container if needed, or rely on its internal structure. 
               Assuming it needs a wrapper for consistency if it doesn't have one. */}
          <div className="bg-white dark:bg-white/5 rounded-2xl p-8 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
            <MarketingAnalytics />
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white dark:bg-white/5 rounded-2xl p-8 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
            <ClickAnalytics />
          </div>
        </TabsContent>

        <TabsContent value="links" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white dark:bg-white/5 rounded-2xl p-8 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
            <LinkList initialLinks={initialLinks} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
