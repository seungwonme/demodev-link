import { ClerkAuthService } from "@/features/auth/services/clerk-auth.service";
import { redirect } from "next/navigation";
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-white dark:bg-white/10 shadow-sm border border-black/5 dark:border-white/5">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">설정</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">플랫폼 환경설정 및 관리자 옵션을 구성하세요.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-2xl p-12 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex flex-col items-center text-center space-y-8 min-h-[500px] justify-center text-balance">

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl opacity-50 rounded-full" />
          <div className="relative h-24 w-24 rounded-3xl bg-gradient-to-br from-white to-gray-50 dark:from-white/10 dark:to-white/5 border border-white/20 shadow-xl flex items-center justify-center">
            <Settings className="h-10 w-10 text-primary animate-[spin_10s_linear_infinite]" />
          </div>
        </div>

        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold">기능 준비 중입니다</h2>
          <p className="text-muted-foreground">
            더 나은 설정 경험을 제공하기 위해 열심히 개발하고 있습니다.<br />
            계정 관리, 테마 설정, 알림 설정 등의 기능이 곧 추가될 예정입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg text-left">
          {[
            "계정 및 프로필 관리",
            "테마 및 UI 커스터마이징",
            "알림 및 이메일 설정",
            "링크 기본 옵션 설정"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5">
              <div className="h-2 w-2 rounded-full bg-primary/50" />
              <span className="text-sm font-medium">{item}</span>
            </div>
          ))}
        </div>

        <div className="pt-8">
          <Button variant="outline" size="lg" className="rounded-full px-8 hover:bg-secondary/50" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              대시보드로 돌아가기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
