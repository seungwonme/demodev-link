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
  ClockIcon,
} from "@heroicons/react/24/outline";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  // Get statistics
  const { count: totalLinks } = await supabase
    .from("links")
    .select("*", { count: "exact" });

  const { data: recentLinks } = await supabase
    .from("links")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: totalClicks } = await supabase
    .from("link_clicks")
    .select("*", { count: "exact" });

  // Admin only stats
  let pendingUsers = 0;
  if (profile?.role === "admin") {
    const { count } = await supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .eq("status", "pending");
    pendingUsers = count || 0;
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

      {/* Recent Links */}
      <Card>
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
}
