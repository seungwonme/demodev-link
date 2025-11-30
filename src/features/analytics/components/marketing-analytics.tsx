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
  Calendar
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
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgb(59, 130, 246)",
        borderWidth: 2,
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
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(147, 51, 234, 0.8)",
        ],
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
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
    },
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "down":
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
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
    <div className="space-y-6">
      {/* Link Selector */}
      {!propLinkId && (
        <div className="mb-6">
          <Select value={selectedLinkId} onValueChange={setSelectedLinkId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="분석할 링크를 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {links.map((link) => (
                <SelectItem key={link.id} value={link.id}>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span>{link.description || link.original_url}</span>
                      <Badge variant="secondary" className="text-xs">
                        {link.period_clicks ?? link.click_count} 클릭
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {link.slug} - {link.original_url}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            날짜 범위 선택
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={dateRangePreset === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRangePreset('7d')}
              >
                최근 7일
              </Button>
              <Button
                variant={dateRangePreset === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRangePreset('30d')}
              >
                최근 30일
              </Button>
              <Button
                variant={dateRangePreset === '3m' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRangePreset('3m')}
              >
                최근 3개월
              </Button>
              <Button
                variant={dateRangePreset === '6m' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRangePreset('6m')}
              >
                최근 6개월
              </Button>
              <Button
                variant={dateRangePreset === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRangePreset('all')}
              >
                전체 기간
              </Button>
              <Button
                variant={dateRangePreset === 'custom' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRangePreset('custom')}
              >
                사용자 정의
              </Button>
            </div>

            {/* Custom Date Range Inputs */}
            {dateRangePreset === 'custom' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">시작일</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">종료일</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            )}

            {/* Display Selected Range */}
            <div className="text-sm text-muted-foreground">
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">링크 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">설명: </span>
                  <span className="text-sm">{currentLink.description || '설명 없음'}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">URL: </span>
                  <span className="text-sm text-muted-foreground">{currentLink.original_url}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">단축 주소: </span>
                  <span className="text-sm text-muted-foreground">{window.location.origin}/{currentLink.slug}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 클릭 수</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClicks}</div>
            <div className="flex items-center mt-2">
              {getTrendIcon(analytics.clickTrend)}
              <span className="text-xs text-muted-foreground ml-1">
                {analytics.clickTrend === "up" ? "상승 추세" : 
                 analytics.clickTrend === "down" ? "하락 추세" : "안정적"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">고유 방문자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueClicks}</div>
            <Progress 
              value={(analytics.uniqueClicks / analytics.totalClicks) * 100} 
              className="mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              전환율: {analytics.conversionRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">일 평균 클릭</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.avgClicksPerDay.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              하루 평균 클릭 수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">최적 시간대</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.clicksByHour.reduce((max, current) => 
                current.clicks > max.clicks ? current : max
              ).hour}시
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              가장 많은 클릭 시간
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Clicks Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              시간대별 클릭 분포
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Line data={hourlyChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>디바이스별 클릭 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut data={deviceChartData} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Details */}
      <Card>
        <CardHeader>
          <CardTitle>디바이스별 상세 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.clicksByDevice.map((device) => {
              const percentage = (device.clicks / analytics.totalClicks) * 100;
              return (
                <div key={device.device} className="flex items-center space-x-4">
                  <div className="flex items-center gap-2 w-24">
                    {getDeviceIcon(device.device)}
                    <span className="text-sm font-medium">
                      {device.device === "Desktop" ? "데스크톱" : 
                       device.device === "Mobile" ? "모바일" : 
                       device.device === "Tablet" ? "태블릿" : "기타"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <Progress value={percentage} />
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-sm font-medium">{device.clicks} 클릭</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Geographic Distribution (Sample Data) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            지역별 클릭 분포
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.clicksByCountry.map((country) => {
              const percentage = (country.clicks / analytics.totalClicks) * 100;
              return (
                <div key={country.country} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{country.country}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <Progress value={percentage} className="w-32" />
                    <span className="text-sm font-medium w-20 text-right">
                      {country.clicks} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            * 지역 데이터는 샘플 데이터입니다. 실제 구현 시 IP 기반 지역 분석이 필요합니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}