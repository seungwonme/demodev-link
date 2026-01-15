"use client";

import { useState, useEffect } from "react";
import { getMarketingAnalytics, getAllLinksForAnalytics } from "@/features/analytics/actions/get-analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Progress } from "@/shared/components/ui/progress";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  MousePointer,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Calendar,
  ArrowRight
} from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { cn } from "@/lib/utils";
import { getBaseUrl } from "@/lib/url";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface MarketingAnalyticsProps {
  linkId?: string;
}

interface AnalyticsData {
  totalClicks: number;
  uniqueClicks: number;
  clicksByHour: { hour: number; clicks: number }[];
  clicksByDevice: { device: string; clicks: number }[];
  clicksByCountry: { country: string; clicks: number }[];
  conversionRate: number;
  avgClicksPerDay: number;
  clickTrend: 'up' | 'down' | 'stable';
}

interface LinkData {
  id: string;
  slug: string;
  original_url: string;
  description?: string | null;
  created_at: string;
  click_count: number;
  period_clicks?: number;
  user_id: string | null;
}

type DateRangePreset = '7d' | '30d' | '3m' | '6m' | 'all' | 'custom';

export default function MarketingAnalytics({ linkId: propLinkId }: MarketingAnalyticsProps) {
  const [selectedLinkId, setSelectedLinkId] = useState<string>(propLinkId || "");
  const [links, setLinks] = useState<LinkData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const getDateRange = (): { startDate?: string; endDate?: string } | undefined => {
    const now = new Date();
    const endDate = now.toISOString();

    switch (dateRangePreset) {
      case '7d': {
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        return { startDate: startDate.toISOString(), endDate };
      }
      case '30d': {
        const startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        return { startDate: startDate.toISOString(), endDate };
      }
      case '3m': {
        const startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 3);
        return { startDate: startDate.toISOString(), endDate };
      }
      case '6m': {
        const startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 6);
        return { startDate: startDate.toISOString(), endDate };
      }
      case 'custom': {
        if (customStartDate && customEndDate) {
          return {
            startDate: new Date(customStartDate).toISOString(),
            endDate: new Date(customEndDate).toISOString(),
          };
        }
        return undefined;
      }
      case 'all':
      default:
        return undefined;
    }
  };

  const fetchLinks = async () => {
    const dateRange = getDateRange();
    const result = await getAllLinksForAnalytics(
      dateRange ? { startDate: dateRange.startDate, endDate: dateRange.endDate } : undefined
    );
    if (result.success && result.data) {
      setLinks(result.data);
      if (!propLinkId && result.data.length > 0 && !selectedLinkId) {
        setSelectedLinkId(result.data[0].id);
      }
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const dateRange = getDateRange();
      const result = await getMarketingAnalytics(selectedLinkId, dateRange);
      if (result.success && result.data) {
        setAnalytics(result.data);
      } else {
        console.error("Error fetching analytics:", result.error);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propLinkId, dateRangePreset, customStartDate, customEndDate]);

  useEffect(() => {
    if (selectedLinkId) {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLinkId, dateRangePreset, customStartDate, customEndDate]);

  if (!selectedLinkId || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-muted-foreground animate-pulse">데이터를 분석하고 있습니다...</p>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const hourlyChartData = {
    labels: analytics.clicksByHour.map((h) => `${h.hour}시`),
    datasets: [
      {
        label: "시간대별 클릭 수",
        data: analytics.clicksByHour.map((h) => h.clicks),
        backgroundColor: "rgba(46, 108, 255, 0.1)", // Primary color with opacity
        borderColor: "#2E6CFF", // Primary color
        borderWidth: 2,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const deviceChartData = {
    labels: analytics.clicksByDevice.map((d) =>
      d.device === "Desktop" ? "데스크톱" :
        d.device === "Mobile" ? "모바일" :
          d.device === "Tablet" ? "태블릿" : "기타"
    ),
    datasets: [
      {
        data: analytics.clicksByDevice.map((d) => d.clicks),
        backgroundColor: [
          "#2E6CFF", // Primary
          "#10B981", // Emerald
          "#F59E0B", // Amber
          "#8B5CF6", // Violet
        ],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        border: {
          display: false,
        }
      },
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        }
      }
    },
  };

  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
        }
      },
    },
    cutout: "70%",
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-rose-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "Desktop":
        return <Monitor className="h-4 w-4" />;
      case "Mobile":
        return <Smartphone className="h-4 w-4" />;
      case "Tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Link Selector */}
      {!propLinkId && (
        <div className="mb-8">
          <Select value={selectedLinkId} onValueChange={setSelectedLinkId}>
            <SelectTrigger className="w-full max-w-md h-12 bg-white dark:bg-white/5 border-black/5 dark:border-white/10 shadow-sm rounded-xl">
              <SelectValue placeholder="분석할 링크를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {links.map((link) => (
                <SelectItem key={link.id} value={link.id}>
                  <div className="flex flex-col py-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{link.description || '제목 없음'}</span>
                      {link.slug && <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">/{link.slug}</span>}
                    </div>
                    <span className="text-xs text-muted-foreground mt-0.5 truncate max-w-[300px]">
                      {link.original_url}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Date Range Selector */}
      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white dark:bg-white/5 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            날짜 범위 선택
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {[
                { key: '7d', label: '최근 7일' },
                { key: '30d', label: '최근 30일' },
                { key: '3m', label: '최근 3개월' },
                { key: '6m', label: '최근 6개월' },
                { key: 'all', label: '전체 기간' },
                { key: 'custom', label: '사용자 정의' },
              ].map((range) => (
                <Button
                  key={range.key}
                  variant={dateRangePreset === range.key ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDateRangePreset(range.key as DateRangePreset)}
                  className={cn(
                    "rounded-full px-4 text-xs font-medium transition-all duration-300",
                    dateRangePreset === range.key
                      ? "shadow-md shadow-primary/20"
                      : "bg-muted/30 hover:bg-muted text-muted-foreground"
                  )}
                >
                  {range.label}
                </Button>
              ))}
            </div>

            {/* Custom Date Range Inputs */}
            {dateRangePreset === 'custom' && (
              <div className="flex items-end gap-4 p-4 rounded-xl bg-muted/20 border border-black/5 dark:border-white/5 animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground ml-1">시작일</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="h-10 px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="h-10 flex items-center text-muted-foreground">
                  <ArrowRight className="h-4 w-4" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground ml-1">종료일</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="h-10 px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}

            {/* Display Selected Range */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 w-fit px-3 py-1.5 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {dateRangePreset === 'all' && '전체 데이터를 표시합니다'}
              {dateRangePreset === '7d' && '최근 7일 데이터를 표시합니다'}
              {dateRangePreset === '30d' && '최근 30일 데이터를 표시합니다'}
              {dateRangePreset === '3m' && '최근 3개월 데이터를 표시합니다'}
              {dateRangePreset === '6m' && '최근 6개월 데이터를 표시합니다'}
              {dateRangePreset === 'custom' && customStartDate && customEndDate &&
                `${customStartDate} ~ ${customEndDate} 데이터를 표시합니다`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Link Info */}
      {selectedLinkId && (() => {
        const currentLink = links.find(l => l.id === selectedLinkId);
        if (!currentLink) return null;

        return (
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white dark:bg-white/5 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold">선택된 링크 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/20 p-5 rounded-xl border border-black/5 dark:border-white/5">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</span>
                  <p className="text-base font-medium text-foreground">{currentLink.description || '설명 없음'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Short URL</span>
                  <p className="text-base font-medium text-primary flex items-center gap-1 hover:underline cursor-pointer">
                    {getBaseUrl()}/{currentLink.slug}
                    <ArrowRight className="h-3 w-3 -rotate-45" />
                  </p>
                </div>
                <div className="col-span-1 md:col-span-2 space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Original Destination</span>
                  <p className="text-sm text-muted-foreground break-all bg-white dark:bg-black/10 p-2 rounded border border-black/5 dark:border-white/5 font-mono">
                    {currentLink.original_url}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white dark:bg-white/5 backdrop-blur-xl hover:-translate-y-1 transition-transform cursor-default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 클릭 수</CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
              <MousePointer className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{analytics.totalClicks.toLocaleString()}</div>
            <div className="flex items-center mt-2 p-1 px-2 rounded-md bg-muted/50 w-fit">
              {getTrendIcon(analytics.clickTrend)}
              <span className="text-xs font-medium ml-1.5">
                {analytics.clickTrend === "up" ? "상승 추세" :
                  analytics.clickTrend === "down" ? "하락 추세" : "변동 없음"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white dark:bg-white/5 backdrop-blur-xl hover:-translate-y-1 transition-transform cursor-default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">고유 방문자</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">{analytics.uniqueClicks.toLocaleString()}</div>
            <div className="mt-3">
              <Progress
                value={(analytics.uniqueClicks / Math.max(analytics.totalClicks, 1)) * 100}
                className="h-1.5"
              // indicatorClassName="bg-emerald-500" // Requires custom progress component usually
              />
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-2 flex items-center">
              <span className="text-emerald-500 mr-1.5">{analytics.conversionRate.toFixed(1)}%</span> 전환율
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white dark:bg-white/5 backdrop-blur-xl hover:-translate-y-1 transition-transform cursor-default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">일 평균 클릭</CardTitle>
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {analytics.avgClicksPerDay.toFixed(1)}
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-2">
              하루 평균 클릭 수
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white dark:bg-white/5 backdrop-blur-xl hover:-translate-y-1 transition-transform cursor-default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">최적 시간대</CardTitle>
            <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-foreground">
              {analytics.clicksByHour.length > 0 ? analytics.clicksByHour.reduce((max, current) =>
                current.clicks > max.clicks ? current : max
              ).hour + "시" : "-"}
            </div>
            <p className="text-xs font-medium text-muted-foreground mt-2">
              가장 많은 클릭이 발생하는 시간
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Clicks Chart */}
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white dark:bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500">
                <Clock className="h-5 w-5" />
              </div>
              시간대별 클릭 분포
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <Line data={hourlyChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white dark:bg-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-500">
                <Smartphone className="h-5 w-5" />
              </div>
              디바이스별 클릭 분포
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4 flex justify-center">
              <Doughnut data={deviceChartData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Details */}
      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white dark:bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold">디바이스별 상세 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.clicksByDevice.map((device) => {
              const percentage = (device.clicks / Math.max(analytics.totalClicks, 1)) * 100;
              return (
                <div key={device.device} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 w-32">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                      {getDeviceIcon(device.device)}
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {device.device === "Desktop" ? "데스크톱" :
                        device.device === "Mobile" ? "모바일" :
                          device.device === "Tablet" ? "태블릿" : "기타"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="h-2.5 w-full bg-muted/40 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-right">
                    <span className="block text-sm font-bold text-foreground">{device.clicks}</span>
                    <span className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Geographic Distribution (Sample Data) */}
      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white dark:bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
              <Globe className="h-5 w-5" />
            </div>
            지역별 클릭 분포
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.clicksByCountry.map((country) => {
              const percentage = (country.clicks / Math.max(analytics.totalClicks, 1)) * 100;
              return (
                <div key={country.country} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors border border-transparent hover:border-muted">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="px-2 py-1 text-sm">{country.country}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-2.5 bg-muted/40 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="text-sm font-medium w-20 text-right">
                      {country.clicks} <span className="text-muted-foreground text-xs font-normal">({percentage.toFixed(1)}%)</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-6 text-right bg-muted/30 p-2 rounded-md inline-block float-right">
            * 지역 데이터는 샘플 데이터입니다. 실제 구현 시 IP 기반 지역 분석이 필요합니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}