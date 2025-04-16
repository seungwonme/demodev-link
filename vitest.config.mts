import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    env: {
      SUPABASE_TEST_URL: process.env.SUPABASE_TEST_URL,
      SUPABASE_TEST_KEY: process.env.SUPABASE_TEST_KEY,
    },
    setupFiles: ["./src/__tests__/setup-test-env.ts"],
  },
});
