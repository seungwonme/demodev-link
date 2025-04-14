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
import { supabase } from "@/libs/supabase";

interface ClickData {
  slug: string;
  click_count: number;
  original_url: string;
}

export default function ClickAnalytics() {
  const [data, setData] = useState<ClickData[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  if (loading) {
    return <div className="text-center">데이터를 불러오는 중...</div>;
  }

  return (
    <div className="w-full h-[400px] p-4 bg-white rounded-lg shadow-sm border border-neutral-200">
      <h2 className="text-2xl font-bold mb-4 text-neutral-900">
        상위 10개 링크 클릭 수
      </h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis
            dataKey="slug"
            tick={{ fontSize: 12, fill: "#171717" }}
            interval={0}
            angle={-45}
            textAnchor="end"
          />
          <YAxis tick={{ fill: "#171717" }} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as ClickData;
                return (
                  <div className="bg-white border border-neutral-200 rounded shadow-sm p-2">
                    <p className="font-bold text-neutral-900">{data.slug}</p>
                    <p className="text-sm text-neutral-600">
                      {data.original_url}
                    </p>
                    <p className="text-neutral-900">
                      클릭 수: {data.click_count}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="click_count" fill="#4F46E5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
