import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";
import { TemplateList } from "@/features/templates/components/template-list";
import { getTemplates } from "@/features/templates/actions/template-actions";

export default async function TemplatesPage() {
  const result = await getTemplates();
  const templates = result.success && result.data ? result.data : [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">링크 템플릿</h1>
          <p className="text-muted-foreground mt-1">
            자주 사용하는 링크 설정을 템플릿으로 저장하세요
          </p>
        </div>
        <Link href="/admin/templates/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            새 템플릿
          </Button>
        </Link>
      </div>

      <TemplateList initialTemplates={templates} />
    </div>
  );
}
