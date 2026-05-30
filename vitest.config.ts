import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
  // Mirror the tsconfig `@/* -> ./src/*` path alias so runtime (non-type-only)
  // `@/...` imports resolve under Vitest, not just `tsc`.
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
