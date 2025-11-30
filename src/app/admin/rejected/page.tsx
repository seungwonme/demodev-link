import { ClerkAuthService } from "@/features/auth/services/clerk-auth.service";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { SignOutButton } from "@clerk/nextjs";

// Force dynamic rendering since we use cookies
export const dynamic = "force-dynamic";

export default async function RejectedPage() {
  // Get current user from Clerk
  const user = await ClerkAuthService.getCurrentUser();

  // If no user or not rejected, redirect (middleware should handle this)
  if (!user || user.status !== "rejected") {
    return null;
  }

  // Try to get rejection reason from Clerk private metadata
  // This would need to be fetched from Clerk if needed
  const rejectionReason = undefined; // Clerk metadata에서 가져올 수 있음

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative max-w-md w-full text-center">
        <div className="bg-card/95 backdrop-blur-sm shadow-2xl rounded-lg p-8 border border-border/50">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <XCircleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            가입 거절됨
          </h1>

          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>죄송합니다. 회원가입 신청이 거절되었습니다.</p>

            {rejectionReason && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>거절 사유:</strong>
                  <br />
                  {rejectionReason}
                </p>
              </div>
            )}

            <p className="text-sm">
              추가 문의사항이 있으시면 관리자에게 연락해주세요.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                메인 페이지로 돌아가기
              </Button>
            </Link>

            <SignOutButton redirectUrl="/">
              <Button
                variant="ghost"
                className="w-full text-red-600 hover:text-red-700"
              >
                로그아웃
              </Button>
            </SignOutButton>
          </div>
        </div>
      </div>
    </div>
  );
}
