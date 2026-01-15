"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Edit, Trash2, ExternalLink, Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { deleteTemplate } from "../actions/template-actions";
import type { LinkTemplate } from "../types/template";

interface TemplateListProps {
  initialTemplates: LinkTemplate[];
}

export function TemplateList({ initialTemplates }: TemplateListProps) {
  const [templates, setTemplates] = useState(initialTemplates);

  const handleDelete = async (id: string) => {
    const result = await deleteTemplate(id);

    if (result.success) {
      setTemplates(templates.filter((t) => t.id !== id));
      toast.success("템플릿이 삭제되었습니다.");
    } else {
      toast.error(result.error || "템플릿 삭제에 실패했습니다.");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("클립보드에 복사되었습니다.");
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  };

  const buildUrlWithUTM = (template: LinkTemplate): string => {
    try {
      const url = new URL(template.original_url);
      if (template.utm_source)
        url.searchParams.set("utm_source", template.utm_source);
      if (template.utm_medium)
        url.searchParams.set("utm_medium", template.utm_medium);
      if (template.utm_campaign)
        url.searchParams.set("utm_campaign", template.utm_campaign);
      if (template.utm_term) url.searchParams.set("utm_term", template.utm_term);
      if (template.utm_content)
        url.searchParams.set("utm_content", template.utm_content);
      return url.toString();
    } catch {
      return template.original_url;
    }
  };

  const hasUTMParams = (template: LinkTemplate): boolean => {
    return !!(
      template.utm_source ||
      template.utm_medium ||
      template.utm_campaign ||
      template.utm_term ||
      template.utm_content
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toISOString().split("T")[0];
  };

  if (templates.length === 0) {
    return (
      <Card className="border-none shadow-sm bg-white/50 dark:bg-white/5">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">
            아직 저장된 템플릿이 없습니다.
          </p>
          <Link href="/admin/templates/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              첫 템플릿 만들기
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {templates.map((template) => (
        <Card
          key={template.id}
          className="border-black/5 dark:border-white/5 hover:bg-muted/50 dark:hover:bg-white/5 shadow-sm transition-all"
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 mr-4">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{template.name}</h3>
                  {hasUTMParams(template) && (
                    <Badge variant="secondary" className="text-xs">
                      UTM
                    </Badge>
                  )}
                </div>

                {template.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {template.description}
                  </p>
                )}

                <p className="text-sm break-all text-muted-foreground">
                  {template.original_url}
                </p>

                {hasUTMParams(template) && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.utm_source && (
                      <Badge variant="outline" className="text-xs">
                        source: {template.utm_source}
                      </Badge>
                    )}
                    {template.utm_medium && (
                      <Badge variant="outline" className="text-xs">
                        medium: {template.utm_medium}
                      </Badge>
                    )}
                    {template.utm_campaign && (
                      <Badge variant="outline" className="text-xs">
                        campaign: {template.utm_campaign}
                      </Badge>
                    )}
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-2">
                  생성일: {formatDate(template.created_at)}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(buildUrlWithUTM(template))}
                    title="URL 복사"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(buildUrlWithUTM(template), "_blank")
                    }
                    title="새 탭에서 열기"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/templates/${template.id}/edit`}>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>템플릿 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                          &quot;{template.name}&quot; 템플릿을 삭제하시겠습니까?
                          삭제된 템플릿은 복구할 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(template.id)}
                        >
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
