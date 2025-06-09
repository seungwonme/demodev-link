import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
  Link2,
  BarChart3,
  ShieldCheck,
  Zap,
  Users,
  Settings,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">DemoDev Link</span>
              <span className="block text-blue-600 dark:text-blue-400">
                내부 URL 관리 시스템
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              DemoDev의 안전하고 효율적인 URL 단축 서비스입니다. 팀 내부에서만
              사용 가능한 전용 링크 관리 시스템으로 모든 링크를 체계적으로
              관리하세요.
            </p>
            <div className="mx-auto mt-10 max-w-sm space-y-4 sm:flex sm:max-w-none sm:justify-center sm:space-x-4 sm:space-y-0">
              <Link href="/admin/register">
                <Button size="lg" className="w-full sm:w-auto">
                  시작하기
                </Button>
              </Link>
              <Link href="/admin">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  관리자 로그인
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              주요 기능
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              DemoDev Link는 기업 내부 사용에 최적화된 다양한 기능을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Link2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">간편한 URL 단축</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  긴 URL을 짧고 기억하기 쉬운 링크로 변환하여 팀 내에서 쉽게
                  공유할 수 있습니다.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">상세한 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  클릭 수, 접속 시간, 사용자 통계 등 다양한 분석 데이터를
                  실시간으로 확인하세요.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">보안 우선</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  승인된 사용자만 접근 가능한 안전한 시스템으로 기업 내부 정보를
                  보호합니다.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">빠른 리다이렉션</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  최적화된 인프라로 빠르고 안정적인 리다이렉션 서비스를
                  제공합니다.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">팀 협업</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  팀원들과 링크를 공유하고 함께 관리할 수 있는 협업 기능을
                  제공합니다.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4">관리자 도구</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  사용자 승인, 링크 관리 등 강력한 관리자 도구로 시스템을
                  효율적으로 운영하세요.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 dark:bg-blue-800">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">지금 시작하세요</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
              DemoDev Link에 가입하고 팀의 URL 관리를 한 단계 업그레이드하세요.
              관리자의 승인을 받으면 모든 기능을 사용할 수 있습니다.
            </p>
            <Link href="/admin/register" className="mt-8 inline-block">
              <Button size="lg" variant="secondary">
                회원가입
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-500 dark:text-gray-400">
              &copy; 2024 DemoDev. All rights reserved.
            </p>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
              내부 전용 서비스 | 승인된 사용자만 이용 가능
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
