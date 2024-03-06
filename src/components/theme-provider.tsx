import { createContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
type Palette = "initial" | "olive" | "vanilla" | "sand";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultPalette: Palette;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  palette: Palette;
  setTheme: (theme: Theme) => void;
  setPalette: (palette: Palette) => void;
};

const getStorageKey = (key: string) => `ui-${key}`;

export const ThemeProviderContext = createContext<ThemeProviderState | null>(null);

export function ThemeProvider({
  defaultTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  defaultPalette = "initial",
  storageKey = getStorageKey("theme"),
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(getStorageKey("theme")) as Theme) || defaultTheme,
  );
  const [palette, setPalette] = useState<Palette>(
    () => (localStorage.getItem(getStorageKey("palette")) as Palette) || defaultPalette,
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("data-palette", palette);
  }, [palette]);

  const value = {
    theme,
    palette,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    setPalette: (palette: Palette) => {
      localStorage.setItem(getStorageKey("palette"), palette);
      setPalette(palette);
    },
  };

  return <ThemeProviderContext.Provider {...props} value={value} />;
}
