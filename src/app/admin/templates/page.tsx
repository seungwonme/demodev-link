import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { TemplateList } from "@/features/templates/components/template-list";
import { getTemplates } from "@/features/templates/actions/template-actions";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const result = await getTemplates();
  const templates = result.success && result.data ? result.data : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-white dark:bg-white/10 shadow-sm border-none">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">링크 템플릿</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">자주 사용하는 링크 설정을 템플릿으로 저장하세요.</p>
          </div>
        </div>
        <Link href="/admin/templates/new">
          <Button size="lg" className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold">
            <Plus className="h-4 w-4 mr-2" />
            새 템플릿
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-2xl p-8 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] min-h-[400px]">
        <TemplateList initialTemplates={templates} />
      </div>
    </div>
  );
}
