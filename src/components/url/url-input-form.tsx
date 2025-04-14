"use client";

import { shortenUrl } from "@/actions/shorten-url";
import { useState } from "react";

interface Props {
  onSuccess: (shortUrl: string) => void;
  onError: (error: string) => void;
}

export function UrlInputForm({ onSuccess, onError }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    try {
      setIsLoading(true);
      const url = formData.get("url") as string;

      if (!url) {
        onError("URL을 입력해주세요.");
        return;
      }

      const result = await shortenUrl({ original_url: url });
      onSuccess(result.shortUrl);
    } catch (error) {
      onError("URL을 단축하는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="w-full max-w-md space-y-4">
      <div className="flex flex-col gap-2">
        <input
          type="url"
          name="url"
          placeholder="https://example.com"
          required
          className="w-full px-4 py-2 text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        >
          {isLoading ? "처리중..." : "URL 단축하기"}
        </button>
      </div>
    </form>
  );
}
