"use server";

import { LinkService } from "@/features/links/actions/link.service";

export async function getMarketingAnalytics(linkId: string) {
  try {
    const analytics = await LinkService.getMarketingAnalytics(linkId);
    return { success: true, data: analytics };
  } catch (error) {
    console.error("Error getting marketing analytics:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch analytics" 
    };
  }
}

export async function getAllLinksForAnalytics() {
  try {
    const links = await LinkService.getAllLinks();
    return { success: true, data: links };
  } catch (error) {
    console.error("Error getting links:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch links" 
    };
  }
}