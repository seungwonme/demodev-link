"use server";

import { revalidatePath } from "next/cache";
import { CampaignService } from "../services/campaign.service";
import { LinkService } from "@/features/links/actions/link.service";
import type { CreateCampaignDTO, UpdateCampaignDTO } from "../types/campaign";
import type { CreateLinkDTO } from "@/shared/types/link";
import type { LinkTemplate } from "@/features/templates/types/template";

export async function createCampaign(data: CreateCampaignDTO) {
  try {
    const campaign = await CampaignService.createCampaign(data);
    revalidatePath("/admin/campaigns");
    return { success: true, data: campaign };
  } catch (error) {
    console.error("Create campaign error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "캠페인 생성에 실패했습니다.",
    };
  }
}

export async function getCampaign(id: string) {
  try {
    const campaign = await CampaignService.getCampaignById(id);
    return { success: true, data: campaign };
  } catch (error) {
    console.error("Get campaign error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "캠페인 조회에 실패했습니다.",
    };
  }
}

export async function getCampaignWithLinks(id: string) {
  try {
    const campaign = await CampaignService.getCampaignWithLinks(id);
    return { success: true, data: campaign };
  } catch (error) {
    console.error("Get campaign with links error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "캠페인 조회에 실패했습니다.",
    };
  }
}

export async function getCampaigns() {
  try {
    const campaigns = await CampaignService.getCampaignsWithStats();
    return { success: true, data: campaigns };
  } catch (error) {
    console.error("Get campaigns error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "캠페인 목록 조회에 실패했습니다.",
    };
  }
}

export async function updateCampaign(id: string, data: UpdateCampaignDTO) {
  try {
    const campaign = await CampaignService.updateCampaign(id, data);
    revalidatePath("/admin/campaigns");
    revalidatePath(`/admin/campaigns/${id}`);
    return { success: true, data: campaign };
  } catch (error) {
    console.error("Update campaign error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "캠페인 수정에 실패했습니다.",
    };
  }
}

export async function deleteCampaign(id: string) {
  try {
    await CampaignService.deleteCampaign(id);
    revalidatePath("/admin/campaigns");
    return { success: true };
  } catch (error) {
    console.error("Delete campaign error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "캠페인 삭제에 실패했습니다.",
    };
  }
}

export async function addLinkToCampaign(campaignId: string, linkId: string) {
  try {
    await CampaignService.addLinkToCampaign(campaignId, linkId);
    revalidatePath(`/admin/campaigns/${campaignId}`);
    return { success: true };
  } catch (error) {
    console.error("Add link to campaign error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "링크 추가에 실패했습니다.",
    };
  }
}

export async function removeLinkFromCampaign(
  campaignId: string,
  linkId: string
) {
  try {
    await CampaignService.removeLinkFromCampaign(campaignId, linkId);
    revalidatePath(`/admin/campaigns/${campaignId}`);
    return { success: true };
  } catch (error) {
    console.error("Remove link from campaign error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "링크 제거에 실패했습니다.",
    };
  }
}

export async function getAvailableLinks(campaignId: string) {
  try {
    const links = await CampaignService.getAvailableLinksForCampaign(campaignId);
    return { success: true, data: links };
  } catch (error) {
    console.error("Get available links error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "링크 목록 조회에 실패했습니다.",
    };
  }
}

export async function createAndAddLinkToCampaign(
  campaignId: string,
  linkData: CreateLinkDTO
) {
  try {
    // 링크 생성
    const link = await LinkService.createShortLink(linkData);

    // 캠페인에 추가
    await CampaignService.addLinkToCampaign(campaignId, link.id);

    revalidatePath(`/admin/campaigns/${campaignId}`);
    return { success: true, data: link };
  } catch (error) {
    console.error("Create and add link to campaign error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "링크 생성 및 추가에 실패했습니다.",
    };
  }
}

export async function createLinksFromTemplatesAndAddToCampaign(
  campaignId: string,
  templates: LinkTemplate[],
  campaignUtmParams: {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_term: string;
    utm_content: string;
  }
) {
  try {
    const createdLinks = [];

    for (const template of templates) {
      // 템플릿 UTM과 캠페인 UTM 병합 (템플릿 값이 있으면 템플릿 우선, 없으면 캠페인 UTM 사용)
      const linkData: CreateLinkDTO = {
        original_url: template.original_url,
        description: template.description || undefined,
        utm_params: {
          utm_source: template.utm_source || campaignUtmParams.utm_source,
          utm_medium: template.utm_medium || campaignUtmParams.utm_medium,
          utm_campaign: template.utm_campaign || campaignUtmParams.utm_campaign,
          utm_term: template.utm_term || campaignUtmParams.utm_term,
          utm_content: template.utm_content || campaignUtmParams.utm_content,
        },
      };

      // 링크 생성
      const link = await LinkService.createShortLink(linkData);

      // 캠페인에 추가
      await CampaignService.addLinkToCampaign(campaignId, link.id);

      createdLinks.push(link);
    }

    revalidatePath(`/admin/campaigns/${campaignId}`);
    return { success: true, data: createdLinks };
  } catch (error) {
    console.error("Create links from templates and add to campaign error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "템플릿에서 링크 생성 및 추가에 실패했습니다.",
    };
  }
}
