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
    <div className="w-full max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            관리자 로그인
          </CardTitle>
          <CardDescription>
            DemoDev Link 관리 시스템
          </CardDescription>
        </CardHeader>
        <CardContent>

          {message && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form action={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                이메일
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@demodev.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                비밀번호
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              계정이 없으신가요?{" "}
              <Link href="/admin/register" className="text-primary hover:underline">
                회원가입
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              <Link href="/" className="text-primary hover:underline">
                메인 페이지로 돌아가기
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}