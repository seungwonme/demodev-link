import { AuthService } from "@/features/auth/services/auth.service";
import { LinkService } from "@/features/links/actions/link.service";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  LinkIcon,
  ChartBarIcon,
  UsersIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

// 동적 렌더링 강제 설정 (Static Generation 방지)
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  try {
    // Use centralized auth service
    const { profile } = await AuthService.requireAuth();
    const supabase = await createClient();

    // Get statistics with error handling
    const [
      { count: totalLinks, error: linksError },
      { data: recentLinks, error: recentLinksError },
      { count: totalClicks, error: clicksError },
      todayTopLinks,
      weekTopLinks,
    ] = await Promise.all([
      supabase.from("links").select("*", { count: "exact" }),
      supabase
        .from("links")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("link_clicks").select("*", { count: "exact" }),
      LinkService.getTopClickedLinksByPeriod("today", 5),
      LinkService.getTopClickedLinksByPeriod("week", 5),
    ]);

    if (linksError) console.warn("Links count fetch failed:", linksError);
    if (recentLinksError)
      console.warn("Recent links fetch failed:", recentLinksError);
    if (clicksError) console.warn("Clicks count fetch failed:", clicksError);

    // Admin only stats
    let pendingUsers = 0;
    if (profile?.role === "admin") {
      const { count, error: pendingError } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .eq("status", "pending");

      if (pendingError) {
        console.warn("Pending users count fetch failed:", pendingError);
      } else {
        pendingUsers = count || 0;
      }
    }

    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">대시보드</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 링크 수</CardTitle>
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLinks || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 클릭 수</CardTitle>
              <ChartBarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClicks || 0}</div>
            </CardContent>
          </Card>

          {profile?.role === "admin" && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingUsers}</div>
                <p className="text-xs text-muted-foreground">새로운 사용자</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Top Links */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  오늘 인기 링크
                </CardTitle>
                <span className="text-sm text-muted-foreground">Top 5</span>
              </div>
            </CardHeader>
            <CardContent>
              {todayTopLinks && todayTopLinks.length > 0 ? (
                <div className="space-y-4">
                  {todayTopLinks.map((link, index) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{link.slug}</p>
                          {link.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                              {link.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {link.original_url}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">
                          {link.period_clicks} 클릭
                        </p>
                        <p className="text-xs text-muted-foreground">오늘</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  오늘 클릭된 링크가 없습니다.
                </p>
              )}
            </CardContent>
          </Card>

          {/* This Week's Top Links */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ArrowTrendingUpIcon className="h-5 w-5" />
                  최근 7일 인기 링크
                </CardTitle>
                <span className="text-sm text-muted-foreground">Top 5</span>
              </div>
            </CardHeader>
            <CardContent>
              {weekTopLinks && weekTopLinks.length > 0 ? (
                <div className="space-y-4">
                  {weekTopLinks.map((link, index) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{link.slug}</p>
                          {link.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                              {link.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {link.original_url}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">
                          {link.period_clicks} 클릭
                        </p>
                        <p className="text-xs text-muted-foreground">7일간</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  최근 7일간 클릭된 링크가 없습니다.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Links */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>최근 생성된 링크</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLinks && recentLinks.length > 0 ? (
              <div className="space-y-4">
                {recentLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{link.slug}</p>
                      {link.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {link.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground truncate">
                        {link.original_url}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {link.click_count} 클릭
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(link.created_at || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                아직 생성된 링크가 없습니다.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("AdminDashboard error:", error);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">오류가 발생했습니다</h2>
          <p className="text-muted-foreground">
            대시보드를 불러오는 중 문제가 발생했습니다.
          </p>
        </div>
      </div>
    );
  }
}
