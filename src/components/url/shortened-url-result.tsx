"use client";

interface Props {
  shortUrl: string;
}

export function ShortenedUrlResult({ shortUrl }: Props) {
  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shortUrl);
      alert("URL이 클립보드에 복사되었습니다!");
    } catch (error) {
      alert("URL 복사에 실패했습니다.");
    }
  }

  return (
    <div className="w-full max-w-md p-4 mt-4 bg-gray-50 rounded-lg">
      <p className="mb-2 text-sm text-gray-600">단축된 URL:</p>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={shortUrl}
          className="w-full px-3 py-2 text-sm bg-white border rounded focus:outline-none"
        />
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          복사
        </button>
      </div>
    </div>
  );
}
