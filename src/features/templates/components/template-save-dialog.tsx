"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { createTemplate } from "../actions/template-actions";
import type { UTMParameters } from "@/features/links/types/utm";

interface TemplateSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultUrl: string;
  defaultDescription?: string;
  defaultUTMParams?: UTMParameters;
}

export function TemplateSaveDialog({
  open,
  onOpenChange,
  defaultUrl,
  defaultDescription = "",
  defaultUTMParams = {},
}: TemplateSaveDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("템플릿 이름을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createTemplate({
        name: name.trim(),
        original_url: defaultUrl,
        description: defaultDescription || undefined,
        utm_params: defaultUTMParams,
      });

      if (result.success) {
        toast.success("템플릿이 저장되었습니다.");
        setName("");
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(result.error || "템플릿 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Template save error:", error);
      toast.error("템플릿 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>템플릿으로 저장</DialogTitle>
          <DialogDescription>
            현재 링크 정보를 템플릿으로 저장하여 나중에 빠르게 재사용할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">템플릿 이름 *</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 블로그 포스트 링크"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>URL</Label>
            <p className="text-sm text-muted-foreground break-all">
              {defaultUrl}
            </p>
          </div>

          {defaultDescription && (
            <div className="space-y-2">
              <Label>설명</Label>
              <p className="text-sm text-muted-foreground">
                {defaultDescription}
              </p>
            </div>
          )}

          {Object.keys(defaultUTMParams).some(
            (key) => defaultUTMParams[key as keyof UTMParameters]
          ) && (
            <div className="space-y-2">
              <Label>UTM 파라미터</Label>
              <div className="text-sm text-muted-foreground space-y-1">
                {defaultUTMParams.utm_source && (
                  <div>source: {defaultUTMParams.utm_source}</div>
                )}
                {defaultUTMParams.utm_medium && (
                  <div>medium: {defaultUTMParams.utm_medium}</div>
                )}
                {defaultUTMParams.utm_campaign && (
                  <div>campaign: {defaultUTMParams.utm_campaign}</div>
                )}
                {defaultUTMParams.utm_term && (
                  <div>term: {defaultUTMParams.utm_term}</div>
                )}
                {defaultUTMParams.utm_content && (
                  <div>content: {defaultUTMParams.utm_content}</div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                저장
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
