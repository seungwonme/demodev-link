import { ClerkAuthService } from "@/features/auth/services/clerk-auth.service";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function SettingsPage() {
  // Require admin authentication
  const user = await ClerkAuthService.requireAuth({
    requiredStatus: "approved",
    requireAdmin: true,
  });

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent blur-3xl opacity-20 rounded-full" />
          <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Settings className="h-16 w-16 text-white animate-pulse" />
          </div>
        </div>

        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-4xl font-bold gradient-text">설정</h1>
          <p className="text-xl text-muted-foreground">
            이 기능은 현재 준비 중입니다
          </p>
          <p className="text-sm text-muted-foreground">
            더 나은 설정 경험을 제공하기 위해 작업 중입니다.
          </p>
        </div>

        <Card className="w-full max-w-md hover-lift">
          <CardHeader>
            <CardTitle>곧 만나요!</CardTitle>
            <CardDescription>
              다음 기능들이 준비되고 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                계정 및 프로필 관리
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                테마 및 UI 커스터마이징
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                알림 및 이메일 설정
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                링크 기본 옵션 설정
              </li>
            </ul>
          </CardContent>
        </Card>

        <Link href="/admin/dashboard">
          <Button variant="outline" size="lg" className="hover-lift">
            <ArrowLeft className="mr-2 h-5 w-5" />
            대시보드로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}
