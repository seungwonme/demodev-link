"use client";

import { useEffect, useState, useMemo } from "react";
import { DailyClickStats } from "@/shared/types/link";
import { getLinkClickStats } from "@/features/links/actions/link-actions";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MousePointerClick, Users } from "lucide-react";

interface LinkStatsProps {
  linkId: string;
  dateRange?: { startDate?: string; endDate?: string };
}

export default function LinkStats({ linkId, dateRange }: LinkStatsProps) {
  const [stats, setStats] = useState<DailyClickStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await getLinkClickStats(linkId, dateRange);
        setStats(data);
      } catch (error) {
        console.error("통계를 불러오는데 실패했습니다:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkId, dateRange?.startDate, dateRange?.endDate]);

  // 총 클릭 수 및 고유 방문자 수 계산
  const totals = useMemo(() => {
    return stats.reduce(
      (acc, stat) => ({
        totalClicks: acc.totalClicks + stat.clicks,
        totalUniqueVisitors: acc.totalUniqueVisitors + stat.uniqueVisitors,
      }),
      { totalClicks: 0, totalUniqueVisitors: 0 }
    );
  }, [stats]);

  if (loading) {
    return <div className="text-center py-4">로딩 중...</div>;
  }

  if (stats.length === 0) {
    return <div className="text-center py-4">아직 클릭 데이터가 없습니다.</div>;
  }

  // Format data to ensure proper date handling
  const formattedStats = stats.map((stat) => ({
    ...stat,
    date: new Date(stat.date).toISOString().split("T")[0],
  }));

  return (
    <div className="w-full space-y-4">
      <h3 className="text-lg font-semibold">일별 클릭 추이</h3>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <MousePointerClick className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">총 클릭</p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {totals.totalClicks.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
          <div className="p-2 rounded-lg bg-green-500/10">
            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">고유 방문자</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {totals.totalUniqueVisitors.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 차트 */}
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
              formatter={(value: number, name: string) => [
                `${value.toLocaleString()}`,
                name === "clicks" ? "클릭" : "고유 방문자",
              ]}
            />
            <Legend
              formatter={(value) =>
                value === "clicks" ? "클릭" : "고유 방문자"
              }
            />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: "#2563eb" }}
            />
            <Line
              type="monotone"
              dataKey="uniqueVisitors"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ fill: "#16a34a" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
