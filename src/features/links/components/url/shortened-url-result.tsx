"use client";

import { useState, useEffect } from "react";
import { StringUtils } from "@/shared/utils/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { CheckCircle2, Copy, Check } from "lucide-react";

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
    } catch {
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
    <Alert className="w-full max-w-md mt-4 border-green-200 bg-green-50">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertDescription>
        <div className="space-y-3">
          <h3 className="font-medium text-green-900">단축 URL이 생성되었습니다!</h3>

          <div className="space-y-2">
            <Label htmlFor="shortened-url" className="text-sm text-gray-600">
              단축된 URL:
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="shortened-url"
                type="text"
                readOnly
                value={shortUrl}
                aria-label="단축된 URL"
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1"
              />
              <Button
                onClick={copyToClipboard}
                size="sm"
                variant={isCopied ? "default" : "outline"}
                aria-label="URL 복사하기"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    복사
                  </>
                )}
              </Button>
            </div>
            {message && (
              <p
                className={`text-sm ${
                  isCopied ? "text-green-600" : "text-red-500"
                }`}
                role="status"
                aria-live="polite"
              >
                {message}
              </p>
            )}
          </div>

          <div className="text-xs text-muted-foreground mt-2 space-y-1">
            <p>이 링크를 소셜 미디어, 이메일 또는 메시지에 공유하세요.</p>
            <p>링크를 클릭하면 원래 URL({originalUrl})로 리다이렉션됩니다.</p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
