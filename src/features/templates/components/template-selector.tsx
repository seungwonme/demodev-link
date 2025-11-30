"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { FileText } from "lucide-react";
import { getTemplates } from "../actions/template-actions";
import type { LinkTemplate } from "../types/template";
import type { UTMParameters } from "@/features/links/types/utm";

interface TemplateSelectorProps {
  onSelect: (template: {
    url: string;
    description: string;
    utmParams: UTMParameters;
  }) => void;
  disabled?: boolean;
}

export function TemplateSelector({
  onSelect,
  disabled = false,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<LinkTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const result = await getTemplates();
        if (result.success && result.data) {
          setTemplates(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      onSelect({
        url: template.original_url,
        description: template.description || "",
        utmParams: {
          utm_source: template.utm_source || "",
          utm_medium: template.utm_medium || "",
          utm_campaign: template.utm_campaign || "",
          utm_term: template.utm_term || "",
          utm_content: template.utm_content || "",
        },
      });
    }
  };

  if (isLoading) {
    return null;
  }

  if (templates.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        템플릿에서 선택
      </Label>
      <Select onValueChange={handleSelect} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="저장된 템플릿을 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              <div className="flex flex-col">
                <span>{template.name}</span>
                {template.description && (
                  <span className="text-xs text-muted-foreground">
                    {template.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
