import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/tests/setup.ts",
      includeSource: ["src/**/*.{ts,tsx}"],
    },
    define: {
      "import.meta.vitest": false,
    },
  })
);
