import { createClient } from "@supabase/supabase-js";
import { beforeEach, afterAll } from "vitest";

// 테스트용 Supabase 클라이언트 설정 - 로컬 개발 환경의 URL과 키 사용
export const testSupabase = createClient(
  // 실제 로컬 Supabase 주소 사용
  process.env.SUPABASE_TEST_URL || "http://127.0.0.1:54321",
  // service_role 키 사용 - 테이블 생성 등 관리 작업에 필요
  process.env.SUPABASE_TEST_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
);

// 각 테스트 전에 데이터 초기화
beforeEach(async () => {
  try {
    // 테스트마다 데이터 정리
    await testSupabase
      .from("links")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
  } catch (err) {
    console.warn("테스트 데이터 초기화 중 오류 발생:", err);
  }
});

// 테스트 후에 실행될 정리
afterAll(async () => {
  try {
    // 테스트 데이터 최종 정리
    await testSupabase
      .from("links")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    console.log("Test data cleaned up successfully");
  } catch (err) {
    console.error("Error cleaning up test environment:", err);
  }
});
