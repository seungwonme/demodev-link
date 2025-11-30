import type { UTMParameters } from "@/features/links/types/utm";

export interface LinkTemplate {
  id: string;
  user_id: string;
  name: string;
  original_url: string;
  description: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateTemplateDTO {
  name: string;
  original_url: string;
  description?: string;
  utm_params?: UTMParameters;
}

export interface UpdateTemplateDTO {
  name?: string;
  original_url?: string;
  description?: string;
  utm_params?: UTMParameters;
}

export function templateToUTMParams(template: LinkTemplate): UTMParameters {
  return {
    utm_source: template.utm_source || "",
    utm_medium: template.utm_medium || "",
    utm_campaign: template.utm_campaign || "",
    utm_term: template.utm_term || "",
    utm_content: template.utm_content || "",
  };
}
