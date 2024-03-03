import switchOff from "@/assets/switch-off.wav";
import switchOn from "@/assets/switch-on.wav";
import { useTheme } from "@/hooks/useTheme";
import { Expand } from "@theme-toggles/react";
import "@theme-toggles/react/css/Expand.css";
import useSound from "use-sound";

export default function Header() {
  return (
    <div className="flex justify-between px-6 pt-8 sm:px-24 sm:pt-16">
      <Logo />
      <ThemeToggle />
    </div>
  );
}

function Logo() {
  return <div className="select-none text-4xl font-semibold tracking-wide">Pomodoro</div>;
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
