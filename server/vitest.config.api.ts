import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // include: ["src/**/*.test.ts"],
    include: ["src/test/api/**/*.test.ts"],
    globals: true,
    environment: "node"
  },
});
