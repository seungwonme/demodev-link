"use client";

import { updatePassword } from "@/actions/auth";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isValidLink, setIsValidLink] = useState(false);
  const router = useRouter();

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

        // Supabase 세션 확인
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
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
  }, []);

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

        // 세션 상태가 업데이트될 때까지 대기
        const checkSessionAndRedirect = async () => {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) {
            // 세션이 확인되면 메인 페이지로 이동
            router.push("/");
          } else {
            // 세션이 없으면 로그인 페이지로 이동
            router.push("/login");
          }
        };

        // 3초 후 세션 확인 및 리다이렉트
        setTimeout(checkSessionAndRedirect, 3000);
      }
    } catch (error) {
      setMessage("비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">비밀번호 재설정</h1>
          <p className="mt-2 text-gray-600">새로운 비밀번호를 입력해주세요</p>
        </div>

        {message && (
          <div
            className={`rounded-md p-4 text-sm ${
              message.includes("오류") ||
              message.includes("실패") ||
              message.includes("만료") ||
              message.includes("일치하지")
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-600"
            }`}
          >
            {message}
          </div>
        )}

        {isValidLink ? (
          <form action={handlePasswordUpdate} className="mt-8 space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                새 비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="새 비밀번호"
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="비밀번호 확인"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
              >
                {isLoading ? "처리 중..." : "비밀번호 변경하기"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-4 text-center">
            <button
              onClick={() => router.push("/login")}
              className="text-blue-600 hover:text-blue-800"
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
