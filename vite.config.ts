import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { visualizer } from "rollup-plugin-visualizer";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly ANALYZE: "true" | undefined;
    }
  }
}

export default defineConfig(({}) => {
  const shouldAnalyze = process.env.ANALYZE === "true";

  return {
    plugins: [
      react(),
      shouldAnalyze &&
        visualizer({
          template: "treemap",
          open: true,
          gzipSize: true,
          filename: "dist/stats.html",
        }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
