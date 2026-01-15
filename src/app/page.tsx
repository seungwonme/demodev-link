import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import {
  Link2,
  BarChart3,
  ShieldCheck,
  Zap,
  Users,
  Settings,
  ArrowRight,
  Globe,
  CheckCircle2,
} from "lucide-react";
import Iridescence from "@/components/Iridescence";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/10 selection:text-primary">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32">
        {/* Ambient Glow */}
        <div className="glow-bg" />

        <div className="absolute inset-0 z-0 opacity-40">
          <Iridescence
            color={[0.18, 0.42, 1.0]} /* Matching Brand Blue #2E6CFF */
            mouseReact={true}
            amplitude={0.05}
            speed={0.8}
          />
        </div>

        {/* Textured Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-[1] mix-blend-soft-light" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/60 to-background/90 z-[2]" />

        <div className="container relative mx-auto px-4 z-10">
          <div className="max-w-4xl mx-auto text-center animate-in space-y-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 text-xs font-semibold text-primary backdrop-blur-md shadow-sm cursor-default hover:bg-white/80 transition-colors">
              <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
              <span>v2.0 Now Available</span>
            </div>

            {/* Main Title */}
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.0] text-foreground drop-shadow-sm">
                DemoDev
                <span className="text-primary relative inline-block">
                  Link
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span>
              </h1>
              <p className="mx-auto max-w-xl text-lg sm:text-xl text-muted-foreground font-normal leading-relaxed tracking-tight">
                단순한 링크 단축 그 이상.<br className="hidden sm:block" />
                <strong className="text-foreground font-semibold">데이터 기반</strong>의 강력한 링크 관리 플랫폼을 경험하세요.
              </p>
            </div>

            {/* CTA Buttons - Metallic/3D Feel */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Link href="/shorten" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="rounded-full w-full sm:w-auto h-12 px-8 text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-[0_4px_14px_0_rgba(46,108,255,0.39)] hover:shadow-[0_6px_20px_rgba(46,108,255,0.23)] hover:-translate-y-[1px] transition-all"
                >
                  무료로 시작하기
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full w-full sm:w-auto h-12 px-8 text-base font-semibold bg-white/50 border-white/60 hover:bg-white/80 text-foreground shadow-sm hover:shadow transition-all backdrop-blur-sm"
                >
                  <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                  대시보드 데모
                </Button>
              </Link>
            </div>

            {/* Stats - Metallic Cards */}
            <div className="pt-24 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { label: "가동 시간", value: "99.99%" },
                { label: "링크 생성", value: "10M+" },
                { label: "응답 속도", value: "< 10ms" },
                { label: "보안 수준", value: "Enterprise" },
              ].map((stat, i) => (
                <div key={i} className="metallic-surface rounded-2xl p-5 text-center group transition-all hover:-translate-y-1">
                  <div className="text-2xl sm:text-3xl font-black text-foreground mb-1 tracking-tight group-hover:text-primary transition-colors">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        {/* Subtle background surface */}
        <div className="absolute inset-0 bg-secondary/30 -skew-y-3 transform origin-top-left scale-110 z-0" />

        <div className="container px-4 mx-auto relative z-10">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-foreground">
              압도적인 <span className="text-primary">퍼포먼스</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              가볍지만 강력합니다. <br />
              비즈니스에 필요한 모든 기능을 직관적인 인터페이스에 담았습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Link2 className="w-5 h-5" />}
              title="스마트 URL 단축"
              description="브랜드 아이덴티티를 담은 커스텀 도메인과 슬러그를 제공합니다."
            />
            <FeatureCard
              icon={<BarChart3 className="w-5 h-5" />}
              title="심층 분석 데이터"
              description="실시간 클릭, 유입 경로, 지역, 디바이스 등 상세 데이터를 시각화합니다."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-5 h-5" />}
              title="엔터프라이즈 보안"
              description="SSL 암호화, 비밀번호 보호, 만료일 설정으로 안전하게 공유하세요."
            />
            <FeatureCard
              icon={<Zap className="w-5 h-5" />}
              title="Global Edge"
              description="전 세계 엣지 네트워크를 통해 딜레이 없는 빠른 접속을 보장합니다."
            />
            <FeatureCard
              icon={<Users className="w-5 h-5" />}
              title="팀 워크스페이스"
              description="프로젝트별로 링크를 관리하고 팀원들과 효율적으로 협업하세요."
            />
            <FeatureCard
              icon={<Settings className="w-5 h-5" />}
              title="API & Webhooks"
              description="강력한 API로 기존 워크플로우에 단축 기능을 통합하세요."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="metallic-surface rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
                지금 바로 시작하세요
              </h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
                신용카드 없이 14일 무료 체험이 가능합니다. <br />
                수천 개의 기업이 선택한 링크 관리 솔루션.
              </p>

              <div className="flex justify-center gap-4 mb-12">
                <Link href="/shorten">
                  <Button size="lg" className="rounded-full h-14 px-10 text-base font-bold bg-foreground text-background hover:bg-foreground/90 shadow-xl hover:scale-105 transition-all">
                    무료로 시작하기
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>14일 무료 체험</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>카드 등록 불필요</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>언제든 해지 가능</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-background/50">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="font-bold text-lg mb-4 tracking-tight">
                DemoLink
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                데이터 기반의 의사결정을 돕는 <br />
                프리미엄 링크 관리 플랫폼
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-foreground">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Features</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Pricing</li>
                <li className="hover:text-primary transition-colors cursor-pointer">API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-foreground">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">About</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Blog</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Careers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm text-foreground">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Privacy</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Terms</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 text-center text-xs text-muted-foreground border-t border-border/50">
            &copy; 2024 DemoDev Link. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group p-6 rounded-2xl metallic-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-none dark:hover:bg-accent/10">
      <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary mb-5 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-3 tracking-tight text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
