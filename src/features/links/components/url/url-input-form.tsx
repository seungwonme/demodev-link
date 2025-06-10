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
import { AlertCircle, Info, Loader2, X, Link2, Sparkles, Settings2, Globe, Hash } from "lucide-react";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";
import { Card, CardContent } from "@/shared/components/ui/card";

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
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Info className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">로그인이 필요합니다</h3>
              <p className="text-muted-foreground">
                URL 단축 기능은 회원 전용 서비스입니다.
              </p>
            </div>
            <Button asChild size="lg" className="hover-lift">
              <Link href="/admin/login">
                로그인하러 가기
                <Sparkles className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-0 shadow-2xl glass-effect">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <CardContent className="relative p-8">
          <form action={handleSubmit} className="space-y-6">
            {/* Main URL Input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-white" />
                </div>
                <Label htmlFor="url-input" className="text-lg font-semibold">
                  단축할 URL
                </Label>
              </div>
              <div className="relative group">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="url-input"
                  type="url"
                  name="url"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="https://example.com/very-long-url"
                  aria-describedby={error ? "url-error" : undefined}
                  disabled={isLoading}
                  className="pl-10 pr-10 h-12 text-base transition-all focus:scale-[1.02]"
                  required
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={() => setInputValue("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="입력 내용 지우기"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                설명 추가 (선택사항)
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
                className="resize-none transition-all focus:scale-[1.01]"
              />
              <p className="text-xs text-muted-foreground">
                나중에 링크를 쉽게 찾고 관리할 수 있도록 설명을 추가해보세요.
              </p>
            </div>

            {/* Custom Slug Toggle */}
            <div className="p-4 rounded-lg bg-muted/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <Hash className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <Label htmlFor="custom-slug" className="text-sm font-medium cursor-pointer">
                      커스텀 주소 사용
                    </Label>
                    <p className="text-xs text-muted-foreground">원하는 주소로 지정할 수 있습니다</p>
                  </div>
                </div>
                <Switch
                  id="custom-slug"
                  checked={showCustomSlug}
                  onCheckedChange={setShowCustomSlug}
                  disabled={isLoading}
                />
              </div>
              
              {showCustomSlug && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                  <div className="flex items-center space-x-2 p-3 rounded-md bg-background/50">
                    <span className="text-sm font-medium text-muted-foreground">{window.location.origin}/</span>
                    <Input
                      id="slug-input"
                      type="text"
                      name="slug"
                      value={customSlug}
                      onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                      placeholder="my-custom-link"
                      disabled={isLoading}
                      className="flex-1 border-0 bg-transparent focus:ring-0 p-0 h-auto"
                      maxLength={50}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    영문(a-z, A-Z), 숫자(0-9), 하이픈(-)만 사용 가능
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="w-full h-12 text-base font-medium hover-lift group"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  URL 단축하기
                  <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" id="url-error" className="animate-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Result */}
      {shortUrl && (
        <div className="animate-in slide-in-from-bottom-3">
          <ShortenedUrlResult shortUrl={shortUrl} />
        </div>
      )}
    </div>
  );
}