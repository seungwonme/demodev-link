import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { ClockIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default async function PendingApprovalPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // If user is approved, redirect to admin
  if (profile?.status === "approved") {
    redirect("/admin/dashboard");
  }

  // If user is rejected, redirect to rejected page
  if (profile?.status === "rejected") {
    redirect("/admin/rejected");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
              <ClockIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            승인 대기 중
          </h1>

          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>회원가입이 완료되었습니다. 관리자의 승인을 기다리고 있습니다.</p>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>가입 정보:</strong>
                <br />
                이메일: {profile?.email}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <p className="flex items-center justify-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                보통 1-2일 내에 승인이 완료됩니다
              </p>
              <p className="flex items-center justify-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                승인 완료 시 이메일로 알림을 받습니다
              </p>
              <p className="flex items-center justify-center gap-2">
                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                승인 후 모든 기능을 사용할 수 있습니다
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                메인 페이지로 돌아가기
              </Button>
            </Link>

            <form
              action={async () => {
                "use server";
                const supabase = await createClient();
                await supabase.auth.signOut();
                redirect("/admin/login");
              }}
            >
              <Button type="submit" variant="ghost" className="w-full">
                로그아웃
              </Button>
            </form>
          </div>
        </div>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          문의사항이 있으시면 관리자에게 연락해주세요.
        </p>
      </div>
    </div>
  );
}
