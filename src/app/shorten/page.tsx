import UrlInputForm from "@/features/links/components/url/url-input-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Link2, Sparkles, Shield, BarChart3 } from "lucide-react";

export default function ShortenPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-12 animate-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            <span>빠르고 안전한 URL 단축</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
            URL을 단축하세요
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            긴 URL을 짧고 기억하기 쉬운 링크로 변환하여 
            효율적으로 공유하고 관리하세요
          </p>
        </div>

        {/* URL Shortener Form */}
        <div className="mb-16">
          <UrlInputForm />
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <Card className="hover-lift border-border/50 glass-effect">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <Link2 className="h-6 w-6 text-white" />
              </div>
              <CardTitle>즉시 생성</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                클릭 한 번으로 단축 URL을 즉시 생성하고 
                바로 사용할 수 있습니다.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-border/50 glass-effect">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle>안전한 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                회원 전용 서비스로 생성한 링크를 
                안전하게 관리할 수 있습니다.
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-border/50 glass-effect">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle>상세 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
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