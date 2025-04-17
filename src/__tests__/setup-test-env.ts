import { beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

// 로컬 Supabase에 테이블 생성을 위한 setupFiles
beforeAll(async () => {
  const adminSupabase = createClient(
    process.env.SUPABASE_TEST_URL || "http://127.0.0.1:54321",
    process.env.SUPABASE_TEST_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU",
  );

  try {
    // 테이블 생성 시도
    try {
      await adminSupabase.rpc("postgres", {
        sql: `
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        DROP TABLE IF EXISTS public.links;

        CREATE TABLE IF NOT EXISTS public.links (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          slug text NOT NULL UNIQUE,
          original_url text NOT NULL,
          click_count integer DEFAULT 0,
          created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
        );
      `,
      });
    } catch (e) {
      console.error("테이블 생성 에러:", e);
      // 첫 번째 방법이 실패하면 SQL 직접 실행을 시도
      await adminSupabase.rpc("exec", {
        sql: `
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

          DROP TABLE IF EXISTS public.links;

          CREATE TABLE IF NOT EXISTS public.links (
            id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
            slug text NOT NULL UNIQUE,
            original_url text NOT NULL,
            click_count integer DEFAULT 0,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
          );
        `,
      });
    }

    console.log("Test environment setup completed");
  } catch (err) {
    console.warn("테이블 생성 에러. 이미 존재할 수 있습니다:", err);
  }
});
