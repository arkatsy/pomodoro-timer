import "@theme-toggles/react/css/Expand.css";
import { Expand } from "@theme-toggles/react";
import { useTheme } from "./hooks/useTheme";
import switchOn from "@/assets/switch-on.wav";
import switchOff from "@/assets/switch-off.wav";

import useSound from "use-sound";

export default function App() {
  return (
    <div className="relative">
      <div className="absolute top-10 right-10 sm:right-20 sm:top-20">
        <ThemeToggle />
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [playSwitchOnSound] = useSound(switchOn, { volume: 0.5 });
  const [playSwitchOffSound] = useSound(switchOff, { volume: 0.5 });

  const toggleTheme = () => {
    if (theme === "light") {
      playSwitchOnSound();
      setTheme("dark");
    } else {
      playSwitchOffSound();
      setTheme("light");
    }
  };

  const isDark = theme === "dark";

  return (
    <Expand
      placeholder={isDark ? "🌙" : "☀️"}
      className="p-1 text-3xl"
      duration={300}
      toggle={toggleTheme}
      toggled={isDark}
    />
  );
}
