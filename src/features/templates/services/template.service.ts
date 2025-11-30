import { createClient } from "@/lib/supabase/server";
import { ClerkAuthService } from "@/features/auth/services/clerk-auth.service";
import type {
  LinkTemplate,
  CreateTemplateDTO,
  UpdateTemplateDTO,
} from "../types/template";

export class TemplateService {
  private static TABLE_NAME = "link_templates";

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
   * 템플릿을 생성합니다.
   */
  static async createTemplate(data: CreateTemplateDTO): Promise<LinkTemplate> {
    const supabase = await createClient();
    const userId = await this.getUserProfileId();

    const { data: template, error } = await supabase
      .from(this.TABLE_NAME)
      .insert({
        user_id: userId,
        name: data.name,
        original_url: data.original_url,
        description: data.description || null,
        utm_source: data.utm_params?.utm_source || null,
        utm_medium: data.utm_params?.utm_medium || null,
        utm_campaign: data.utm_params?.utm_campaign || null,
        utm_term: data.utm_params?.utm_term || null,
        utm_content: data.utm_params?.utm_content || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating template:", error);
      throw new Error("템플릿 생성 중 오류가 발생했습니다.");
    }

    return template;
  }

  /**
   * ID로 템플릿을 조회합니다.
   */
  static async getTemplateById(id: string): Promise<LinkTemplate | null> {
    const supabase = await createClient();
    const userId = await this.getUserProfileId();

    const { data: template, error } = await supabase
      .from(this.TABLE_NAME)
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      console.error("Error fetching template:", error);
      throw new Error("템플릿 조회 중 오류가 발생했습니다.");
    }

    return template;
  }

  /**
   * 현재 사용자의 모든 템플릿을 조회합니다.
   */
  static async getTemplatesByUser(): Promise<LinkTemplate[]> {
    const supabase = await createClient();
    const userId = await this.getUserProfileId();

    const { data: templates, error } = await supabase
      .from(this.TABLE_NAME)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching templates:", error);
      throw new Error("템플릿 목록 조회 중 오류가 발생했습니다.");
    }

    return templates || [];
  }

  /**
   * 템플릿을 수정합니다.
   */
  static async updateTemplate(
    id: string,
    data: UpdateTemplateDTO
  ): Promise<LinkTemplate> {
    const supabase = await createClient();
    const userId = await this.getUserProfileId();

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.original_url !== undefined)
      updateData.original_url = data.original_url;
    if (data.description !== undefined)
      updateData.description = data.description || null;

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

    const { data: template, error } = await supabase
      .from(this.TABLE_NAME)
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating template:", error);
      throw new Error("템플릿 수정 중 오류가 발생했습니다.");
    }

    return template;
  }

  /**
   * 템플릿을 삭제합니다.
   */
  static async deleteTemplate(id: string): Promise<void> {
    const supabase = await createClient();
    const userId = await this.getUserProfileId();

    const { error } = await supabase
      .from(this.TABLE_NAME)
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting template:", error);
      throw new Error("템플릿 삭제 중 오류가 발생했습니다.");
    }
  }
}
