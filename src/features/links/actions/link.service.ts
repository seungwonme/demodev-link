import { createClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { CreateLinkDTO, Link } from "@/shared/types/link";
import { DailyClickStats } from "@/shared/types/types";
import { Snowflake } from "@/shared/utils/snowflake";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ClerkAuthService } from "@/features/auth/services/clerk-auth.service";

export class LinkService {
  private static TABLE_NAME = "links";
  private static CLICK_TABLE = "link_clicks";

  /**
   * Supabase 클라이언트를 가져옵니다.
   * 테스트 환경에서는 주입된 클라이언트를 사용하고,
   * 그렇지 않으면 서버 클라이언트를 사용합니다.
   */
  private static async getSupabaseClient(injectedClient?: SupabaseClient) {
    if (injectedClient) {
      return injectedClient;
    }

    // 테스트 환경인지 확인
    if (process.env.NODE_ENV === "test" || process.env.VITEST) {
      // 테스트 환경에서는 브라우저 클라이언트 사용 (cookies 없이)
      return createBrowserClient();
    }

    // 프로덕션/개발 환경에서는 서버 클라이언트 사용
    return await createClient();
  }

  /**
   * 단축 URL을 생성합니다.
   * @param data 원본 URL 정보
   * @param supabaseClient 테스트용 Supabase 클라이언트 (선택적)
   * @returns 생성된 링크 객체
   */
  static async createShortLink(
    data: CreateLinkDTO,
    supabaseClient?: SupabaseClient,
    clerkUserId?: string,
  ): Promise<Link> {
    try {
      const supabase = await this.getSupabaseClient(supabaseClient);

      // Clerk 인증 (테스트 환경은 스킵)
      let userId = clerkUserId || null;
      let userEmail: string | null = null;

      if (!supabaseClient && process.env.NODE_ENV !== "test" && !process.env.VITEST) {
        const user = await ClerkAuthService.requireAuth({ requiredStatus: "approved" });
        const clerkUserId = user.userId;
        userEmail = user.email;

        // 프로필 존재 확인 및 자동 생성 (id를 가져와야 함)
        const { data: existingProfile, error: profileCheckError } = await supabase
          .from("profiles")
          .select("id, clerk_user_id")
          .eq("clerk_user_id", clerkUserId)
          .single();

        // PGRST116: 레코드가 없는 경우 (정상적인 상황)
        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
          console.error("Error checking profile:", profileCheckError);
          throw new Error("프로필 확인 중 오류가 발생했습니다.");
        }

        if (!existingProfile) {
          const { data: newProfile, error: profileError } = await supabase
            .from("profiles")
            .insert({
              clerk_user_id: clerkUserId,
              email: userEmail,
            })
            .select("id")
            .single();

          if (profileError || !newProfile) {
            console.error("Error creating profile:", profileError);
            throw new Error("사용자 프로필 생성 중 오류가 발생했습니다.");
          }

          userId = newProfile.id;
        } else {
          userId = existingProfile.id;
        }
      }

      // UTM 파라미터를 URL에 추가
      let finalUrl = data.original_url;
      if (data.utm_params) {
        const url = new URL(data.original_url);
        const { utm_source, utm_medium, utm_campaign, utm_term, utm_content } = data.utm_params;

        if (utm_source) url.searchParams.set('utm_source', utm_source);
        if (utm_medium) url.searchParams.set('utm_medium', utm_medium);
        if (utm_campaign) url.searchParams.set('utm_campaign', utm_campaign);
        if (utm_term) url.searchParams.set('utm_term', utm_term);
        if (utm_content) url.searchParams.set('utm_content', utm_content);

        finalUrl = url.toString();
      }

      let slug: string;

      // Check if custom slug is provided
      if (data.custom_slug) {
        // Validate custom slug format
        if (!/^[a-zA-Z0-9-]+$/.test(data.custom_slug)) {
          throw new Error("사용자 정의 주소는 영문, 숫자, 하이픈만 사용 가능합니다.");
        }
        
        // Check if custom slug already exists
        const { data: existingLink } = await supabase
          .from(this.TABLE_NAME)
          .select("id")
          .eq("slug", data.custom_slug)
          .single();
          
        if (existingLink) {
          throw new Error("이미 사용 중인 주소입니다. 다른 주소를 입력해주세요.");
        }
        
        slug = data.custom_slug;
      } else {
        // Generate random slug using Snowflake
        slug = await Snowflake.generate();
      }

      const { data: link, error } = await supabase
        .from(this.TABLE_NAME)
        .insert([
          {
            slug,
            original_url: finalUrl,
            description: data.description || null,
            click_count: 0,
            user_id: userId,
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
   * @param supabaseClient 테스트용 Supabase 클라이언트 (선택적)
   * @returns 링크 객체 또는 null
   */
  static async getLinkBySlug(
    slug: string,
    supabaseClient?: SupabaseClient,
  ): Promise<Link | null> {
    try {
      const supabase = await this.getSupabaseClient(supabaseClient);
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
   * @param supabaseClient 테스트용 Supabase 클라이언트 (선택적)
   */
  static async incrementClickCount(
    slug: string,
    requestInfo?: { userAgent: string | null; ip: string },
    supabaseClient?: SupabaseClient,
  ): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient(supabaseClient);
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
   * 특정 기간 동안 가장 많이 클릭된 링크들을 가져옵니다.
   * @param period 'today' | 'week' | 'all'
   * @param limit 가져올 링크 수
   * @param supabaseClient 테스트용 Supabase 클라이언트 (선택적)
   * @returns 링크 객체 배열 with click counts for the period
   */
  static async getTopClickedLinksByPeriod(
    period: 'today' | 'week' | 'all',
    limit: number = 10,
    supabaseClient?: SupabaseClient,
  ): Promise<(Link & { period_clicks: number })[]> {
    try {
      const supabase = await this.getSupabaseClient(supabaseClient);
      
      let startDate: Date;
      const endDate = new Date();
      
      switch (period) {
        case 'today':
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'all':
          // For 'all', we'll just use the regular getTopLinks method
          const allTimeLinks = await this.getTopLinks(limit, supabaseClient);
          return allTimeLinks.map(link => ({ ...link, period_clicks: link.click_count }));
      }
      
      // Get click counts for the specified period
      const { data: clickData, error: clickError } = await supabase
        .from(this.CLICK_TABLE)
        .select('link_id')
        .gte('clicked_at', startDate.toISOString())
        .lte('clicked_at', endDate.toISOString());
        
      if (clickError) {
        console.error('Error fetching click data:', clickError);
        throw new Error('클릭 데이터 조회 중 오류가 발생했습니다.');
      }
      
      // Count clicks per link
      const clickCounts = clickData.reduce((acc: { [key: string]: number }, click) => {
        acc[click.link_id] = (acc[click.link_id] || 0) + 1;
        return acc;
      }, {});
      
      // Get top link IDs
      const topLinkIds = Object.entries(clickCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([linkId]) => linkId);
        
      if (topLinkIds.length === 0) {
        return [];
      }
      
      // Get link details
      const { data: links, error: linksError } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .in('id', topLinkIds);
        
      if (linksError) {
        console.error('Error fetching link details:', linksError);
        throw new Error('링크 정보 조회 중 오류가 발생했습니다.');
      }
      
      // Combine links with period click counts and sort
      const linksWithPeriodClicks = (links || []).map(link => ({
        ...link,
        period_clicks: clickCounts[link.id] || 0
      })).sort((a, b) => b.period_clicks - a.period_clicks);
      
      return linksWithPeriodClicks;
    } catch (error) {
      console.error(`Error in getTopClickedLinksByPeriod for period ${period}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('인기 링크 조회 중 알 수 없는 오류가 발생했습니다.');
    }
  }
  
  /**
   * 클릭 수가 많은 순으로 상위 링크들을 가져옵니다.
   * @param limit 가져올 링크 수
   * @param supabaseClient 테스트용 Supabase 클라이언트 (선택적)
   * @returns 링크 객체 배열
   */
  static async getTopLinks(
    limit: number = 10,
    supabaseClient?: SupabaseClient,
  ): Promise<Link[]> {
    try {
      const supabase = await this.getSupabaseClient(supabaseClient);
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
   * @param supabaseClient 테스트용 Supabase 클라이언트 (선택적)
   * @returns 링크 객체 배열
   */
  static async getAllLinks(supabaseClient?: SupabaseClient): Promise<Link[]> {
    try {
      const supabase = await this.getSupabaseClient(supabaseClient);
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
   * 링크를 삭제합니다.
   * @param linkId 삭제할 링크 ID
   * @param supabaseClient 테스트용 Supabase 클라이언트 (선택적)
   */
  static async deleteLink(
    linkId: string,
    supabaseClient?: SupabaseClient,
  ): Promise<void> {
    try {
      const supabase = await this.getSupabaseClient(supabaseClient);

      const currentUser = await ClerkAuthService.requireAuth({ requiredStatus: "approved" });

      // 링크 소유자 확인
      const { data: link, error: linkError } = await supabase
        .from(this.TABLE_NAME)
        .select("user_id")
        .eq("id", linkId)
        .single();
        
      if (linkError || !link) {
        throw new Error("링크를 찾을 수 없습니다.");
      }
      
      // 소유자가 아니고 관리자도 아닌 경우 거부
      if (link.user_id !== currentUser.userId && currentUser.role !== "admin") {
        throw new Error("이 링크를 삭제할 권한이 없습니다.");
      }
      
      // 링크 삭제 (관련 클릭 데이터는 CASCADE로 자동 삭제)
      const { error: deleteError } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq("id", linkId);
        
      if (deleteError) {
        console.error("Error deleting link:", deleteError);
        throw new Error("링크 삭제 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error(`Error in deleteLink for linkId ${linkId}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("링크 삭제 중 알 수 없는 오류가 발생했습니다.");
    }
  }
  
  /**
   * 특정 링크의 일별 클릭 통계를 가져옵니다.
   * @param linkId 링크 ID
   * @param supabaseClient 테스트용 Supabase 클라이언트 (선택적)
   * @returns 일별 클릭 통계 배열
   */
  static async getLinkClickStats(
    linkId: string,
    supabaseClient?: SupabaseClient,
  ): Promise<DailyClickStats[]> {
    try {
      const supabase = await this.getSupabaseClient(supabaseClient);
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
  
  /**
   * 마케팅 분석을 위한 상세 통계를 가져옵니다.
   * @param linkId 링크 ID
   * @param dateRange 날짜 범위 (선택적)
   * @param supabaseClient 테스트용 Supabase 클라이언트 (선택적)
   * @returns 마케팅 분석 데이터
   */
  static async getMarketingAnalytics(
    linkId: string,
    dateRange?: { startDate?: Date; endDate?: Date },
    supabaseClient?: SupabaseClient,
  ): Promise<{
    totalClicks: number;
    uniqueClicks: number;
    clicksByHour: { hour: number; clicks: number }[];
    clicksByDevice: { device: string; clicks: number }[];
    clicksByCountry: { country: string; clicks: number }[];
    conversionRate: number;
    avgClicksPerDay: number;
    clickTrend: 'up' | 'down' | 'stable';
  }> {
    try {
      const supabase = await this.getSupabaseClient(supabaseClient);

      // 링크 정보 가져오기
      const { data: link, error: linkError } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .eq("id", linkId)
        .single();

      if (linkError || !link) {
        throw new Error("링크를 찾을 수 없습니다.");
      }

      // 클릭 데이터 가져오기 (날짜 범위 필터 적용)
      let query = supabase
        .from(this.CLICK_TABLE)
        .select("*")
        .eq("link_id", linkId);

      if (dateRange?.startDate) {
        query = query.gte("clicked_at", dateRange.startDate.toISOString());
      }

      if (dateRange?.endDate) {
        query = query.lte("clicked_at", dateRange.endDate.toISOString());
      }

      const { data: clicks, error: clicksError } = await query
        .order("clicked_at", { ascending: true });
        
      if (clicksError) {
        throw new Error("클릭 데이터 조회 중 오류가 발생했습니다.");
      }
      
      const clickData = clicks || [];
      const totalClicks = clickData.length;
      
      // 고유 IP 수 (고유 방문자)
      const uniqueIPs = new Set(clickData.map(c => c.ip_address)).size;
      
      // 시간대별 클릭 분석
      const clicksByHour = Array.from({ length: 24 }, (_, i) => ({ hour: i, clicks: 0 }));
      clickData.forEach(click => {
        const hour = new Date(click.clicked_at).getHours();
        clicksByHour[hour].clicks++;
      });
      
      // 디바이스별 클릭 분석 (User Agent 기반)
      const deviceMap: { [key: string]: number } = {};
      clickData.forEach(click => {
        if (!click.user_agent) {
          deviceMap['Unknown'] = (deviceMap['Unknown'] || 0) + 1;
          return;
        }
        
        const ua = click.user_agent.toLowerCase();
        let device = 'Desktop';
        
        if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
          device = 'Mobile';
        } else if (/tablet|ipad/i.test(ua)) {
          device = 'Tablet';
        }
        
        deviceMap[device] = (deviceMap[device] || 0) + 1;
      });
      
      const clicksByDevice = Object.entries(deviceMap).map(([device, clicks]) => ({
        device,
        clicks
      }));
      
      // 국가별 클릭 (예시 - 실제로는 IP 기반 지역 분석 필요)
      const clicksByCountry = [
        { country: 'Korea', clicks: Math.floor(totalClicks * 0.7) },
        { country: 'USA', clicks: Math.floor(totalClicks * 0.2) },
        { country: 'Others', clicks: Math.floor(totalClicks * 0.1) }
      ];
      
      // 전환율 (예시 - 실제로는 목표 설정 필요)
      const conversionRate = totalClicks > 0 ? (uniqueIPs / totalClicks) * 100 : 0;
      
      // 일평균 클릭
      const daysSinceCreation = Math.max(1, 
        Math.floor((Date.now() - new Date(link.created_at).getTime()) / (1000 * 60 * 60 * 24))
      );
      const avgClicksPerDay = totalClicks / daysSinceCreation;
      
      // 클릭 트렌드 분석 (최근 7일 vs 이전 7일)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      
      const recentClicks = clickData.filter(c => 
        new Date(c.clicked_at) >= sevenDaysAgo
      ).length;
      
      const previousClicks = clickData.filter(c => 
        new Date(c.clicked_at) >= fourteenDaysAgo && 
        new Date(c.clicked_at) < sevenDaysAgo
      ).length;
      
      let clickTrend: 'up' | 'down' | 'stable' = 'stable';
      if (recentClicks > previousClicks * 1.1) {
        clickTrend = 'up';
      } else if (recentClicks < previousClicks * 0.9) {
        clickTrend = 'down';
      }
      
      return {
        totalClicks,
        uniqueClicks: uniqueIPs,
        clicksByHour,
        clicksByDevice,
        clicksByCountry,
        conversionRate,
        avgClicksPerDay,
        clickTrend
      };
    } catch (error) {
      console.error(`Error in getMarketingAnalytics for link ${linkId}:`, error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('마케팅 분석 데이터 조회 중 알 수 없는 오류가 발생홈습니다.');
    }
  }

  /**
   * 모든 링크와 기간별 클릭 수를 가져옵니다.
   * @param dateRange 날짜 범위 (선택적)
   * @param supabaseClient 테스트용 Supabase 클라이언트 (선택적)
   * @returns 링크 배열 (기간별 클릭 수 포함)
   */
  static async getAllLinksWithPeriodClicks(
    dateRange?: { startDate?: Date; endDate?: Date },
    supabaseClient?: SupabaseClient,
  ): Promise<(Link & { period_clicks: number })[]> {
    try {
      const supabase = await this.getSupabaseClient(supabaseClient);

      // 모든 링크 가져오기
      const { data: links, error: linksError } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .order("created_at", { ascending: false });

      if (linksError) {
        console.error("Error fetching links:", linksError);
        throw new Error("링크 조회 중 오류가 발생했습니다.");
      }

      if (!links || links.length === 0) {
        return [];
      }

      // 날짜 범위가 없으면 전체 클릭 수 사용
      if (!dateRange?.startDate && !dateRange?.endDate) {
        return links.map(link => ({
          ...link,
          period_clicks: link.click_count
        }));
      }

      // 기간별 클릭 데이터 가져오기
      let query = supabase
        .from(this.CLICK_TABLE)
        .select('link_id');

      if (dateRange?.startDate) {
        query = query.gte('clicked_at', dateRange.startDate.toISOString());
      }

      if (dateRange?.endDate) {
        query = query.lte('clicked_at', dateRange.endDate.toISOString());
      }

      const { data: clickData, error: clickError } = await query;

      if (clickError) {
        console.error('Error fetching click data:', clickError);
        throw new Error('클릭 데이터 조회 중 오류가 발생했습니다.');
      }

      // 링크별 클릭 수 계산
      const clickCounts = (clickData || []).reduce((acc: { [key: string]: number }, click) => {
        acc[click.link_id] = (acc[click.link_id] || 0) + 1;
        return acc;
      }, {});

      // 링크에 기간별 클릭 수 추가
      return links.map(link => ({
        ...link,
        period_clicks: clickCounts[link.id] || 0
      }));
    } catch (error) {
      console.error("Error in getAllLinksWithPeriodClicks:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("링크 조회 중 알 수 없는 오류가 발생했습니다.");
    }
  }
}
