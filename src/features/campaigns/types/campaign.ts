import type { UTMParameters } from "@/features/links/types/utm";
import type { Link } from "@/shared/types/link";

export type CampaignStatus = "active" | "paused" | "archived";

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: CampaignStatus | null;
  source_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CampaignWithStats extends Campaign {
  total_links: number;
  total_clicks: number;
  period_clicks?: number;
}

export interface CampaignLink {
  id: string;
  campaign_id: string;
  link_id: string;
  added_at: string | null;
}

export interface CampaignWithLinks extends Campaign {
  links: Link[];
}

export interface CreateCampaignDTO {
  name: string;
  description?: string;
  status?: CampaignStatus;
  source_url?: string;
  utm_params?: UTMParameters;
}

export interface UpdateCampaignDTO {
  name?: string;
  description?: string;
  status?: CampaignStatus;
  source_url?: string;
  utm_params?: UTMParameters;
}

export function campaignToUTMParams(campaign: Campaign): UTMParameters {
  return {
    utm_source: campaign.utm_source || "",
    utm_medium: campaign.utm_medium || "",
    utm_campaign: campaign.utm_campaign || "",
    utm_term: campaign.utm_term || "",
    utm_content: campaign.utm_content || "",
  };
}

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  active: "활성",
  paused: "일시정지",
  archived: "보관됨",
};

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  paused: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  archived: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};
