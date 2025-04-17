import { supabase } from "@/lib/supabase";
import { CreateLinkDTO, Link } from "@/types/link";
import { DailyClickStats } from "@/types/supabase";

// 헤더 관련 유틸리티 함수들
export const ServerUtils = {
  getRequestInfo(req?: Request) {
    try {
      if (req) {
        // 직접 Request 객체가 전달된 경우 (API 라우트)
        const userAgent = req.headers.get("user-agent");
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        return { userAgent, ip };
      }

      // Request 객체가 없는 경우 기본값 반환
      return {
        userAgent: null,
        ip: "unknown",
      };
    } catch (error) {
      console.error("Error getting request info:", error);
      return {
        userAgent: null,
        ip: "unknown",
      };
    }
  },
};

export class LinkService {
  private static TABLE_NAME = "links";

  static async createShortLink(data: CreateLinkDTO): Promise<Link> {
    const slug: string = Snowflake.generate();

    const { data: link, error } = await supabase
      .from(this.TABLE_NAME)
      .insert([
        {
          slug,
          original_url: data.original_url,
          click_count: 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return link;
  }

  static async getLinkBySlug(slug: string): Promise<Link | null> {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return data;
  }

  static async incrementClickCount(
    slug: string,
    requestInfo?: { userAgent: string | null; ip: string },
  ): Promise<void> {
    let userAgent = null;
    let ip = "unknown";

    // 요청 정보가 주입되었으면 사용
    if (requestInfo) {
      userAgent = requestInfo.userAgent;
      ip = requestInfo.ip;
    }

    // 링크 ID 가져오기
    const { data: linkData } = await supabase
      .from("links")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!linkData) throw new Error(`링크를 찾을 수 없습니다: ${slug}`);

    // 클릭 이벤트 기록
    const [clickInsert, countUpdate] = await Promise.all([
      supabase.from("link_clicks").insert({
        link_id: linkData.id,
        user_agent: userAgent,
        ip_address: ip,
      }),
      supabase.rpc("increment_click_count", { link_id: linkData.id }),
    ]);

    if (clickInsert.error) throw clickInsert.error;
    if (countUpdate.error) throw countUpdate.error;
  }

  static async getTopLinks(limit: number = 10): Promise<Link[]> {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .order("click_count", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  static async getAllLinks(): Promise<Link[]> {
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getLinkClickStats(linkId: string): Promise<DailyClickStats[]> {
    const { data, error } = await supabase
      .from("link_clicks")
      .select("clicked_at")
      .eq("link_id", linkId)
      .order("clicked_at", { ascending: true });

    if (error) throw error;

    // 클릭 데이터를 일별로 집계
    const dailyStats = data.reduce((acc: { [key: string]: number }, click) => {
      const date = new Date(click.clicked_at).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(dailyStats).map(([date, clicks]) => ({
      date,
      clicks,
    }));
  }
}

class Snowflake {
  private static EPOCH = 1609459200000; // 2021-01-01 기준
  private static WORKER_ID = 0;
  private static SEQUENCE = 0;
  private static LAST_TIMESTAMP = -1;

  // Base62 문자셋 (0-9, a-z, A-Z)
  private static BASE62 =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  static generate(): string {
    let timestamp = Date.now() - this.EPOCH;

    if (timestamp < this.LAST_TIMESTAMP) {
      throw new Error("Clock moved backwards!");
    }

    if (timestamp === this.LAST_TIMESTAMP) {
      this.SEQUENCE = (this.SEQUENCE + 1) & 4095; // 12비트 시퀀스
      if (this.SEQUENCE === 0) {
        timestamp = this.tilNextMillis(this.LAST_TIMESTAMP);
      }
    } else {
      this.SEQUENCE = 0;
    }

    this.LAST_TIMESTAMP = timestamp;

    const id =
      (BigInt(timestamp) << BigInt(22)) |
      (BigInt(this.WORKER_ID) << BigInt(12)) | // 고정된 WORKER_ID 사용
      BigInt(this.SEQUENCE);

    return this.toBase62(id);
  }

  private static tilNextMillis(lastTimestamp: number): number {
    let timestamp = Date.now() - this.EPOCH;
    while (timestamp <= lastTimestamp) {
      timestamp = Date.now() - this.EPOCH;
    }
    return timestamp;
  }

  private static toBase62(num: bigint): string {
    if (num === BigInt(0)) {
      return "0"; // 0 처리
    }
    let result = "";
    let value = num;
    while (value > BigInt(0)) {
      result = this.BASE62[Number(value % BigInt(62))] + result;
      value = value / BigInt(62);
    }
    return result;
  }
}
