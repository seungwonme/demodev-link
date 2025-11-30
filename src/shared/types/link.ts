export interface Link {
  id: string;
  slug: string;
  original_url: string;
  description?: string | null;
  created_at: string;
  click_count: number;
  user_id: string | null;
}

export interface CreateLinkDTO {
  original_url: string;
  custom_slug?: string;
  description?: string;
  utm_params?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };
}

export interface LinkResponse {
  shortUrl: string;
  originalUrl: string;
}
