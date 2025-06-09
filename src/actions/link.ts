"use server";

import { createClient } from "@/lib/supabase/server";
import { Link, DailyClickStats } from "@/types/supabase";

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
): Promise<DailyClickStats[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("link_clicks")
    .select("clicked_at")
    .eq("link_id", linkId)
    .order("clicked_at", { ascending: true });

  if (error) throw error;

  // 클릭 데이터를 일별로 집계
  const dailyStats = data.reduce((acc: { [key: string]: number }, click) => {
    const date = new Date(click.clicked_at).toISOString().split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(dailyStats).map(([date, clicks]) => ({
    date,
    clicks,
  }));
}
