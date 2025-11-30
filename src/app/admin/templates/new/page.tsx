import { TemplateForm } from "@/features/templates/components/template-form";

export default function NewTemplatePage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">새 템플릿 만들기</h1>
        <p className="text-muted-foreground mt-1">
          자주 사용하는 링크 설정을 템플릿으로 저장하세요
        </p>
      </div>

      <TemplateForm mode="create" />
    </div>
  );
}
