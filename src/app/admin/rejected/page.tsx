import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { XCircleIcon } from "@heroicons/react/24/outline";

export default async function RejectedPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
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

  // If user is pending, redirect to pending page
  if (profile?.status === "pending") {
    redirect("/admin/pending");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <XCircleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            가입 거절됨
          </h1>

          <div className="space-y-4 text-gray-600 dark:text-gray-400">
            <p>
              죄송합니다. 회원가입 신청이 거절되었습니다.
            </p>
            
            {profile?.rejection_reason && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>거절 사유:</strong><br />
                  {profile.rejection_reason}
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
            
            <form action={async () => {
              "use server";
              const supabase = await createClient();
              await supabase.auth.signOut();
              redirect("/admin/login");
            }}>
              <Button type="submit" variant="ghost" className="w-full text-red-600 hover:text-red-700">
                로그아웃
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}