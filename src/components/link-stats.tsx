"use client";

import { useEffect, useState } from "react";
import { DailyClickStats } from "@/types/supabase";
import { getLinkClickStats } from "@/actions/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LinkStatsProps {
  linkId: string;
}

export default function LinkStats({ linkId }: LinkStatsProps) {
  const [stats, setStats] = useState<DailyClickStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getLinkClickStats(linkId);
        setStats(data);
      } catch (error) {
        console.error("통계를 불러오는데 실패했습니다:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [linkId]);

  if (loading) {
    return <div className="text-center py-4">로딩 중...</div>;
  }

  if (stats.length === 0) {
    return <div className="text-center py-4">아직 클릭 데이터가 없습니다.</div>;
  }

  // Format data to ensure proper date handling
  const formattedStats = stats.map(stat => ({
    ...stat,
    date: new Date(stat.date).toISOString().split('T')[0]
  }));

  return (
    <div className="w-full">
      <h3 className="mb-4 text-lg font-semibold">일별 클릭 추이</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedStats}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
            formatter={(value: number) => [`${value}회 클릭`]}
          />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: "#2563eb" }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
