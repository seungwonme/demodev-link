"use server";

import { LinkService } from "@/features/links/actions/link.service";

export async function getMarketingAnalytics(
  linkId: string,
  dateRange?: { startDate?: string; endDate?: string }
) {
  try {
    const parsedDateRange = dateRange
      ? {
          startDate: dateRange.startDate ? new Date(dateRange.startDate) : undefined,
          endDate: dateRange.endDate ? new Date(dateRange.endDate) : undefined,
        }
      : undefined;

    const analytics = await LinkService.getMarketingAnalytics(linkId, parsedDateRange);
    return { success: true, data: analytics };
  } catch (error) {
    console.error("Error getting marketing analytics:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch analytics"
    };
  }
}

export async function getAllLinksForAnalytics(
  dateRange?: { startDate?: string; endDate?: string }
) {
  try {
    const parsedDateRange = dateRange
      ? {
          startDate: dateRange.startDate ? new Date(dateRange.startDate) : undefined,
          endDate: dateRange.endDate ? new Date(dateRange.endDate) : undefined,
        }
      : undefined;

    const links = await LinkService.getAllLinksWithPeriodClicks(parsedDateRange);
    return { success: true, data: links };
  } catch (error) {
    console.error("Error getting links:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch links"
    };
  }
}