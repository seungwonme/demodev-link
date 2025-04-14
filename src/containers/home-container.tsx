"use client";

import { ShortenedUrlResult } from "@/components/url/shortened-url-result";
import { UrlInputForm } from "@/components/url/url-input-form";
import { useState } from "react";

export function HomeContainer() {
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSuccess(url: string) {
    setShortUrl(url);
    setError(null);
  }

  function handleError(message: string) {
    setError(message);
    setShortUrl(null);
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">URL 단축기</h1>
          <p className="mt-2 text-gray-600">
            긴 URL을 짧고 간단하게 만들어보세요.
          </p>
        </div>

        <UrlInputForm onSuccess={handleSuccess} onError={handleError} />

        {error && (
          <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {shortUrl && <ShortenedUrlResult shortUrl={shortUrl} />}
      </div>
    </main>
  );
}
