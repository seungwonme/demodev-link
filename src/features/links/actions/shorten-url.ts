"use server";

import { LinkService } from "@/features/links/actions/link.service";
import { CreateLinkDTO, LinkResponse } from "@/shared/types/link";
import { ClerkAuthService } from "@/features/auth/services/clerk-auth.service";

export async function shortenUrl(data: CreateLinkDTO): Promise<LinkResponse> {
  try {
    const user = await ClerkAuthService.requireAuth({ requiredStatus: "approved" });

    const link = await LinkService.createShortLink(data, undefined, user.userId);
    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${link.slug}`;

    return {
      shortUrl,
      originalUrl: link.original_url,
    };
  } catch (error) {
    console.error("Error shortening URL:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("URL을 단축하는 중 오류가 발생했습니다.");
  }
}
