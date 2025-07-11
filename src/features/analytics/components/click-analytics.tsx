"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";

interface ClickData {
  slug: string;
  click_count: number;
  original_url: string;
}

export default function ClickAnalytics() {
  const [data, setData] = useState<ClickData[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const supabase = createClient();

  const isDark = theme === "dark";

  useEffect(() => {
    async function fetchClickData() {
      const { data: links, error } = await supabase
        .from("links")
        .select("slug, click_count, original_url")
        .order("click_count", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching click data:", error);
        return;
      }

      setData(links);
      setLoading(false);
    }

    fetchClickData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="text-center text-muted-foreground">
        데이터를 불러오는 중...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full rounded-lg border bg-card p-8 text-card-foreground shadow-sm">
        <h2 className="mb-4 text-2xl font-bold">상위 10개 링크 클릭 수</h2>
        <p className="text-center text-muted-foreground">아직 클릭 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <h2 className="mb-4 text-2xl font-bold">상위 10개 링크 클릭 수</h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "#2D3748" : "#e5e5e5"}
          />
          <XAxis
            dataKey="slug"
            tick={{ fontSize: 12, fill: isDark ? "#E2E8F0" : "#171717" }}
            interval={0}
            angle={-45}
            textAnchor="end"
          />
          <YAxis tick={{ fill: isDark ? "#E2E8F0" : "#171717" }} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as ClickData;
                return (
                  <div className="rounded border bg-popover p-2 shadow-sm text-popover-foreground">
                    <p className="font-bold">{data.slug}</p>
                    <p className="text-sm text-muted-foreground">
                      {data.original_url}
                    </p>
                    <p>클릭 수: {data.click_count}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="click_count" fill={isDark ? "#818CF8" : "#4F46E5"} />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
