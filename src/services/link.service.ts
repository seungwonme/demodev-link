import { supabase } from "@/lib/supabase";
import { CreateLinkDTO, Link } from "@/types/link";
import { DailyClickStats } from "@/types/supabase";
import { Snowflake } from "@/lib/utils";

export class LinkService {
  private static TABLE_NAME = "links";
  private static CLICK_TABLE = "link_clicks";

  /**
   * 단축 URL을 생성합니다.
   * @param data 원본 URL 정보
   * @returns 생성된 링크 객체
   */
  static async createShortLink(data: CreateLinkDTO): Promise<Link> {
    try {
      // 현재 사용자의 세션 확인
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // 로그인되지 않은 경우 오류 반환
      if (!session) {
        throw new Error("URL 단축 기능은 로그인 후 이용 가능합니다.");
      }

      const slug: string = await Snowflake.generate();

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

      if (error) {
        console.error("Error creating short link:", error);
        throw new Error("단축 URL 생성 중 오류가 발생했습니다.");
      }

      return link;
    } catch (error) {
      console.error("Error in createShortLink:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("단축 URL 생성 중 알 수 없는 오류가 발생했습니다.");
    }
  }

  /**
   * slug로 링크를 조회합니다.
   * @param slug 단축 URL의 slug
   * @returns 링크 객체 또는 null
   */
  static async getLinkBySlug(slug: string): Promise<Link | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // 레코드가 없는 경우 (PGRST116: Did not find a result)
          return null;
        }
        console.error("Error fetching link by slug:", error);
        throw new Error("링크 조회 중 오류가 발생했습니다.");
      }

      return data;
    } catch (error) {
      console.error(`Error in getLinkBySlug for slug ${slug}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("링크 조회 중 알 수 없는 오류가 발생했습니다.");
    }
  }

  /**
   * 링크의 클릭 수를 증가시키고 클릭 정보를 기록합니다.
   * @param slug 단축 URL의 slug
   * @param requestInfo 요청 정보 (User-Agent, IP 등)
   */
  static async incrementClickCount(
    slug: string,
    requestInfo?: { userAgent: string | null; ip: string },
  ): Promise<void> {
    try {
      let userAgent = null;
      let ip = "unknown";

      // 요청 정보가 주입되었으면 사용
      if (requestInfo) {
        userAgent = requestInfo.userAgent;
        ip = requestInfo.ip;
      }

      // 링크 ID 가져오기
      const { data: linkData, error: linkError } = await supabase
        .from(this.TABLE_NAME)
        .select("id")
        .eq("slug", slug)
        .single();

      if (linkError) {
        console.error(`Error finding link with slug ${slug}:`, linkError);
        throw new Error(`링크를 찾을 수 없습니다: ${slug}`);
      }

      if (!linkData) {
        throw new Error(`링크를 찾을 수 없습니다: ${slug}`);
      }

      // 클릭 이벤트 기록
      const [clickInsert, countUpdate] = await Promise.all([
        supabase.from(this.CLICK_TABLE).insert({
          link_id: linkData.id,
          user_agent: userAgent,
          ip_address: ip,
        }),
        supabase.rpc("increment_click_count", { link_id: linkData.id }),
      ]);

      if (clickInsert.error) {
        console.error("Error recording click event:", clickInsert.error);
        throw new Error("클릭 이벤트 기록 중 오류가 발생했습니다.");
      }

      if (countUpdate.error) {
        console.error("Error incrementing click count:", countUpdate.error);
        throw new Error("클릭 수 업데이트 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error(`Error in incrementClickCount for slug ${slug}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("클릭 수 업데이트 중 알 수 없는 오류가 발생했습니다.");
    }
  }

  /**
   * 클릭 수가 많은 순으로 상위 링크들을 가져옵니다.
   * @param limit 가져올 링크 수
   * @returns 링크 객체 배열
   */
  static async getTopLinks(limit: number = 10): Promise<Link[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .order("click_count", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching top links:", error);
        throw new Error("인기 링크 조회 중 오류가 발생했습니다.");
      }

      return data || [];
    } catch (error) {
      console.error("Error in getTopLinks:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("인기 링크 조회 중 알 수 없는 오류가 발생했습니다.");
    }
  }

  /**
   * 모든 링크를 가져옵니다.
   * @returns 링크 객체 배열
   */
  static async getAllLinks(): Promise<Link[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching all links:", error);
        throw new Error("전체 링크 조회 중 오류가 발생했습니다.");
      }

      return data || [];
    } catch (error) {
      console.error("Error in getAllLinks:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("전체 링크 조회 중 알 수 없는 오류가 발생했습니다.");
    }
  }

  /**
   * 특정 링크의 일별 클릭 통계를 가져옵니다.
   * @param linkId 링크 ID
   * @returns 일별 클릭 통계 배열
   */
  static async getLinkClickStats(linkId: string): Promise<DailyClickStats[]> {
    try {
      const { data, error } = await supabase
        .from(this.CLICK_TABLE)
        .select("clicked_at")
        .eq("link_id", linkId)
        .order("clicked_at", { ascending: true });

      if (error) {
        console.error(`Error fetching click stats for link ${linkId}:`, error);
        throw new Error("클릭 통계 조회 중 오류가 발생했습니다.");
      }

      // 클릭 데이터를 일별로 집계
      const dailyStats = data.reduce(
        (acc: { [key: string]: number }, click) => {
          const date = new Date(click.clicked_at).toISOString().split("T")[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        },
        {},
      );

      return Object.entries(dailyStats).map(([date, clicks]) => ({
        date,
        clicks,
      }));
    } catch (error) {
      console.error(`Error in getLinkClickStats for link ${linkId}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("클릭 통계 조회 중 알 수 없는 오류가 발생했습니다.");
    }
  }
}
