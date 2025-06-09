"use client";

import { shortenUrl } from "@/features/links/actions/shorten-url";
import { useState, useEffect } from "react";
import { ShortenedUrlResult } from "@/features/links/components/url/shortened-url-result";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { AlertCircle, Info, Loader2, X } from "lucide-react";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";

export default function UrlInputForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [description, setDescription] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [showCustomSlug, setShowCustomSlug] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);

      // 인증 상태 변경 감지
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsLoggedIn(!!session);
      });

      return () => {
        subscription.unsubscribe();
      };
    };

    checkAuthStatus();
  }, [supabase]);

  function handleSuccess(url: string) {
    setShortUrl(url);
    setError(null);
    // 성공 후 폼 초기화
    setInputValue("");
    setDescription("");
    setCustomSlug("");
    setShowCustomSlug(false);
  }

  function handleError(message: string) {
    setError(message);
    setShortUrl(null);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
    if (error) setError(null); // 사용자가 입력 시 이전 오류 메시지 제거
  }

  async function handleSubmit() {
    // 로그인 상태 체크
    if (!isLoggedIn) {
      handleError("URL 단축 기능은 로그인 후 이용 가능합니다.");
      return;
    }

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
      } catch {
        handleError(
          "유효한 URL 형식이 아닙니다. 'http://' 또는 'https://'로 시작하는 URL을 입력해주세요.",
        );
        setIsLoading(false);
        return;
      }

      const result = await shortenUrl({ 
        original_url: inputValue,
        custom_slug: showCustomSlug && customSlug.trim() ? customSlug.trim() : undefined,
        description: description.trim() || undefined
      });
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

  // 아직 로그인 상태 확인 중이라면 로딩 표시
  if (isLoggedIn === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 로그인하지 않은 경우 안내 메시지 표시
  if (isLoggedIn === false) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <Info className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-700">
          <p>URL 단축 기능은 로그인 후 이용 가능합니다.</p>
          <Button asChild size="sm" className="mt-2">
            <Link href="/login">로그인하러 가기</Link>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <form action={handleSubmit} className="w-full max-w-md space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url-input">
            단축할 URL
          </Label>
          <div className="relative">
            <Input
              id="url-input"
              type="url"
              name="url"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="https://example.com/very-long-url"
              aria-describedby={error ? "url-error" : undefined}
              disabled={isLoading}
              className="pr-10"
              required
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="입력 내용 지우기"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">
              설명 (선택사항)
            </Label>
            <Textarea
              id="description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="이 링크에 대한 설명을 입력하세요 (예: 2024년 블로그 포스트, 회사 소개 페이지 등)"
              disabled={isLoading}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              설명을 추가하면 나중에 링크를 분석할 때 더 쉽게 이해할 수 있습니다.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="custom-slug"
              checked={showCustomSlug}
              onCheckedChange={setShowCustomSlug}
              disabled={isLoading}
            />
            <Label htmlFor="custom-slug" className="text-sm font-normal">
              사용자 정의 주소 사용
            </Label>
          </div>
          
          {showCustomSlug && (
            <div className="space-y-2">
              <Label htmlFor="slug-input">
                사용자 정의 주소 (영문, 숫자, 하이픈만 가능)
              </Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{window.location.origin}/</span>
                <Input
                  id="slug-input"
                  type="text"
                  name="slug"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                  placeholder="my-custom-link"
                  disabled={isLoading}
                  className="flex-1"
                  maxLength={50}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                사용 가능한 문자: 영문(a-z, A-Z), 숫자(0-9), 하이픈(-)
              </p>
            </div>
          )}
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                처리 중...
              </>
            ) : (
              "URL 단축하기"
            )}
          </Button>
        </div>
      </form>

      {error && (
        <Alert variant="destructive" id="url-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {shortUrl && <ShortenedUrlResult shortUrl={shortUrl} />}
    </div>
  );
}
