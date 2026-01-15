/**
 * @file src/app/admin/links/page.tsx
 * @description 관리자 링크 관리 페이지
 */

import { LinkService } from "@/features/links/actions/link.service";
import UrlInputForm from "@/features/links/components/url/url-input-form";
import LinkList from "@/features/links/components/link-list";
import { Link2 } from "lucide-react";

// 동적 렌더링 강제 설정
export const dynamic = "force-dynamic";

export default async function AdminLinksPage() {
  const initialLinks = await LinkService.getTopLinks(10);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-2xl bg-white dark:bg-white/10 shadow-sm border-none">
          <Link2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">링크 관리</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">새로운 링크를 생성하고 관리하세요.</p>
        </div>
      </div>

      {/* Create new link section */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-8 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-foreground">새 링크 생성</h2>
          <p className="text-sm text-muted-foreground mt-1">긴 URL을 짧고 간결한 링크로 변환하세요.</p>
        </div>
        <UrlInputForm />
      </div>

      {/* Links list */}
      <div className="bg-white dark:bg-white/5 rounded-2xl p-8 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">링크 목록</h2>
            <p className="text-sm text-muted-foreground mt-1">최근 생성된 링크 목록입니다.</p>
          </div>
        </div>
        <LinkList initialLinks={initialLinks} />
      </div>
    </div>
  );
}
