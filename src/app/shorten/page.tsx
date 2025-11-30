import UrlInputForm from "@/features/links/components/url/url-input-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Link2, Sparkles, Shield, BarChart3 } from "lucide-react";

export default function ShortenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-40 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container relative mx-auto px-4 py-16 max-w-4xl z-10">
        {/* Page Header */}
        <div className="text-center mb-16 animate-in">
          <div className="inline-flex items-center gap-2 px-6 py-3 mb-8 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-sm border border-primary/20 text-sm font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            <span>빠르고 안전한 URL 단축</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient-x bg-300%">
              URL을 단축하세요
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-foreground/80 font-light max-w-2xl mx-auto leading-relaxed">
            긴 URL을 <span className="font-semibold text-primary">짧고 기억하기 쉬운</span> 링크로 변환하여 
            <span className="font-semibold text-accent">효율적으로</span> 공유하고 관리하세요
          </p>
        </div>

        {/* URL Shortener Form */}
        <div className="mb-16">
          <UrlInputForm />
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <Card className="group hover-lift backdrop-blur-xl bg-background/60 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20">
            <CardHeader>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                <Link2 className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl font-bold">즉시 생성</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                클릭 한 번으로 단축 URL을 즉시 생성하고 
                바로 사용할 수 있습니다.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover-lift backdrop-blur-xl bg-background/60 border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/20">
            <CardHeader>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4 shadow-lg shadow-accent/30 group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl font-bold">안전한 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                회원 전용 서비스로 생성한 링크를 
                안전하게 관리할 수 있습니다.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover-lift backdrop-blur-xl bg-background/60 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20">
            <CardHeader>
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-xl font-bold">상세 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                클릭 수, 접속 위치 등 다양한 통계를 
                실시간으로 확인할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}