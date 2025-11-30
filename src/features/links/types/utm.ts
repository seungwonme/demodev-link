/**
 * UTM (Urchin Tracking Module) 파라미터 타입 정의
 * 마케팅 캠페인 추적을 위한 URL 파라미터
 */
export interface UTMParameters {
  /** 트래픽 소스 (예: google, newsletter, facebook) */
  utm_source?: string;

  /** 마케팅 매체 (예: cpc, banner, email) */
  utm_medium?: string;

  /** 캠페인 이름 (예: spring_sale, product_launch) */
  utm_campaign?: string;

  /** 유료 검색 키워드 (선택) */
  utm_term?: string;

  /** 광고 콘텐츠 구분 (선택) */
  utm_content?: string;
}

/**
 * URL에 UTM 파라미터를 추가하는 유틸 함수
 * @param url 원본 URL
 * @param params UTM 파라미터 객체
 * @returns UTM 파라미터가 추가된 URL
 */
export function addUTMParameters(url: string, params: UTMParameters): string {
  try {
    const urlObj = new URL(url);

    // 빈 값이 아닌 파라미터만 추가
    Object.entries(params).forEach(([key, value]) => {
      if (value && value.trim()) {
        urlObj.searchParams.set(key, value.trim());
      }
    });

    return urlObj.toString();
  } catch (error) {
    // URL이 유효하지 않으면 원본 반환
    console.error("Invalid URL:", error);
    return url;
  }
}

/**
 * UTM 파라미터가 비어있는지 확인
 * @param params UTM 파라미터 객체
 * @returns 모든 파라미터가 비어있으면 true
 */
export function isUTMParametersEmpty(params: UTMParameters): boolean {
  return Object.values(params).every(value => !value || !value.trim());
}
