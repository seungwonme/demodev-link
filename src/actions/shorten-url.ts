"use server";

import { LinkService } from "@/services/link.service";
import { CreateLinkDTO, LinkResponse } from "@/types/link";
import { createClient } from "@/lib/supabase/server";

export async function shortenUrl(data: CreateLinkDTO): Promise<LinkResponse> {
  try {
    const supabase = await createClient();
    
    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 로그인되지 않은 경우 오류 반환
    if (!user) {
      throw new Error("URL 단축 기능은 로그인 후 이용 가능합니다.");
    }

    const link = await LinkService.createShortLink(data);
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
