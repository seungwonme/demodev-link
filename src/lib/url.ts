/**
 * 서비스의 기본 URL을 반환합니다.
 * 환경변수 NEXT_PUBLIC_BASE_URL을 우선 사용하고,
 * 없으면 현재 브라우저의 origin을 fallback으로 사용합니다.
 */
export function getBaseUrl(): string {
  // 환경변수 우선 사용 (커스텀 도메인)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // 클라이언트 환경에서 fallback
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // 서버 환경에서 fallback
  return "";
}

/**
 * slug로 완전한 단축 URL을 생성합니다.
 */
export function getShortUrl(slug: string): string {
  return `${getBaseUrl()}/${slug}`;
}
