export interface Link {
  id: string;
  slug: string;
  original_url: string;
  created_at: string;
  click_count: number;
}

export interface CreateLinkDTO {
  original_url: string;
}

export interface LinkResponse {
  shortUrl: string;
  originalUrl: string;
}
