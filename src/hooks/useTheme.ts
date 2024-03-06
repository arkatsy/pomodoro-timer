import { ThemeProviderContext } from "@/components/theme-provider";
import { useContext } from "react";

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (!context) throw new Error("useTheme must be used within a ThemeProvider");

  return [context.theme, context.setTheme] as const;
};
