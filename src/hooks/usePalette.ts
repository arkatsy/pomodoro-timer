import { ThemeProviderContext } from "@/components/theme-provider";
import { useContext } from "react";

export default function usePalette() {
  const ctx = useContext(ThemeProviderContext);

  if (!ctx) {
    throw new Error("usePalette must be used within a ThemeProvider");
  }

  return [ctx.palette, ctx.setPalette] as const;
}
