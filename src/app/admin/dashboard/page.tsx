import { redirect } from "next/navigation";
import { ClerkAuthService } from "@/features/auth/services/clerk-auth.service";
import { LinkService } from "@/features/links/actions/link.service";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Link2,
  BarChart3,
  Users,
  TrendingUp,
  Clock,
  MousePointerClick,
  Activity,
  Globe,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { DashboardErrorFallback } from "./error-fallback";
import { cn } from "@/lib/utils";

// Force dynamic rendering for authenticated server-side data
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Middleware already verified auth and approval status
  const user = await ClerkAuthService.getCurrentUser();

  // Defensive check (middleware should prevent this)
  // redirect()는 try-catch 안에서 호출하면 catch에 잡히므로 바깥에서 호출
  if (!user || user.status !== 'approved') {
    redirect('/admin/login');
  }

  try {
    const supabase = await createClient();

    // Initialize default values for graceful degradation
    let totalLinks = 0;
    let recentLinks: any[] = [];
    let totalClicks = 0;
    let todayTopLinks: any[] = [];
    let weekTopLinks: any[] = [];
    let pendingUsers = 0;
    let hasError = false;
    let errorMessage = "";

    try {
      // Get statistics with individual error handling
      const results = await Promise.allSettled([
        supabase.from("links").select("*", { count: "exact", head: true }),
        supabase
          .from("links")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("link_clicks")
          .select("*", { count: "exact", head: true }),
        LinkService.getTopClickedLinksByPeriod("today", 5),
        LinkService.getTopClickedLinksByPeriod("week", 5),
      ]);

      // Process results with error checking
      if (results[0].status === "fulfilled") {
        totalLinks = results[0].value.count || 0;
      } else {
        console.error("Failed to fetch total links:", results[0].reason);
      }

      if (results[1].status === "fulfilled") {
        recentLinks = results[1].value.data || [];
      } else {
        console.error("Failed to fetch recent links:", results[1].reason);
      }

      if (results[2].status === "fulfilled") {
        totalClicks = results[2].value.count || 0;
      } else {
        console.error("Failed to fetch total clicks:", results[2].reason);
      }

      if (results[3].status === "fulfilled") {
        todayTopLinks = results[3].value || [];
      } else {
        console.error("Failed to fetch today's top links:", results[3].reason);
      }

      if (results[4].status === "fulfilled") {
        weekTopLinks = results[4].value || [];
      } else {
        console.error("Failed to fetch week's top links:", results[4].reason);
      }

      // Admin only stats with error handling - fetch from Clerk
      if (user.role === "admin") {
        try {
          const users = await ClerkAuthService.getUsersByStatus("pending");
          pendingUsers = users.length;
        } catch (err) {
          console.error("Error fetching pending users from Clerk:", err);
        }
      }

      // Check if any critical queries failed
      const criticalFailures = results
        .slice(0, 3)
        .filter((result) => result.status === "rejected");
      if (criticalFailures.length > 0) {
        hasError = true;
        errorMessage = "일부 통계 데이터를 불러오지 못했습니다.";
      }
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      hasError = true;
      errorMessage = "대시보드 데이터를 불러오는 중 오류가 발생했습니다.";
    }

    // Calculate average clicks per link
    const avgClicksPerLink =
      totalLinks && totalLinks > 0
        ? Math.round((totalClicks || 0) / totalLinks)
        : 0;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Error Alert */}
        {hasError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
              안녕하세요, <span className="text-primary opacity-90">{user.role === "admin" ? "관리자" : "사용자"}</span>님
            </h1>
            <p className="text-muted-foreground text-lg font-normal">
              오늘의 링크 활동과 통계를 확인하세요.
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white dark:bg-white/5 backdrop-blur-xl group hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">총 링크</CardTitle>
              <div className="h-9 w-9 rounded-full bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center">
                <Link2 className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">{totalLinks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <span className="text-emerald-500 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" /> 12%
                </span>
                지난달 대비
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white dark:bg-white/5 backdrop-blur-xl group hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">총 클릭</CardTitle>
              <div className="h-9 w-9 rounded-full bg-violet-50 dark:bg-violet-500/20 flex items-center justify-center">
                <MousePointerClick className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">{totalClicks.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <span className="text-emerald-500 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" /> 24%
                </span>
                지난달 대비
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white dark:bg-white/5 backdrop-blur-xl group hover:-translate-y-1 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">평균 클릭</CardTitle>
              <div className="h-9 w-9 rounded-full bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center">
                <Activity className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground mb-1">{avgClicksPerLink.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground font-medium">링크당 평균</p>
            </CardContent>
          </Card>

          {user.role === "admin" && (
            <Card className="relative overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white dark:bg-white/5 backdrop-blur-xl group hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">승인 대기</CardTitle>
                <div className="h-9 w-9 rounded-full bg-orange-50 dark:bg-orange-500/20 flex items-center justify-center">
                  <Users className="h-4.5 w-4.5 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-1">{pendingUsers}</div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground font-medium">새로운 사용자</p>
                  {pendingUsers > 0 && (
                    <Link href="/admin/users" className="text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400">
                      확인하기 →
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Top Links */}
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white dark:bg-white/5 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-50 dark:bg-pink-500/10">
                  <TrendingUp className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">오늘의 인기 링크</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">실시간 조회수가 높은 링크 TOP 5</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {todayTopLinks && todayTopLinks.length > 0 ? (
                <div className="space-y-3">
                  {todayTopLinks.map((link, index) => (
                    <div
                      key={link.id}
                      className="group flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors"
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm",
                        index === 0 ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" :
                          index === 1 ? "bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300" :
                            index === 2 ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400" :
                              "bg-white dark:bg-white/10 text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate text-foreground">/{link.slug}</p>
                          {link.description && (
                            <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-white dark:bg-white/10 border border-black/5 dark:border-white/5">
                              {link.description}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                          {link.original_url}
                        </p>
                      </div>
                      <div className="text-right pl-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white dark:bg-white/10 text-foreground border border-black/5 dark:border-white/5 shadow-sm">
                          {link.period_clicks} 클릭
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Globe className="h-10 w-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">아직 데이터가 충분하지 않습니다</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* This Week's Top Links */}
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white dark:bg-white/5 backdrop-blur-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">주간 인기 링크</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">최근 7일간 가장 인기있는 링크</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {weekTopLinks && weekTopLinks.length > 0 ? (
                <div className="space-y-3">
                  {weekTopLinks.map((link, index) => (
                    <div
                      key={link.id}
                      className="group flex items-center gap-4 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors"
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm",
                        index === 0 ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" :
                          index === 1 ? "bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300" :
                            index === 2 ? "bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400" :
                              "bg-white dark:bg-white/10 text-muted-foreground"
                      )}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate text-foreground">/{link.slug}</p>
                          {link.description && (
                            <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-white dark:bg-white/10 border border-black/5 dark:border-white/5">
                              {link.description}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                          {link.original_url}
                        </p>
                      </div>
                      <div className="text-right pl-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white dark:bg-white/10 text-foreground border border-black/5 dark:border-white/5 shadow-sm">
                          {link.period_clicks} 클릭
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BarChart3 className="h-10 w-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">아직 데이터가 충분하지 않습니다</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Links */}
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white dark:bg-white/5 backdrop-blur-xl">
          <CardHeader className="border-b border-border/40 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-500/10">
                  <Clock className="h-5 w-5 text-teal-500" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">최근 생성된 링크</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">가장 최근에 만들어진 단축 URL 목록</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild className="hover:bg-muted">
                <Link href="/admin/links" className="text-xs font-semibold">전체 보기 →</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {recentLinks && recentLinks.length > 0 ? (
              <div className="space-y-4">
                {recentLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/20 border border-transparent hover:border-primary/10 hover:bg-white dark:hover:bg-white/5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                  >
                    <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <p className="text-base font-bold text-foreground tracking-tight">/{link.slug}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
                          {link.click_count || 0} clicks
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-y-1 gap-x-3 text-xs text-muted-foreground">
                        {link.description && (
                          <span className="font-medium text-foreground/80">{link.description}</span>
                        )}
                        <span className="truncate max-w-[300px] opacity-70 hover:opacity-100 transition-opacity">{link.original_url}</span>
                      </div>
                    </div>
                    <div className="text-right sm:ml-4 flex items-center justify-between sm:justify-end gap-4 min-w-[120px]">
                      <p className="text-xs font-medium text-muted-foreground/60">
                        {new Date(link.created_at || "").toLocaleDateString(
                          "ko-KR",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/20 rounded-xl border border-dashed border-border/50">
                <Link2 className="h-12 w-12 text-muted-foreground/20 mb-4" />
                <h3 className="text-lg font-semibold text-foreground">아직 링크가 없습니다</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  첫 번째 단축 URL을 만들어보세요. 실시간 통계와 관리가 시작됩니다.
                </p>
                <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all" asChild>
                  <Link href="/shorten">첫 링크 만들기</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Critical dashboard error:", error);
    return <DashboardErrorFallback />;
  }
}
