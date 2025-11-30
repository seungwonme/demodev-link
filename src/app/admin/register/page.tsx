import { signUp } from "@/features/auth/actions/auth";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import Link from "next/link";
import { UserPlus, Mail, Lock, CheckCircle, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { AuthService } from "@/features/auth/services/auth.service";

// Force dynamic rendering since we use cookies
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminRegisterPage({ searchParams }: PageProps) {
  const params = await searchParams;
  // Check if user is already logged in
  const { user, profile } = await AuthService.getCurrentUser();
  
  if (user && profile) {
    // Redirect based on status
    switch (profile.status) {
      case "approved":
        redirect("/admin/dashboard");
      case "pending":
        redirect("/admin/pending");
      case "rejected":
        redirect("/admin/rejected");
    }
  }

  async function handleSignUp(formData: FormData) {
    "use server";
    
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    
    // Validate passwords match
    if (password !== confirmPassword) {
      redirect("/admin/register?error=passwords-dont-match");
    }
    
    const result = await signUp(formData);
    
    if (result?.error) {
      // Encode error message for URL
      const encodedError = encodeURIComponent(result.error);
      redirect(`/admin/register?error=${encodedError}`);
    }
    
    // Successful registration
    redirect("/admin/pending");
  }

  // Decode error message if present
  const errorMessage = params.error 
    ? params.error === "passwords-dont-match"
      ? "비밀번호가 일치하지 않습니다."
      : decodeURIComponent(params.error)
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden px-4">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 animate-gradient-x" />
      
      {/* Decorative Blurs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative w-full max-w-md z-10 animate-in">
        <Card className="backdrop-blur-xl bg-background/80 border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <UserPlus className="h-10 w-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                회원가입
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                DemoDev Link 서비스 가입
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <form action={handleSignUp} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="user@demodev.com"
                    className="pl-10 h-12 bg-background/60 border-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="최소 6자 이상"
                    className="pl-10 h-12 bg-background/60 border-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">비밀번호 확인</Label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    placeholder="비밀번호를 다시 입력하세요"
                    className="pl-10 h-12 bg-background/60 border-primary/20 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-[1.02]"
                size="lg"
              >
                회원가입
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="bg-border/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-background/80 text-muted-foreground font-medium backdrop-blur-sm rounded-full border border-border/50">
                    가입 안내
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10 text-sm text-muted-foreground space-y-2">
                <p className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>회원가입 후 관리자의 승인이 필요합니다.</span>
                </p>
                <p className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>승인까지 보통 1-2일이 소요됩니다.</span>
                </p>
                <p className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>승인 완료 시 이메일로 알림을 받습니다.</span>
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                이미 계정이 있으신가요?{" "}
                <Link
                  href="/admin/login"
                  className="font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  로그인
                </Link>
              </p>
              <p className="text-sm text-muted-foreground">
                <Link href="/" className="font-medium text-primary/80 hover:text-primary transition-colors">
                  ← 메인 페이지로 돌아가기
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}