"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        redirect("/login");
      }

      setUser(user);
      setEmail(user.email || null);
      setLoading(false);
    }

    getUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    redirect("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-center text-3xl font-bold">내 프로필</h1>

      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="mb-4">
          <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            이메일
          </p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {email}
          </p>
        </div>

        <div className="mb-4">
          <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            사용자 ID
          </p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {user?.id}
          </p>
        </div>

        <div className="mb-4">
          <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
            마지막 로그인
          </p>
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {user?.last_sign_in_at
              ? new Date(user.last_sign_in_at).toLocaleString()
              : "정보 없음"}
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
