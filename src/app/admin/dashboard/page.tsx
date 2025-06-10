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
  Link2,
  BarChart3,
  Users,
  TrendingUp,
  Clock,
  MousePointerClick,
  Activity,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

export default async function AdminDashboard() {
  const { profile } = await AuthService.requireAuth();
  const supabase = await createClient();

  // Get statistics
  const [
    { count: totalLinks },
    { data: recentLinks },
    { count: totalClicks },
    todayTopLinks,
    weekTopLinks,
  ] = await Promise.all([
    supabase.from("links").select("*", { count: "exact", head: true }),
    supabase
      .from("links")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("link_clicks").select("*", { count: "exact", head: true }),
    LinkService.getTopClickedLinksByPeriod("today", 5),
    LinkService.getTopClickedLinksByPeriod("week", 5),
  ]);

  // Admin only stats
  let pendingUsers = 0;
  if (profile?.role === "admin") {
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    pendingUsers = count || 0;
  }

  // Calculate average clicks per link
  const avgClicksPerLink = totalLinks && totalLinks > 0 
    ? Math.round((totalClicks || 0) / totalLinks) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">
          안녕하세요, {profile?.role === "admin" ? "관리자" : "사용자"}님!
        </h1>
        <p className="text-muted-foreground">
          오늘의 링크 활동과 통계를 확인하세요
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-border/50 overflow-hidden transition-shadow hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 링크</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Link2 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{totalLinks || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              생성된 단축 URL
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 overflow-hidden transition-shadow hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 클릭</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <MousePointerClick className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{totalClicks || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              전체 방문자 수
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 overflow-hidden transition-shadow hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 클릭</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-2xl font-bold">{avgClicksPerLink}</div>
            <p className="text-xs text-muted-foreground mt-1">
              링크당 평균 클릭
            </p>
          </CardContent>
        </Card>

        {profile?.role === "admin" && (
          <Card className="border-border/50 overflow-hidden transition-shadow hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
            <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold">{pendingUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                새로운 사용자
              </p>
              {pendingUsers > 0 && (
                <Button size="sm" variant="link" className="p-0 h-auto mt-2" asChild>
                  <Link href="/admin/users">확인하기 →</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Top Links */}
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>오늘의 인기 링크</CardTitle>
                  <p className="text-sm text-muted-foreground">실시간 TOP 5</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {todayTopLinks && todayTopLinks.length > 0 ? (
              <div className="space-y-4">
                {todayTopLinks.map((link, index) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`text-2xl font-bold ${
                      index === 0 ? 'text-primary' : 
                      index === 1 ? 'text-accent' : 
                      index === 2 ? 'text-orange-500' : 
                      'text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">/{link.slug}</p>
                      {link.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {link.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {link.period_clicks}
                      </p>
                      <p className="text-xs text-muted-foreground">클릭</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Globe className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  오늘 클릭된 링크가 없습니다
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* This Week's Top Links */}
        <Card className="transition-shadow hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>주간 인기 링크</CardTitle>
                  <p className="text-sm text-muted-foreground">최근 7일 TOP 5</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {weekTopLinks && weekTopLinks.length > 0 ? (
              <div className="space-y-4">
                {weekTopLinks.map((link, index) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`text-2xl font-bold ${
                      index === 0 ? 'text-primary' : 
                      index === 1 ? 'text-accent' : 
                      index === 2 ? 'text-orange-500' : 
                      'text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">/{link.slug}</p>
                      {link.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {link.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {link.period_clicks}
                      </p>
                      <p className="text-xs text-muted-foreground">클릭</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  이번 주 클릭된 링크가 없습니다
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Links */}
      <Card className="transition-shadow hover:shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>최근 생성된 링크</CardTitle>
                <p className="text-sm text-muted-foreground">새로 추가된 단축 URL</p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/links">
                전체 보기
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentLinks && recentLinks.length > 0 ? (
            <div className="space-y-4">
              {recentLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/20 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">/{link.slug}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {link.click_count || 0} 클릭
                      </span>
                    </div>
                    {link.description && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {link.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">
                      {link.original_url}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-muted-foreground">
                      {new Date(link.created_at || "").toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Link2 className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                아직 생성된 링크가 없습니다
              </p>
              <Button size="sm" asChild>
                <Link href="/shorten">
                  첫 링크 만들기
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}