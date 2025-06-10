import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Link2,
  BarChart3,
  ShieldCheck,
  Zap,
  Users,
  Settings,
  ArrowRight,
  Sparkles,
  Globe,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] overflow-hidden flex items-center">
        <div className="container relative mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center animate-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Enterprise-grade URL Management</span>
            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="block gradient-text">DemoDev Link</span>
              <span className="block mt-2 text-2xl sm:text-3xl md:text-4xl font-medium text-muted-foreground">
                차세대 URL 관리 플랫폼
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
              기업 내부 전용 URL 단축 서비스로 안전하고 효율적인 링크 관리를
              경험하세요. 실시간 분석, 팀 협업, 강력한 보안 기능을 하나의
              플랫폼에서 제공합니다.
            </p>

            <div className="mx-auto mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/shorten">
                <Button
                  size="lg"
                  className="group min-w-[200px] h-14 text-lg font-medium hover-lift"
                >
                  무료로 시작하기
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/admin">
                <Button
                  size="lg"
                  variant="outline"
                  className="min-w-[200px] h-14 text-lg font-medium glass-effect hover:bg-primary/5"
                >
                  <Globe className="mr-2 h-5 w-5" />
                  관리자 대시보드
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text">99.9%</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  가동 시간
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text">10ms</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  평균 응답 시간
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold gradient-text">256bit</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  암호화 보안
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-6">
              강력한 기능으로 무장한 플랫폼
            </h2>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
              기업의 URL 관리를 혁신하는 엔터프라이즈급 기능들을 만나보세요
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="group hover-lift border-border/50 glass-effect overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                  <Link2 className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="mt-6 text-xl">스마트 URL 단축</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed">
                  AI 기반 커스텀 슬러그 추천과 함께 브랜드에 맞는 짧고 의미있는
                  링크를 생성하세요.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group hover-lift border-border/50 glass-effect overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="mt-6 text-xl">
                  실시간 분석 대시보드
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed">
                  방문자 흐름, 지역별 통계, 디바이스 분석 등 상세한 인사이트를
                  실시간으로 모니터링하세요.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group hover-lift border-border/50 glass-effect overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                  <ShieldCheck className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="mt-6 text-xl">
                  엔터프라이즈 보안
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed">
                  2FA, IP 화이트리스트, 역할 기반 접근 제어로 최고 수준의 보안을
                  보장합니다.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="group hover-lift border-border/50 glass-effect overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="mt-6 text-xl">
                  초고속 리다이렉션
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed">
                  글로벌 CDN과 엣지 컴퓨팅으로 10ms 이내의 초저지연 리다이렉션을
                  실현합니다.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="group hover-lift border-border/50 glass-effect overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="mt-6 text-xl">스마트 팀 협업</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed">
                  팀별 워크스페이스, 실시간 동기화, 권한 관리로 효율적인 협업
                  환경을 구축하세요.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="group hover-lift border-border/50 glass-effect overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                  <Settings className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="mt-6 text-xl">강력한 관리 도구</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground leading-relaxed">
                  직관적인 관리자 대시보드로 사용자, 링크, 분석 데이터를 한눈에
                  관리하세요.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent_50%)]" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              팀의 URL 관리를 혁신할 준비가 되셨나요?
            </h2>
            <p className="text-xl text-white/90 mb-12 leading-relaxed">
              지금 시작하면 30일간 모든 프리미엄 기능을 무료로 체험할 수
              있습니다. 신용카드 등록 없이 바로 시작하세요.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/shorten">
                <Button
                  size="lg"
                  variant="secondary"
                  className="group min-w-[200px] h-14 text-lg font-medium bg-white text-primary hover:bg-white/90"
                >
                  무료 체험 시작하기
                  <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                </Button>
              </Link>
              <div className="flex items-center gap-4 text-white/80">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  <span>SSL 보안</span>
                </span>
                <span className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span>즉시 활성화</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold gradient-text mb-4">
                DemoDev Link
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                엔터프라이즈급 URL 관리 플랫폼으로 팀의 생산성을 높이고 브랜드
                가치를 보호하세요.
              </p>
              <div className="flex gap-4">
                <Link href="/shorten">
                  <Button variant="outline" size="sm" className="glass-effect">
                    시작하기
                  </Button>
                </Link>
                <Link href="/admin/login">
                  <Button variant="ghost" size="sm">
                    로그인
                  </Button>
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">제품</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    기능
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    가격
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    보안
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    API
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">회사</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    소개
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    블로그
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    채용
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-primary transition-colors"
                  >
                    문의
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground">
                &copy; 2024 DemoDev. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm text-muted-foreground">
                <Link href="#" className="hover:text-primary transition-colors">
                  개인정보처리방침
                </Link>
                <Link href="#" className="hover:text-primary transition-colors">
                  이용약관
                </Link>
                <Link href="#" className="hover:text-primary transition-colors">
                  쿠키 정책
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
