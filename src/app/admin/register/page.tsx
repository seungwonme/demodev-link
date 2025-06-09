"use client";

import { signUp } from "@/features/auth/actions/auth";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { useRouter } from "next/navigation";

export default function AdminRegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSignUp = async (formData: FormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await signUp(formData);
      if (result?.error) {
        setMessage(result.error);
        setIsSuccess(false);
      } else if (result?.success) {
        setMessage("회원가입이 완료되었습니다. 관리자의 승인을 기다려주세요.");
        setIsSuccess(true);
        
        // Redirect to pending page after 2 seconds
        setTimeout(() => {
          router.push("/admin/pending");
        }, 2000);
      }
    } catch {
      setMessage("회원가입 중 오류가 발생했습니다.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              회원가입
            </CardTitle>
            <CardDescription>
              DemoDev Link 서비스 가입
            </CardDescription>
          </CardHeader>
          <CardContent>

            {message && (
              <Alert variant={isSuccess ? "default" : "destructive"} className="mb-4">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

          {!isSuccess && (
            <>
              <form action={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    이메일
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="user@demodev.com"
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
                    minLength={6}
                    placeholder="최소 6자 이상"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    비밀번호 확인
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? "가입 중..." : "회원가입"}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-background text-muted-foreground">
                      가입 안내
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-sm text-muted-foreground space-y-2">
                  <p>• 회원가입 후 관리자의 승인이 필요합니다.</p>
                  <p>• 승인까지 보통 1-2일이 소요됩니다.</p>
                  <p>• 승인 완료 시 이메일로 알림을 받습니다.</p>
                </div>
              </div>
            </>
          )}

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                이미 계정이 있으신가요?{" "}
                <Link href="/admin/login" className="text-primary hover:underline">
                  로그인
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
    </div>
  );
}