/**
 * 요청 정보(IP, User-Agent 등)를 추출하는 유틸리티
 */
export const RequestUtils = {
  /**
   * 요청에서 IP 주소와 User-Agent 정보를 추출합니다.
   */
  getRequestInfo(req?: Request) {
    try {
      if (req) {
        // 직접 Request 객체가 전달된 경우 (API 라우트)
        const userAgent = req.headers.get("user-agent");
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        return { userAgent, ip };
      }

      // Request 객체가 없는 경우 기본값 반환
      return {
        userAgent: null,
        ip: "unknown",
      };
    } catch (error) {
      console.error("Error getting request info:", error);
      return {
        userAgent: null,
        ip: "unknown",
      };
    }
  },
};
