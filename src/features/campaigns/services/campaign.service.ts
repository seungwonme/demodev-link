import { createClient } from "@/lib/supabase/server";
import { ClerkAuthService } from "@/features/auth/services/clerk-auth.service";
import type {
  Campaign,
  CampaignWithStats,
  CampaignWithLinks,
  CreateCampaignDTO,
  UpdateCampaignDTO,
} from "../types/campaign";
import type { Link } from "@/shared/types/link";

export class CampaignService {
  private static TABLE_NAME = "campaigns";
  private static CAMPAIGN_LINKS_TABLE = "campaign_links";

  /**
   * 현재 사용자의 프로필 ID를 가져옵니다.
   */
  private static async getUserProfileId(): Promise<string> {
    const supabase = await createClient();
    const user = await ClerkAuthService.requireAuth({
      requiredStatus: "approved",
    });

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", user.userId)
      .single();

    if (error || !profile) {
      throw new Error("사용자 프로필을 찾을 수 없습니다.");
    }

    return profile.id;
  }

  /**
   * 캠페인을 생성합니다.
   */
  static async createCampaign(data: CreateCampaignDTO): Promise<Campaign> {
    const supabase = await createClient();
    const userId = await this.getUserProfileId();

    const { data: campaign, error } = await supabase
      .from(this.TABLE_NAME)
      .insert({
        user_id: userId,
        name: data.name,
        description: data.description || null,
        status: data.status || "active",
        source_url: data.source_url || null,
        utm_source: data.utm_params?.utm_source || null,
        utm_medium: data.utm_params?.utm_medium || null,
        utm_campaign: data.utm_params?.utm_campaign || null,
        utm_term: data.utm_params?.utm_term || null,
        utm_content: data.utm_params?.utm_content || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating campaign:", error);
      throw new Error("캠페인 생성 중 오류가 발생했습니다.");
    }

    return campaign;
  }

  /**
   * ID로 캠페인을 조회합니다.
   */
  static async getCampaignById(id: string): Promise<Campaign | null> {
    const supabase = await createClient();
    const userId = await this.getUserProfileId();

    const { data: campaign, error } = await supabase
      .from(this.TABLE_NAME)
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching campaign:", error);
      throw new Error("캠페인 조회 중 오류가 발생했습니다.");
    }

    return campaign;
  }

  /**
   * 캠페인과 해당 링크들을 조회합니다.
   */
  static async getCampaignWithLinks(id: string): Promise<CampaignWithLinks | null> {
    const supabase = await createClient();
    const userId = await this.getUserProfileId();

    // 캠페인 조회
    const { data: campaign, error: campaignError } = await supabase
      .from(this.TABLE_NAME)
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (campaignError) {
      if (campaignError.code === "PGRST116") {
        return null;
      }
      throw new Error("캠페인 조회 중 오류가 발생했습니다.");
    }

    // 캠페인에 연결된 링크 ID 조회
    const { data: campaignLinks, error: linksError } = await supabase
      .from(this.CAMPAIGN_LINKS_TABLE)
      .select("link_id")
      .eq("campaign_id", id);

    if (linksError) {
      throw new Error("캠페인 링크 조회 중 오류가 발생했습니다.");
    }

    // 링크 정보 조회
    let links: Link[] = [];
    if (campaignLinks && campaignLinks.length > 0) {
      const linkIds = campaignLinks.map((cl) => cl.link_id);
      const { data: linksData, error: linksDataError } = await supabase
        .from("links")
        .select("*")
        .in("id", linkIds)
        .order("created_at", { ascending: false });

      if (linksDataError) {
        throw new Error("링크 정보 조회 중 오류가 발생했습니다.");
      }

      links = linksData || [];
    }

    return {
      ...campaign,
      links,
    };
  }

  /**
   * 현재 사용자의 모든 캠페인을 통계와 함께 조회합니다.
   */
  static async getCampaignsWithStats(): Promise<CampaignWithStats[]> {
    const supabase = await createClient();
    const userId = await this.getUserProfileId();

    // 캠페인 목록 조회
    const { data: campaigns, error } = await supabase
      .from(this.TABLE_NAME)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching campaigns:", error);
      throw new Error("캠페인 목록 조회 중 오류가 발생했습니다.");
    }

    // 각 캠페인에 대한 통계 계산
    const campaignsWithStats: CampaignWithStats[] = await Promise.all(
      (campaigns || []).map(async (campaign) => {
        // 캠페인에 연결된 링크 수 조회
        const { count: linkCount } = await supabase
          .from(this.CAMPAIGN_LINKS_TABLE)
          .select("*", { count: "exact", head: true })
          .eq("campaign_id", campaign.id);

        // 캠페인에 연결된 링크들의 총 클릭수 조회
        const { data: campaignLinks } = await supabase
          .from(this.CAMPAIGN_LINKS_TABLE)
          .select("link_id")
          .eq("campaign_id", campaign.id);

        let totalClicks = 0;
        if (campaignLinks && campaignLinks.length > 0) {
          const linkIds = campaignLinks.map((cl) => cl.link_id);
          const { data: links } = await supabase
            .from("links")
            .select("click_count")
            .in("id", linkIds);

          totalClicks = links?.reduce(
            (sum, link) => sum + (link.click_count || 0),
            0
          ) || 0;
        }

        return {
          ...campaign,
          total_links: linkCount || 0,
          total_clicks: totalClicks,
        };
      })
    );

