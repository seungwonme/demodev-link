"use client";

import { useState, useEffect } from "react";
import { StringUtils } from "@/lib/utils";

interface Props {
  shortUrl: string;
}

export function ShortenedUrlResult({ shortUrl }: Props) {
  const [message, setMessage] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [originalUrl, setOriginalUrl] = useState<string>("");

  // 복사 메시지 타이머
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setMessage("");
        setIsCopied(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  // 원본 URL 추출 (도메인 표시용)
  useEffect(() => {
    try {
      const domain = StringUtils.extractDomain(shortUrl);
      setOriginalUrl(domain);
    } catch (e) {
      setOriginalUrl("");
    }
  }, [shortUrl]);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setMessage("URL이 클립보드에 복사되었습니다!");
      setIsCopied(true);
    } catch (error) {
      console.error("URL 복사에 실패했습니다.", error);
      setMessage("URL 복사에 실패했습니다.");
    }
  }

  return (
    <div className="w-full max-w-md p-4 mt-4 bg-green-50 border border-green-100 rounded-lg shadow-sm transition-all duration-300 animate-fadeIn">
      <div className="flex items-center mb-2 text-green-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <h3 className="font-medium">단축 URL이 생성되었습니다!</h3>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label
            htmlFor="shortened-url"
            className="block text-sm text-gray-600 mb-1"
          >
            단축된 URL:
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <input
                id="shortened-url"
                type="text"
                readOnly
                value={shortUrl}
                aria-label="단축된 URL"
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full px-3 py-2 text-sm text-gray-700 bg-white border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              onClick={copyToClipboard}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium text-white rounded focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                isCopied
                  ? "bg-green-500 hover:bg-green-600 focus:ring-green-400"
                  : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-400"
              }`}
              aria-label="URL 복사하기"
            >
              {isCopied ? (
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  복사됨
                </span>
              ) : (
                "복사"
              )}
            </button>
          </div>
          {message && (
            <div
              className={`mt-2 text-sm ${
                isCopied ? "text-green-600" : "text-red-500"
              }`}
              role="status"
              aria-live="polite"
            >
              {message}
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 mt-2">
          <p>이 링크를 소셜 미디어, 이메일 또는 메시지에 공유하세요.</p>
          <p>링크를 클릭하면 원래 URL({originalUrl})로 리다이렉션됩니다.</p>
        </div>
      </div>
    </div>
  );
}
