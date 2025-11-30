import { notFound } from "next/navigation";
import { TemplateForm } from "@/features/templates/components/template-form";
import { getTemplate } from "@/features/templates/actions/template-actions";

interface EditTemplatePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTemplatePage({
  params,
}: EditTemplatePageProps) {
  const { id } = await params;
  const result = await getTemplate(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">템플릿 수정</h1>
        <p className="text-muted-foreground mt-1">
          템플릿 설정을 수정합니다
        </p>
      </div>

      <TemplateForm template={result.data} mode="edit" />
    </div>
  );
}
