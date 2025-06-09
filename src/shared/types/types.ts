export interface DailyClickStats {
  date: string;
  clicks: number;
}

export interface Link {
  id: string;
  url: string;
  short_id: string;
  created_at: string;
  user_id: string;
}
