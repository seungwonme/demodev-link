"use client";

import { updatePassword } from "@/features/auth/actions/auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isValidLink, setIsValidLink] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // 이메일 링크의 유효성 확인
  useEffect(() => {
    const checkToken = async () => {
      try {
        // URL에서 토큰 파라미터 확인
        const hash = window.location.hash;
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1));
          const error = hashParams.get("error");
          const errorCode = hashParams.get("error_code");

          if (error && errorCode) {
            setMessage(
              `오류가 발생했습니다: ${hashParams.get("error_description")}`,
            );
            setIsValidLink(false);
            return;
          }
        }

        // Supabase 사용자 확인
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setIsValidLink(true);
        } else {
          setMessage(
            "비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다. 다시 요청해주세요.",
          );
          setIsValidLink(false);
        }
      } catch (error) {
        console.error("토큰 확인 중 오류 발생:", error);
        setMessage("비밀번호 재설정 링크 확인 중 오류가 발생했습니다.");
        setIsValidLink(false);
      }
    };

    checkToken();
  }, [supabase]);

  const handlePasswordUpdate = async (formData: FormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;

      // 비밀번호 일치 확인
      if (password !== confirmPassword) {
        setMessage("비밀번호가 일치하지 않습니다.");
        setIsLoading(false);
        return;
      }

      const result = await updatePassword(formData);
      if (result?.error) {
        setMessage(result.error);
      } else {
        setMessage(
          "비밀번호가 성공적으로 변경되었습니다. 잠시 후 메인 페이지로 이동합니다.",
        );

        // 사용자 상태가 업데이트될 때까지 대기
        const checkUserAndRedirect = async () => {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            // 사용자가 확인되면 메인 페이지로 이동
            router.push("/");
          } else {
            // 사용자가 없으면 로그인 페이지로 이동
            router.push("/admin/login");
          }
        };

        // 3초 후 사용자 확인 및 리다이렉트
        setTimeout(checkUserAndRedirect, 3000);
      }
    } catch {
      setMessage("비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">비밀번호 재설정</CardTitle>
          <CardDescription>새로운 비밀번호를 입력해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {message && (
            <Alert variant={
              message.includes("오류") ||
              message.includes("실패") ||
              message.includes("만료") ||
              message.includes("일치하지")
                ? "destructive"
                : "default"
            }>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {isValidLink ? (
            <form action={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  새 비밀번호
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="새 비밀번호"
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
                  placeholder="비밀번호 확인"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "처리 중..." : "비밀번호 변경하기"}
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <Button
                variant="link"
                onClick={() => router.push("/admin/login")}
              >
                로그인 페이지로 돌아가기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
