"use client";

import { shortenUrl } from "@/actions/shorten-url";
import { useState } from "react";
import { ShortenedUrlResult } from "@/components/url/shortened-url-result";

export default function UrlInputForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");

  function handleSuccess(url: string) {
    setShortUrl(url);
    setError(null);
    // 성공 후 폼 초기화하지 않고 유지 (사용자가 결과 확인 가능)
  }

  function handleError(message: string) {
    setError(message);
    setShortUrl(null);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    if (error) setError(null); // 사용자가 입력 시 이전 오류 메시지 제거
  }

  async function handleSubmit(formData: FormData) {
    // 입력값이 없으면 즉시 반환
    if (!inputValue.trim()) {
      handleError("URL을 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // URL 객체로 기본 검증 시도
      try {
        new URL(inputValue);
      } catch (urlError) {
        handleError(
          "유효한 URL 형식이 아닙니다. 'http://' 또는 'https://'로 시작하는 URL을 입력해주세요.",
        );
        setIsLoading(false);
        return;
      }

      const result = await shortenUrl({ original_url: inputValue });
      handleSuccess(result.shortUrl);
    } catch (error) {
      console.error("URL 단축 오류:", error);

      if (error instanceof Error) {
        handleError(error.message);
      } else {
        handleError("URL을 단축하는 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form action={handleSubmit} className="w-full max-w-md space-y-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="url-input"
            className="text-sm font-medium text-gray-700"
          >
            단축할 URL
          </label>
          <div className="relative">
            <input
              id="url-input"
              type="url"
              name="url"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="https://example.com/very-long-url"
              aria-describedby={error ? "url-error" : undefined}
              disabled={isLoading}
              className="w-full px-4 py-2 pr-10 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
              required
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="입력 내용 지우기"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                처리 중...
              </span>
            ) : (
              "URL 단축하기"
            )}
          </button>
        </div>
      </form>

      {error && (
        <div
          id="url-error"
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600"
        >
          <div className="flex items-start">
            <svg
              className="h-5 w-5 mr-2 text-red-500 mt-0.5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {shortUrl && <ShortenedUrlResult shortUrl={shortUrl} />}
    </div>
  );
}
