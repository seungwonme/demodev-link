"use server";

import { LinkService } from "@/features/links/actions/link.service";
import { revalidatePath } from "next/cache";

export async function deleteLink(linkId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await LinkService.deleteLink(linkId);
    
    // Revalidate the links pages to reflect the deletion
    revalidatePath("/admin/links");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/analytics");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting link:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "링크 삭제 중 오류가 발생했습니다." };
  }
}