    return campaignsWithStats;
  }

  /**
   * 캠페인을 수정합니다.
   */
  static async updateCampaign(
    id: string,
    data: UpdateCampaignDTO
  ): Promise<Campaign> {
    const supabase = await createClient();
    const userId = await this.getUserProfileId();

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description || null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.source_url !== undefined)
      updateData.source_url = data.source_url || null;

    if (data.utm_params) {
      if (data.utm_params.utm_source !== undefined)
        updateData.utm_source = data.utm_params.utm_source || null;
      if (data.utm_params.utm_medium !== undefined)
        updateData.utm_medium = data.utm_params.utm_medium || null;
      if (data.utm_params.utm_campaign !== undefined)
        updateData.utm_campaign = data.utm_params.utm_campaign || null;
      if (data.utm_params.utm_term !== undefined)
        updateData.utm_term = data.utm_params.utm_term || null;
      if (data.utm_params.utm_content !== undefined)
        updateData.utm_content = data.utm_params.utm_content || null;
    }

    const { data: campaign, error } = await supabase
      .from(this.TABLE_NAME)
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating campaign:", error);
      throw new Error("캠페인 수정 중 오류가 발생했습니다.");
    }

    return campaign;
  }

  /**
   * 캠페인을 삭제합니다.
   */
  static async deleteCampaign(id: string): Promise<void> {
    const supabase = await createClient();
    const userId = await this.getUserProfileId();

    const { error } = await supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting campaign:", error);
      throw new Error("캠페인 삭제 중 오류가 발생했습니다.");
    }
  }

  /**
   * 캠페인에 링크를 추가합니다.
   */
  static async addLinkToCampaign(
    campaignId: string,
    linkId: string
  ): Promise<void> {
    const supabase = await createClient();
    const userId = await this.getUserProfileId();

    // 캠페인 소유권 확인
    const { data: campaign } = await supabase
      .from(this.TABLE_NAME)
      .select("id")
      .eq("id", campaignId)
      .eq("user_id", userId)
      .single();

    if (!campaign) {
      throw new Error("캠페인을 찾을 수 없습니다.");
    }

    const { error } = await supabase.from(this.CAMPAIGN_LINKS_TABLE).insert({
      campaign_id: campaignId,
      link_id: linkId,
    });

    if (error) {
      if (error.code === "23505") {
        throw new Error("이미 캠페인에 추가된 링크입니다.");
      }
      console.error("Error adding link to campaign:", error);
      throw new Error("링크 추가 중 오류가 발생했습니다.");
    }
  }

  /**
   * 캠페인에서 링크를 제거합니다.
   */
  static async removeLinkFromCampaign(
    campaignId: string,
    linkId: string
  ): Promise<void> {
    const supabase = await createClient();
    const userId = await this.getUserProfileId();

    // 캠페인 소유권 확인
    const { data: campaign } = await supabase
      .from(this.TABLE_NAME)
      .select("id")
      .eq("id", campaignId)
      .eq("user_id", userId)
      .single();

    if (!campaign) {
      throw new Error("캠페인을 찾을 수 없습니다.");
    }

    const { error } = await supabase
      .from(this.CAMPAIGN_LINKS_TABLE)
      .delete()
      .eq("campaign_id", campaignId)
      .eq("link_id", linkId);

    if (error) {
      console.error("Error removing link from campaign:", error);
      throw new Error("링크 제거 중 오류가 발생했습니다.");
    }
  }

  /**
   * 사용자의 모든 링크 중 특정 캠페인에 추가되지 않은 링크들을 조회합니다.
   */
  static async getAvailableLinksForCampaign(campaignId: string): Promise<Link[]> {
    const supabase = await createClient();
    const userId = await this.getUserProfileId();

    // 이미 캠페인에 추가된 링크 ID 조회
    const { data: campaignLinks } = await supabase
      .from(this.CAMPAIGN_LINKS_TABLE)
      .select("link_id")
      .eq("campaign_id", campaignId);

    const existingLinkIds = campaignLinks?.map((cl) => cl.link_id) || [];

    // 사용자의 모든 링크 조회 (이미 추가된 링크 제외)
    let query = supabase
      .from("links")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (existingLinkIds.length > 0) {
      query = query.not("id", "in", `(${existingLinkIds.join(",")})`);
    }

    const { data: links, error } = await query;

    if (error) {
      console.error("Error fetching available links:", error);
      throw new Error("링크 목록 조회 중 오류가 발생했습니다.");
    }

    return links || [];
  }
}
