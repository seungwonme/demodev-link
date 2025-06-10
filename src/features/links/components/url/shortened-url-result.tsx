"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card, CardContent } from "@/shared/components/ui/card";
import { CheckCircle2, Copy, Check, ExternalLink, QrCode, Share2 } from "lucide-react";

interface Props {
  shortUrl: string;
}

export function ShortenedUrlResult({ shortUrl }: Props) {
  const [isCopied, setIsCopied] = useState(false);

  // 복사 상태 타이머
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setIsCopied(true);
    } catch (error) {
      console.error("URL 복사에 실패했습니다.", error);
    }
  }

  async function shareUrl() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "단축 URL 공유",
          text: "단축된 URL을 공유합니다",
          url: shortUrl,
        });
      } catch (error) {
        console.error("공유하기 실패:", error);
      }
    } else {
      // Share API를 지원하지 않는 경우 복사
      copyToClipboard();
    }
  }

  return (
    <Card className="overflow-hidden border-0 shadow-xl animate-in slide-in-from-bottom-4">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent" />
      <CardContent className="relative p-6">
        <div className="space-y-4">
          {/* Success Header */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">URL이 성공적으로 단축되었습니다!</h3>
              <p className="text-sm text-muted-foreground">아래 링크를 복사하여 사용하세요</p>
            </div>
          </div>

          {/* URL Display */}
          <div className="relative group">
            <Input
              type="text"
              readOnly
              value={shortUrl}
              aria-label="단축된 URL"
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="pr-24 h-12 text-base font-medium bg-muted/30 border-muted-foreground/20 focus:bg-background transition-all"
            />
            <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={copyToClipboard}
                className="h-9 px-3 hover:bg-primary/10"
                aria-label="URL 복사하기"
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="w-full hover:bg-primary/5 hover:border-primary/50 group"
            >
              {isCopied ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-green-600" />
                  복사됨!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
                  클립보드에 복사
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.open(shortUrl, "_blank")}
              className="w-full hover:bg-primary/5 hover:border-primary/50 group"
            >
              <ExternalLink className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
              링크 열기
            </Button>
            
            <Button
              variant="outline"
              onClick={shareUrl}
              className="w-full hover:bg-primary/5 hover:border-primary/50 group"
            >
              <Share2 className="mr-2 h-4 w-4 group-hover:text-primary transition-colors" />
              공유하기
            </Button>
          </div>

          {/* QR Code Hint */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <QrCode className="h-4 w-4" />
              <span>QR 코드는 링크 관리 페이지에서 생성할 수 있습니다</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}