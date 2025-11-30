"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createTemplate, updateTemplate } from "../actions/template-actions";
import type { LinkTemplate, CreateTemplateDTO, UpdateTemplateDTO } from "../types/template";

interface TemplateFormProps {
  template?: LinkTemplate;
  mode: "create" | "edit";
}

export function TemplateForm({ template, mode }: TemplateFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: template?.name || "",
    original_url: template?.original_url || "",
    description: template?.description || "",
    utm_source: template?.utm_source || "",
    utm_medium: template?.utm_medium || "",
    utm_campaign: template?.utm_campaign || "",
    utm_term: template?.utm_term || "",
    utm_content: template?.utm_content || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // URL 유효성 검사
      try {
        new URL(formData.original_url);
      } catch {
        throw new Error("유효한 URL 형식이 아닙니다.");
      }

      if (!formData.name.trim()) {
        throw new Error("템플릿 이름을 입력해주세요.");
      }

      const utm_params = {
        utm_source: formData.utm_source,
        utm_medium: formData.utm_medium,
        utm_campaign: formData.utm_campaign,
        utm_term: formData.utm_term,
        utm_content: formData.utm_content,
      };

      if (mode === "create") {
        const data: CreateTemplateDTO = {
          name: formData.name,
          original_url: formData.original_url,
          description: formData.description || undefined,
          utm_params,
        };
        const result = await createTemplate(data);

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("템플릿이 생성되었습니다.");
        router.push("/admin/templates");
      } else if (template) {
        const data: UpdateTemplateDTO = {
          name: formData.name,
          original_url: formData.original_url,
          description: formData.description || undefined,
          utm_params,
        };
        const result = await updateTemplate(template.id, data);

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("템플릿이 수정되었습니다.");
        router.push("/admin/templates");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">템플릿 이름 *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="예: 블로그 홍보 링크"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="original_url">URL *</Label>
            <Input
              id="original_url"
              name="original_url"
              type="url"
              value={formData.original_url}
              onChange={handleChange}
              placeholder="https://example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">설명</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="템플릿에 대한 설명을 입력하세요"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>UTM 파라미터</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="utm_source">utm_source</Label>
              <Input
                id="utm_source"
                name="utm_source"
                value={formData.utm_source}
                onChange={handleChange}
                placeholder="google, newsletter, facebook"
              />
              <p className="text-xs text-muted-foreground">트래픽 소스</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="utm_medium">utm_medium</Label>
              <Input
                id="utm_medium"
                name="utm_medium"
                value={formData.utm_medium}
                onChange={handleChange}
                placeholder="cpc, banner, email"
              />
              <p className="text-xs text-muted-foreground">마케팅 매체</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="utm_campaign">utm_campaign</Label>
              <Input
                id="utm_campaign"
                name="utm_campaign"
                value={formData.utm_campaign}
                onChange={handleChange}
                placeholder="spring_sale, product_launch"
              />
              <p className="text-xs text-muted-foreground">캠페인 이름</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="utm_term">utm_term</Label>
              <Input
                id="utm_term"
                name="utm_term"
                value={formData.utm_term}
                onChange={handleChange}
                placeholder="키워드"
              />
              <p className="text-xs text-muted-foreground">검색 키워드 (선택)</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="utm_content">utm_content</Label>
              <Input
                id="utm_content"
                name="utm_content"
                value={formData.utm_content}
                onChange={handleChange}
                placeholder="광고 콘텐츠 식별자"
              />
              <p className="text-xs text-muted-foreground">광고 콘텐츠 구분 (선택)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {mode === "create" ? "생성" : "저장"}
        </Button>
      </div>
    </form>
  );
}
