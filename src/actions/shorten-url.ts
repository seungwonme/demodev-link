"use server";

import { LinkService } from "@/services/link.service";
import { CreateLinkDTO, LinkResponse } from "@/types/link";

export async function shortenUrl(data: CreateLinkDTO): Promise<LinkResponse> {
  try {
    const link = await LinkService.createShortLink(data);
    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${link.slug}`;

    return {
      shortUrl,
      originalUrl: link.original_url,
    };
  } catch (error) {
    console.error("Error shortening URL:", error);
    throw new Error("URL을 단축하는 중 오류가 발생했습니다.");
  }
}
