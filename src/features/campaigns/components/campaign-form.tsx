"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createCampaign, updateCampaign } from "../actions/campaign-actions";
import type {
  Campaign,
  CampaignStatus,
  CreateCampaignDTO,
  UpdateCampaignDTO,
} from "../types/campaign";

interface CampaignFormProps {
  campaign?: Campaign;
  mode: "create" | "edit";
}

const STATUS_OPTIONS: { value: CampaignStatus; label: string }[] = [
  { value: "active", label: "활성" },
  { value: "paused", label: "일시정지" },
  { value: "archived", label: "보관됨" },
];

export function CampaignForm({ campaign, mode }: CampaignFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: campaign?.name || "",
    description: campaign?.description || "",
    status: (campaign?.status as CampaignStatus) || "active",
    source_url: campaign?.source_url || "",
    utm_source: campaign?.utm_source || "",
    utm_medium: campaign?.utm_medium || "",
    utm_campaign: campaign?.utm_campaign || "",
    utm_term: campaign?.utm_term || "",
    utm_content: campaign?.utm_content || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value as CampaignStatus }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!formData.name.trim()) {
        throw new Error("캠페인 이름을 입력해주세요.");
      }

      const utm_params = {
        utm_source: formData.utm_source,
        utm_medium: formData.utm_medium,
        utm_campaign: formData.utm_campaign,
        utm_term: formData.utm_term,
        utm_content: formData.utm_content,
      };

      if (mode === "create") {
        const data: CreateCampaignDTO = {
          name: formData.name,
          description: formData.description || undefined,
          status: formData.status,
          source_url: formData.source_url || undefined,
          utm_params,
        };
        const result = await createCampaign(data);

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("캠페인이 생성되었습니다.");
        router.push("/admin/campaigns");
      } else if (campaign) {
        const data: UpdateCampaignDTO = {
          name: formData.name,
          description: formData.description || undefined,
          status: formData.status,
          source_url: formData.source_url || undefined,
          utm_params,
        };
        const result = await updateCampaign(campaign.id, data);

        if (!result.success) {
          throw new Error(result.error);
        }

        toast.success("캠페인이 수정되었습니다.");
        router.push(`/admin/campaigns/${campaign.id}`);
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
            <Label htmlFor="name">캠페인 이름 *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="예: 2024 블랙프라이데이 프로모션"
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
              placeholder="캠페인에 대한 설명을 입력하세요"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">상태</Label>
            <Select
              value={formData.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source_url">캠페인 소스 URL</Label>
            <Input
              id="source_url"
              name="source_url"
              value={formData.source_url}
              onChange={handleChange}
              placeholder="예: https://youtube.com/watch?v=..."
            />
            <p className="text-xs text-muted-foreground">
              캠페인 소스 (유튜브 영상, 랜딩 페이지 등)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>기본 UTM 파라미터</CardTitle>
          <p className="text-sm text-muted-foreground">
            캠페인에 추가되는 링크에 적용할 기본 UTM 값을 설정하세요
          </p>
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
