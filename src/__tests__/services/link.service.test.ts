import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { testSupabase } from "../setup";

vi.mock("@/libs/supabase", () => {
  return {
    supabase: testSupabase,
  };
});

// NOTE: LinkService 임포트는 supabase 모킹 이후에 해야 합니다
import { LinkService } from "@/services/link.service";

// Snowflake 클래스 직접 초기화를 위한 설정
// 실제로는 외부에서 접근할 수 없는 private static 변수이므로 모킹 대신 테스트마다 다른 시간 설정

describe("LinkService", () => {
  describe("Snowflake Algorithm", () => {
    // 각 테스트 전에 데이터 정리 및 타이머 설정
    beforeEach(async () => {
      // 먼저 타이머 설정 초기화
      vi.resetAllMocks();
      vi.useFakeTimers();

      // 테스트 전에 테이블의 모든 기존 데이터 삭제
      await testSupabase
        .from("links")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("생성된 slug는 base62 문자만 포함해야 합니다", async () => {
      // 각 테스트마다 다른 시간 사용
      vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));

      const { slug } = await LinkService.createShortLink({
        original_url: "https://example.com",
      });

      expect(typeof slug).toBe("string");
      expect(slug).toMatch(/^[0-9a-zA-Z]+$/);
    });

    it("다른 시간에 생성된 slug는 서로 달라야 합니다", async () => {
      // 충분히 다른 시간 설정
      vi.setSystemTime(new Date("2024-01-02T00:00:00Z"));

      // 첫 번째 slug 생성
      const link1 = await LinkService.createShortLink({
        original_url: "https://example1.com",
      });

      // 시간을 앞으로 이동
      vi.advanceTimersByTime(1000);

      const link2 = await LinkService.createShortLink({
        original_url: "https://example2.com",
      });

      expect(link1.slug).not.toBe(link2.slug);
    });

    it("같은 밀리초에 생성된 slug도 서로 달라야 합니다", async () => {
      // 이전 테스트와 다른 시간 설정
      vi.setSystemTime(new Date("2024-01-03T00:00:00Z"));

      // 순차적으로 실행
      const link1 = await LinkService.createShortLink({
        original_url: "https://example1.com",
      });
      const link2 = await LinkService.createShortLink({
        original_url: "https://example2.com",
      });
      const link3 = await LinkService.createShortLink({
        original_url: "https://example3.com",
      });

      const slugs = [link1, link2, link3];
      const uniqueSlugs = new Set(slugs.map((link) => link.slug));
      expect(uniqueSlugs.size).toBe(slugs.length);
    });

    it("생성된 slug의 길이는 일정 범위 내여야 합니다", async () => {
      // 이전 테스트와 겹치지 않는 시간 설정
      vi.setSystemTime(new Date("2024-01-04T00:00:00Z"));

      const { slug } = await LinkService.createShortLink({
        original_url: "https://example.com",
      });

      expect(slug.length).toBeGreaterThanOrEqual(8);
      expect(slug.length).toBeLessThanOrEqual(13);
    });

    it("생성된 모든 링크를 확인합니다", async () => {
      // 테스트를 위한 링크 생성
      const testUrls = [
        "https://example.com/1",
        "https://example.com/2",
        "https://example.com/3",
      ];

      // 여러 링크 생성
      for (const url of testUrls) {
        await LinkService.createShortLink({ original_url: url });
      }

      // 생성된 링크 조회
      const { data: links, error } = await testSupabase
        .from("links")
        .select("*")
        .order("created_at", { ascending: false });

      // 에러가 없어야 함
      expect(error).toBeNull();

      // 데이터가 존재해야 함
      expect(links).not.toBeNull();
      expect(links?.length).toBeGreaterThan(0);

      // 각 링크 데이터 출력
      console.log("\n=== 생성된 링크 목록 ===");
      links?.forEach((link) => {
        console.log(`원본 URL: ${link.original_url}`);
        console.log(`단축 URL: ${link.slug}`);
        console.log(`생성 시간: ${link.created_at}`);
        console.log("------------------------");
      });
    });
  });
});
