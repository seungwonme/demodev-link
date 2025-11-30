"use client";

import { useState } from "react";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import {
  BarChart3,
  Info,
  ExternalLink,
  Copy,
  Check,
  Tag,
  Target,
  Megaphone,
  Search,
  FileText
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { UTMParameters, addUTMParameters } from "@/features/links/types/utm";

interface UTMBuilderProps {
  /** 원본 URL */
  originalUrl: string;
  /** UTM 파라미터 변경 콜백 */
  onUTMChange: (params: UTMParameters) => void;
  /** 비활성화 여부 */
  disabled?: boolean;
}

export function UTMBuilder({ originalUrl, onUTMChange, disabled = false }: UTMBuilderProps) {
  const [enabled, setEnabled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [utmParams, setUTMParams] = useState<UTMParameters>({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
  });

  // UTM 파라미터 업데이트 핸들러
  const handleUTMChange = (key: keyof UTMParameters, value: string) => {
    const newParams = { ...utmParams, [key]: value };
    setUTMParams(newParams);
    onUTMChange(enabled ? newParams : {});
  };

  // UTM 활성화/비활성화 핸들러
  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    onUTMChange(checked ? utmParams : {});
  };

  // 최종 URL 생성 (유효한 URL일 때만)
  const getFinalUrl = () => {
    if (!enabled || !originalUrl) {
      return originalUrl;
    }

    try {
      // URL 유효성 검사
      new URL(originalUrl);
      return addUTMParameters(originalUrl, utmParams);
    } catch {
      // 유효하지 않은 URL이면 원본 반환
      return originalUrl;
    }
  };

  const finalUrl = getFinalUrl();

  // URL 복사 핸들러
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(finalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // UTM 필드 정의
  const utmFields = [
    {
      key: "utm_source" as keyof UTMParameters,
      label: "캠페인 소스",
      description: "트래픽 소스 (예: google, newsletter, facebook)",
      placeholder: "google",
      icon: Tag,
      required: true,
    },
    {
      key: "utm_medium" as keyof UTMParameters,
      label: "캠페인 매체",
      description: "마케팅 매체 (예: cpc, banner, email)",
      placeholder: "cpc",
      icon: Target,
      required: true,
    },
    {
      key: "utm_campaign" as keyof UTMParameters,
      label: "캠페인 이름",
      description: "프로모션 또는 캠페인 이름 (예: spring_sale)",
      placeholder: "spring_sale",
      icon: Megaphone,
      required: true,
    },
    {
      key: "utm_term" as keyof UTMParameters,
      label: "캠페인 키워드",
      description: "유료 검색 키워드 (선택사항)",
      placeholder: "running+shoes",
      icon: Search,
      required: false,
    },
    {
      key: "utm_content" as keyof UTMParameters,
      label: "캠페인 콘텐츠",
      description: "광고 콘텐츠 구분 (선택사항)",
      placeholder: "logolink",
      icon: FileText,
      required: false,
    },
  ];

  return (
    <div className="space-y-4">
      {/* UTM Builder Toggle */}
      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <Label htmlFor="utm-toggle" className="text-base font-semibold cursor-pointer">
                  UTM 파라미터 추가
                </Label>
                <p className="text-sm text-muted-foreground">
                  마케팅 캠페인 추적을 위한 파라미터를 추가합니다
                </p>
              </div>
            </div>
            <Switch
              id="utm-toggle"
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={disabled || !originalUrl}
            />
          </div>
        </CardContent>
      </Card>

      {/* UTM Parameters Form */}
      {enabled && (
        <Card className="animate-in slide-in-from-top-2 border-accent/20">
          <CardContent className="pt-6 space-y-6">
            {/* Info Alert */}
            <Alert className="border-accent/20 bg-accent/5">
              <Info className="h-4 w-4 text-accent" />
              <AlertDescription className="text-sm">
                UTM 파라미터는 Google Analytics 등의 분석 도구에서 캠페인 성과를 추적하는 데 사용됩니다.
              </AlertDescription>
            </Alert>

            {/* UTM Fields */}
            <div className="space-y-4">
              {utmFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key} className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {field.label}
                      {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      id={field.key}
                      type="text"
                      value={utmParams[field.key] || ""}
                      onChange={(e) => handleUTMChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      disabled={disabled}
                      className="transition-all focus:scale-[1.01]"
                    />
                    <p className="text-xs text-muted-foreground">
                      {field.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* URL Preview */}
            {originalUrl && (
              <div className="space-y-2 pt-4 border-t border-accent/10">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <ExternalLink className="h-4 w-4" />
                  미리보기
                </Label>
                <div className="relative">
                  <div className="p-3 pr-12 rounded-lg bg-muted/50 border border-accent/20 break-all text-sm font-mono">
                    {finalUrl}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    disabled={!finalUrl}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  이 URL이 단축 링크의 원본 URL로 사용됩니다
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
