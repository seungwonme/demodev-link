import { supabase } from "@/libs/supabase";
import { CreateLinkDTO, Link } from "@/types/link";
import { nanoid } from "nanoid";

export class LinkService {
  private static TABLE_NAME = "links";

  static async createShortLink(data: CreateLinkDTO): Promise<Link> {
    const slug = nanoid(6); // 6자리 랜덤 문자열 생성

    const { data: link, error } = await supabase
      .from(this.TABLE_NAME)
      .insert([
        {
          slug,
          original_url: data.original_url,
          click_count: 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return link;
  }

  static async getLinkBySlug(slug: string): Promise<Link | null> {
    const { data: link } = await supabase
      .from(this.TABLE_NAME)
      .select()
      .eq("slug", slug)
      .single();

    return link;
  }

  static async incrementClickCount(slug: string): Promise<void> {
    // 먼저 현재 click_count를 가져옵니다
    const { data: link } = await supabase
      .from(this.TABLE_NAME)
      .select("click_count")
      .eq("slug", slug)
      .single();

    if (!link) return;

    // click_count를 1 증가시킵니다
    await supabase
      .from(this.TABLE_NAME)
      .update({ click_count: (link.click_count || 0) + 1 })
      .eq("slug", slug);
  }
}
