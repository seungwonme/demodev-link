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
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { BarChart3 } from "lucide-react";

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
      <div className="flex justify-center items-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white dark:bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>
            상위 10개 링크 클릭 수
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-10">아직 클릭 데이터가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white dark:bg-white/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          상위 10개 링크 클릭 수
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                vertical={false}
              />
              <XAxis
                dataKey="slug"
                tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#64748b" }}
                interval={0}
                angle={-45}
                textAnchor="end"
                axisLine={false}
                tickLine={false}
                height={60}
              />
              <YAxis
                tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ClickData;
                    return (
                      <div className="rounded-xl border border-white/20 bg-white/90 dark:bg-black/90 backdrop-blur-md p-4 shadow-xl text-foreground">
                        <p className="font-bold flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          {data.slug}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2 break-all font-mono opacity-80">
                          {data.original_url}
                        </p>
                        <p className="font-semibold text-lg text-primary">{data.click_count.toLocaleString()} 클릭</p>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
              />
              <Bar
                dataKey="click_count"
                fill="#2E6CFF"
                radius={[6, 6, 0, 0]}
                barSize={40}
                className="hover:opacity-90 transition-opacity cursor-pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
