import type { Tables, TablesInsert } from "./database.types";

// DB에서 자동 생성된 타입 사용
export type Link = Tables<"links">;
export type LinkInsert = TablesInsert<"links">;

// 클릭 수가 null일 수 있으므로 기본값 처리용 타입
export type LinkWithClickCount = Omit<Link, "click_count"> & {
  click_count: number;
};

// 링크 생성 시 사용하는 DTO (클라이언트 입력)
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

// API 응답 타입
export interface LinkResponse {
  shortUrl: string;
  originalUrl: string;
}

// 일별 클릭 통계 (types.ts에서 이동)
export interface DailyClickStats {
  date: string;
  clicks: number;
  uniqueVisitors: number;
}
