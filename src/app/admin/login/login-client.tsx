"use client";

import { login } from "@/features/auth/actions/auth";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Mail, Lock, Sparkles } from "lucide-react";

export default function AdminLoginClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorMessage = searchParams.get("message");

  useEffect(() => {
    if (error && errorMessage) {
      setMessage(`오류: ${errorMessage}`);
    }
  }, [error, errorMessage]);

  const handleLogin = async (formData: FormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await login(formData);
      if (result?.error) {
        setMessage(result.error);
      }
    } catch {
      setMessage("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md z-10 animate-in">
      <Card className="backdrop-blur-xl bg-background/80 border-primary/20 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              관리자 로그인
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              DemoDev Link 관리 시스템
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>

          {message && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form action={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                이메일
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@demodev.com"
                  className="pl-10 h-12 bg-background/60 border-primary/20 focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                비밀번호
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="pl-10 h-12 bg-background/60 border-primary/20 focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-[1.02]"
              size="lg"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  로그인 중...
                </span>
              ) : (
                "로그인"
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/50 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              계정이 없으신가요?{" "}
              <Link href="/admin/register" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                회원가입
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
  );
}