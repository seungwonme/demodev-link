/**
 * 문자열 조작과 관련된 유틸리티 함수들
 */
export const StringUtils = {
  /**
   * 문자열을 주어진 길이로 잘라내고 말줄임표를 추가합니다.
   */
  truncate(str: string, length: number): string {
    if (!str) return "";
    return str.length > length ? `${str.substring(0, length)}...` : str;
  },

  /**
   * URL에서 도메인 이름만 추출합니다.
   */
  extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      console.error("Error extracting domain from URL:", error);
      return url;
    }
  },
};
