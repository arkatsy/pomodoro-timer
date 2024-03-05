import switchOff from "@/assets/switch-off.wav";
import switchOn from "@/assets/switch-on.wav";
import { useTheme } from "@/hooks/useTheme";
import { Expand } from "@theme-toggles/react";
import "@theme-toggles/react/css/Expand.css";
import { AnimatePresence, motion } from "framer-motion";
import useSound from "use-sound";
import volumeOffSound from "@/assets/volume-off.mp3";
import volumeOnSound from "@/assets/volume-on.mp3";
import useStore from "@/lib/store";

export default function Header() {
  return (
    <div className="flex justify-between px-6 pt-8 sm:px-24 sm:pt-16">
      <Logo />
      <div className="flex gap-4">
        <VolumeToggle />
        <ThemeToggle />
      </div>
    </div>
  );
}

function Logo() {
  return <div className="select-none text-4xl font-semibold tracking-wide">Pomodoro</div>;
}

function VolumeToggle() {
  // TODO: Custom hook that handles the sound mute
  const [isMuted, setIsMuted] = useStore((state) => [state.muted, state.setMuted]);
  const [playVolumeOnSound] = useSound(volumeOnSound, { volume: 0.5 });
  const [playVolumeOffSound] = useSound(volumeOffSound, { volume: 0.5 });

  const toggleMute = () => {
    if (isMuted) {
      playVolumeOnSound();
      setIsMuted(false);
    } else {
      playVolumeOffSound();
      setIsMuted(true);
    }
  };

  return (
    <button onClick={toggleMute} className="p-1">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <AnimatePresence initial={false}>
          <motion.polygon key="vol" points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          {!isMuted && (
            <>
              <motion.path
                key="vol-bar-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                exit={{ opacity: 0, transition: { duration: 0.18, delay: 0.12 } }}
                d="M15.54 8.46a5 5 0 0 1 0 7.07"
              />
              <motion.path
                key="vol-bar-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.17 }}
                exit={{ opacity: 0, transition: { duration: 0.18, delay: 0 } }}
                d="M19.07 4.93a10 10 0 0 1 0 14.14"
              />
            </>
          )}
        </AnimatePresence>
      </svg>
    </button>
  );
}
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const muted = useStore((state) => state.muted);
  const [playSwitchOnSound] = useSound(switchOn, { volume: 0.5 });
  const [playSwitchOffSound] = useSound(switchOff, { volume: 0.5 });

  const toggleTheme = () => {
    if (theme === "light") {
      !muted && playSwitchOnSound();
      setTheme("dark");
    } else {
      !muted && playSwitchOffSound();
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
