"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 현재 로그인된 사용자 정보 가져오기
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);

      // 인증 상태 변경 감지
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    fetchUser();
  }, []);

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
      // 먼저 상태를 업데이트하여 UI를 빠르게 업데이트
      setUser(null);

      try {
        // 브라우저 localStorage 등에서 세션 정보 제거
        await supabase.auth.signOut({ scope: "local" });
      } catch (signOutError) {
        // 세션 부재 오류 등은 무시 - 이미 세션이 없는 상태일 수 있음
        console.log(
          "로그아웃 과정에서 오류가 발생했지만 무시됨:",
          signOutError,
        );
      }

      // 페이지 새로고침 및 홈으로 이동
      router.refresh();
      router.push("/");
    } catch (err) {
      console.error("로그아웃 중 예상치 못한 오류:", err);
      // 오류가 발생해도 사용자 경험을 위해 홈으로 이동
      router.push("/");
    }
  };

  if (loading) {
    return <div className="h-8" />;
  }

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <span className="text-sm text-gray-700">{user.email}</span>
          <button
            onClick={handleLogout}
            className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-800 hover:bg-gray-200"
          >
            로그아웃
          </button>
        </>
      ) : (
        <Link
          href="/login"
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
        >
          로그인
        </Link>
      )}
    </div>
  );
}
