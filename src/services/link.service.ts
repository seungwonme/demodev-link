import { supabase } from "@/libs/supabase";
import { CreateLinkDTO, Link } from "@/types/link";

export class LinkService {
  private static TABLE_NAME = "links";

  static async createShortLink(data: CreateLinkDTO): Promise<Link> {
    let slug: string = Snowflake.generate();

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

class Snowflake {
  private static EPOCH = 1609459200000; // 2021-01-01 기준
  private static WORKER_ID = 0;
  private static SEQUENCE = 0;
  private static LAST_TIMESTAMP = -1;

  // Base62 문자셋 (0-9, a-z, A-Z)
  private static BASE62 =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

  static generate(): string {
    let timestamp = Date.now() - this.EPOCH;

    if (timestamp < this.LAST_TIMESTAMP) {
      throw new Error("Clock moved backwards!");
    }

    if (timestamp === this.LAST_TIMESTAMP) {
      this.SEQUENCE = (this.SEQUENCE + 1) & 4095; // 12비트 시퀀스
      if (this.SEQUENCE === 0) {
        timestamp = this.tilNextMillis(this.LAST_TIMESTAMP);
      }
    } else {
      this.SEQUENCE = 0;
    }

    this.LAST_TIMESTAMP = timestamp;

    const id =
      (BigInt(timestamp) << BigInt(22)) |
      (BigInt(this.WORKER_ID) << BigInt(12)) | // 고정된 WORKER_ID 사용
      BigInt(this.SEQUENCE);

    return this.toBase62(id);
  }

  private static tilNextMillis(lastTimestamp: number): number {
    let timestamp = Date.now() - this.EPOCH;
    while (timestamp <= lastTimestamp) {
      timestamp = Date.now() - this.EPOCH;
    }
    return timestamp;
  }

  private static toBase62(num: bigint): string {
    if (num === BigInt(0)) {
      return "0"; // 0 처리
    }
    let result = "";
    let value = num;
    while (value > BigInt(0)) {
      result = this.BASE62[Number(value % BigInt(62))] + result;
      value = value / BigInt(62);
    }
    return result;
  }
}
