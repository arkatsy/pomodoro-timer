import { TooltipContent, TooltipTrigger, Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { SunIcon, MoonIcon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import useSound from "use-sound";
import waterDropSound from "@/assets/water-drop.mp3";

export function ThemeSwitcher() {
  const [playWaterDropSound] = useSound(waterDropSound, { volume: 0.5 });

  const { theme, setTheme } = useTheme();
  const Icon = theme === "dark" ? SunIcon : MoonIcon;

  const handleClick = () => {
    playWaterDropSound();
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="rounded-md p-4 text-primary/80 ring-offset-background transition-all hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            onClick={handleClick}
          >
            <Icon className="size-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{theme === "dark" ? "Light mode" : "Dark mode"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
