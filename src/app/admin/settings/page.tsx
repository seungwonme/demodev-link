import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Switch } from "@/shared/components/ui/switch";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { 
  Bell, 
  Shield, 
  Globe, 
  Database, 
  Mail, 
  Key,
  Server,
  Palette,
  Save
} from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/admin/dashboard");
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">설정</h1>
        <p className="text-muted-foreground mt-2">
          시스템 설정을 관리하고 서비스를 구성합니다
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* General Settings */}
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>일반 설정</CardTitle>
                <CardDescription>서비스 기본 설정을 관리합니다</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">사이트 이름</Label>
              <Input id="site-name" defaultValue="DemoLink" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-description">사이트 설명</Label>
              <Textarea 
                id="site-description" 
                defaultValue="기업 전용 URL 단축 서비스"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance">유지보수 모드</Label>
                <p className="text-sm text-muted-foreground">
                  일시적으로 서비스를 중단합니다
                </p>
              </div>
              <Switch id="maintenance" />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>보안 설정</CardTitle>
                <CardDescription>보안 관련 옵션을 구성합니다</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="2fa">2단계 인증 필수</Label>
                <p className="text-sm text-muted-foreground">
                  모든 사용자에게 2FA를 요구합니다
                </p>
              </div>
              <Switch id="2fa" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ip-whitelist">IP 화이트리스트</Label>
                <p className="text-sm text-muted-foreground">
                  특정 IP만 접근 허용
                </p>
              </div>
              <Switch id="ip-whitelist" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-timeout">세션 타임아웃 (분)</Label>
              <Input 
                id="session-timeout" 
                type="number" 
                defaultValue="60"
                min="5"
                max="1440"
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>이메일 설정</CardTitle>
                <CardDescription>이메일 발송 설정을 관리합니다</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP 호스트</Label>
              <Input id="smtp-host" placeholder="smtp.gmail.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP 포트</Label>
              <Input id="smtp-port" placeholder="587" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">이메일 알림</Label>
                <p className="text-sm text-muted-foreground">
                  사용자 가입 시 알림 발송
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* API Settings */}
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Key className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>API 설정</CardTitle>
                <CardDescription>API 관련 설정을 구성합니다</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="api-enabled">API 활성화</Label>
                <p className="text-sm text-muted-foreground">
                  외부 API 접근을 허용합니다
                </p>
              </div>
              <Switch id="api-enabled" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate-limit">Rate Limit (요청/분)</Label>
              <Input 
                id="rate-limit" 
                type="number" 
                defaultValue="60"
                min="1"
                max="1000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-version">API 버전</Label>
              <Input id="api-version" defaultValue="v1" readOnly />
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Database className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>데이터베이스</CardTitle>
                <CardDescription>데이터베이스 관련 작업</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">데이터베이스 백업</p>
              <p className="text-sm text-muted-foreground">
                마지막 백업: 2024-01-10 14:30
              </p>
              <Button variant="outline" className="w-full">
                <Database className="mr-2 h-4 w-4" />
                지금 백업하기
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">캐시 관리</p>
              <Button variant="outline" className="w-full">
                <Server className="mr-2 h-4 w-4" />
                캐시 비우기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Palette className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>테마 설정</CardTitle>
                <CardDescription>UI 테마를 커스터마이즈합니다</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">주 색상</Label>
              <div className="flex gap-2">
                <Input 
                  id="primary-color" 
                  type="color" 
                  defaultValue="#6366f1"
                  className="w-20 h-10"
                />
                <Input 
                  defaultValue="#6366f1"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent-color">강조 색상</Label>
              <div className="flex gap-2">
                <Input 
                  id="accent-color" 
                  type="color" 
                  defaultValue="#8b5cf6"
                  className="w-20 h-10"
                />
                <Input 
                  defaultValue="#8b5cf6"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-default">다크 모드 기본값</Label>
                <p className="text-sm text-muted-foreground">
                  첫 방문 시 다크 모드 사용
                </p>
              </div>
              <Switch id="dark-default" />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="hover-lift col-span-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>알림 설정</CardTitle>
                <CardDescription>시스템 알림을 구성합니다</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="new-user">신규 사용자 가입</Label>
                  <p className="text-sm text-muted-foreground">
                    새로운 사용자가 가입할 때 알림
                  </p>
                </div>
                <Switch id="new-user" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="link-created">링크 생성</Label>
                  <p className="text-sm text-muted-foreground">
                    새로운 링크가 생성될 때 알림
                  </p>
                </div>
                <Switch id="link-created" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="high-traffic">높은 트래픽</Label>
                  <p className="text-sm text-muted-foreground">
                    비정상적인 트래픽 감지 시 알림
                  </p>
                </div>
                <Switch id="high-traffic" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="system-error">시스템 오류</Label>
                  <p className="text-sm text-muted-foreground">
                    시스템 오류 발생 시 알림
                  </p>
                </div>
                <Switch id="system-error" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6">
        <Button size="lg" className="hover-lift">
          <Save className="mr-2 h-5 w-5" />
          변경사항 저장
        </Button>
      </div>
    </div>
  );
}