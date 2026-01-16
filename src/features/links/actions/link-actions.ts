"use server";

import { createClient } from "@/lib/supabase/server";
import { Link, DailyClickStats } from "@/shared/types/link";

export async function getTopLinks(limit: number = 10): Promise<Link[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .order("click_count", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getAllLinks(): Promise<Link[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getLinkBySlug(slug: string): Promise<Link | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data;
}

export async function trackLinkClick(
  linkId: string,
  userAgent?: string | null,
  ip?: string,
): Promise<void> {
  const supabase = await createClient();
  const [clickInsert, countUpdate] = await Promise.all([
    supabase.from("link_clicks").insert({
      link_id: linkId,
      user_agent: userAgent || null,
      ip_address: ip || "unknown",
    }),
    supabase.rpc("increment_click_count", { link_id: linkId }),
  ]);

  if (clickInsert.error) throw clickInsert.error;
  if (countUpdate.error) throw countUpdate.error;
}

export async function getLinkClickStats(
  linkId: string,
  dateRange?: { startDate?: string; endDate?: string },
): Promise<DailyClickStats[]> {
  const supabase = await createClient();

  let query = supabase
    .from("link_clicks")
    .select("clicked_at, ip_address")
    .eq("link_id", linkId);

  // 날짜 범위 필터 적용
  if (dateRange?.startDate) {
    query = query.gte("clicked_at", dateRange.startDate);
  }
  if (dateRange?.endDate) {
    query = query.lte("clicked_at", dateRange.endDate);
  }

  const { data, error } = await query.order("clicked_at", { ascending: true });

  if (error) throw error;

  // 클릭 데이터를 일별로 집계 (클릭 수 + 고유 방문자 수)
  const dailyStats = data.reduce(
    (
      acc: { [key: string]: { clicks: number; ips: Set<string> } },
      click,
    ) => {
      const date = new Date(click.clicked_at).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { clicks: 0, ips: new Set() };
      }
      acc[date].clicks += 1;
      if (click.ip_address) {
        acc[date].ips.add(click.ip_address);
      }
      return acc;
    },
    {},
  );

  return Object.entries(dailyStats).map(([date, stats]) => ({
    date,
    clicks: stats.clicks,
    uniqueVisitors: stats.ips.size,
  }));
}
