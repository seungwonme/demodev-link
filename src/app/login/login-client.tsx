"use client";

import { login, signUp, sendMagicLink, resetPassword } from "@/actions/auth";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [showMagicLinkForm, setShowMagicLinkForm] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const errorMessage =
    searchParams.get("message") ||
    "인증 오류가 발생했습니다. 다시 시도해주세요.";

  useEffect(() => {
    // URL 쿼리 파라미터에서 에러 메시지 확인
    if (error) {
      // 모든 에러 메시지를 에러로 표시하기 위해 prefix 추가
      if (error === "expired_link") {
        setMessage("오류: 이메일 링크가 만료되었습니다. 다시 요청해주세요.");
      } else if (error === "auth_error") {
        setMessage(`오류: ${errorMessage}`);
      } else {
        setMessage("오류: 인증 오류가 발생했습니다. 다시 시도해주세요.");
      }
    }
  }, [error, errorMessage]);

  const handleAction = async (formData: FormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      if (showMagicLinkForm) {
        const result = await sendMagicLink(formData);
        if (result?.error) {
          setMessage(result.error);
        } else if (result?.success) {
          setMessage(result.success);
        }
      } else if (showResetForm) {
        const result = await resetPassword(formData);
        if (result?.error) {
          setMessage(result.error);
        } else if (result?.success) {
          setMessage(result.success);
        }
      } else {
        const result = isLogin ? await login(formData) : await signUp(formData);
        if (result?.error) {
          setMessage(result.error);
        } else if (result?.success) {
          setMessage(result.success);
        }
      }
    } catch (error) {
      setMessage("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 화면 모드 변경 함수
  const resetView = () => {
    setShowMagicLinkForm(false);
    setShowResetForm(false);
    setMessage(null);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg p-8 shadow-lg dark:border dark:border-gray-700">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            {showMagicLinkForm
              ? "매직 링크 로그인"
              : showResetForm
              ? "비밀번호 재설정"
              : isLogin
              ? "로그인"
              : "회원가입"}
          </h1>
          <p className="mt-2 text-gray-600">
            {showMagicLinkForm
              ? "이메일로 로그인 링크를 받아보세요"
              : showResetForm
              ? "이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다"
              : isLogin
              ? "링크 통계를 보려면 로그인하세요"
              : "새 계정을 만들어보세요"}
          </p>
        </div>

        {message && (
          <div
            className={`rounded-md p-4 text-sm ${
              message.includes("오류") ||
              message.includes("실패") ||
              message.includes("만료") ||
              message.includes("유효하지") ||
              message.includes("인증") ||
              error // URL에 error 파라미터가 있으면 항상 빨간색으로 표시
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-600"
            }`}
          >
            {message}
          </div>
        )}

        <form action={handleAction} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium ">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="이메일 주소"
            />
          </div>

          {!showMagicLinkForm && !showResetForm && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium ">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="비밀번호"
              />
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-blue-600 px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 text-white"
            >
              {isLoading
                ? "처리 중..."
                : showMagicLinkForm
                ? "매직 링크 받기"
                : showResetForm
                ? "재설정 링크 받기"
                : isLogin
                ? "로그인"
                : "회원가입"}
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-col space-y-2 text-center text-sm">
          {!showMagicLinkForm && !showResetForm && (
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-800"
            >
              {isLogin
                ? "계정이 없으신가요? 회원가입"
                : "이미 계정이 있으신가요? 로그인"}
            </button>
          )}

          {!showResetForm && (
            <button
              type="button"
              onClick={() => {
                if (showMagicLinkForm) {
                  resetView();
                } else {
                  setShowMagicLinkForm(true);
                  setIsLogin(true);
                }
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              {showMagicLinkForm ? "비밀번호로 로그인" : "이메일 링크로 로그인"}
            </button>
          )}

          {!showMagicLinkForm && (
            <button
              type="button"
              onClick={() => {
                if (showResetForm) {
                  resetView();
                } else {
                  setShowResetForm(true);
                  setIsLogin(true);
                }
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              {showResetForm ? "로그인으로 돌아가기" : "비밀번호를 잊으셨나요?"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}