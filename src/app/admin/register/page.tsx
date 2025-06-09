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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">회원가입</CardTitle>
            <CardDescription>DemoDev Link 서비스 가입</CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <form action={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="user@demodev.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
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
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
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
                className="w-full"
                size="lg"
              >
                회원가입
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

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                이미 계정이 있으신가요?{" "}
                <Link
                  href="/admin/login"
                  className="text-primary hover:underline"
                >
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