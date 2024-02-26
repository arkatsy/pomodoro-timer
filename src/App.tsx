import switchOff from "@/assets/switch-off.wav";
import switchOn from "@/assets/switch-on.wav";
import tabSound from "@/assets/tab-sound.wav";
import { Expand } from "@theme-toggles/react";
import "@theme-toggles/react/css/Expand.css";
import { motion } from "framer-motion";
import useSound from "use-sound";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/hooks/useTheme";
import useWindowSize from "@/hooks/useWindowSize";
import { cn, formatTime } from "@/lib/utils";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { produce } from "immer";
import { Button } from "./components/ui/button";
import { Pause, Play, RotateCcw, RotateCw, SkipForward } from "lucide-react";
import { useState } from "react";

const TABS: { id: TabId; name: string }[] = [
  { id: "pomodoro", name: "Pomodoro" },
  { id: "short-break", name: "Short Break" },
  { id: "long-break", name: "Long Break" },
];

const tabIds = ["pomodoro", "short-break", "long-break"] as const;
type TabId = (typeof tabIds)[number];

type Store = {
  readonly activeTabId: TabId;
  readonly timers: Record<TabId, number>;

  readonly setActiveTabId: (newTabId: TabId) => void;
  readonly setPomodoro: (session: number) => void;
  readonly setShortBreak: (session: number) => void;
  readonly setLongBreak: (session: number) => void;
};

const useStore = create<Store>()(
  persist(
    (set) => ({
      activeTabId: tabIds[0],
      timers: {
        pomodoro: 25 * 60, // 25 minutes
        "short-break": 5 * 60, // 5 minutes
        "long-break": 15 * 60, // 15 minutes
      },

      // prettier-ignore
      setActiveTabId: (newTabId) => set(produce((state) => { state.activeTabId = newTabId; })),
      // prettier-ignore
      setPomodoro: (session: number) =>set(produce((state) => { state.timers.pomodoro = session; })),
      // prettier-ignore
      setShortBreak: (session: number) => set(produce((state) => { state.timers["short-break"] = session; })),
      // prettier-ignore
      setLongBreak: (session: number) => set(produce((state) => { state.timers["long-break"] = session; })),
    }),
    { name: "store" },
  ),
);

// TODO: Hide logo in small screens (mobile ?)
// TODO: Move duration time to a source of truth place
// TODO: Add action buttons
// TODO: On mobile, the timer needs to be more at the center
// FIXME: On color mode change, the tab text color is changing with a delay (happens only on the inactive tabs) ?!
// FIXME: Absolute positioned header items (possibly) are ruining the tabing experience.
export default function App() {
  const { activeTabId, setActiveTabId, timers } = useStore();
  const [windowWidth] = useWindowSize(); // TODO: useWindowSize hook needs improvement (change initial value to null maybe ?)
  const [playTabSound] = useSound(tabSound, { volume: 0.15 });
  const isMobile = windowWidth > 0 && windowWidth < 640; // NOTE: Remember to update if change the useWindowSize hook

  const onTabChange = (newTabId: string) => {
    playTabSound();
    setActiveTabId(newTabId as TabId);
  };

  return (
    <div className="min-h-dvh">
      <div className="absolute right-10 top-10 sm:right-20 sm:top-20">
        <ThemeToggle />
      </div>
      <div className="absolute left-10 top-[2.3rem] sm:left-20 sm:top-[4.5rem]">
        <Logo />
      </div>
      {/* ------ POMODORO ------- */}
      <div className="flex min-h-dvh items-center justify-center">
        <Tabs
          defaultValue={activeTabId}
          onValueChange={onTabChange}
          className="fixed bottom-0 mt-0 flex flex-col-reverse items-center gap-24 sm:static sm:-mt-4 sm:flex-col"
        >
          <TabsList
            className={cn(
              "w-screen max-w-2xl select-none rounded-full transition-colors duration-300",
              isMobile && "rounded-none p-0",
            )}
          >
            {TABS.map((tab) => (
              <div className="relative z-0 h-full w-full" key={tab.id}>
                <TabsTrigger
                  value={tab.id}
                  className="text-md peer relative z-20 h-full w-full rounded-none transition-colors duration-300 data-[state=active]:bg-primary-foreground sm:rounded-full sm:text-xl sm:data-[state=active]:bg-transparent"
                >
                  {tab.name}
                </TabsTrigger>
                {!isMobile && tab.id === activeTabId && (
                  <motion.div
                    id={`timer-tab-${tab.id}`}
                    layoutId="timer-tab"
                    className={
                      "absolute inset-0 z-10 rounded-full transition-colors duration-300 peer-data-[state=active]:bg-background peer-data-[state=active]:text-foreground peer-data-[state=active]:shadow-sm"
                    }
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 40,
                    }}
                  />
                )}
              </div>
            ))}
          </TabsList>
          {TABS.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <Timer session={timers[tab.id]} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

function Timer({ session }: { session: number }) {
  const [status, setStatus] = useState<"idle" | "running" | "paused">("idle");

  const isRunning = status === "running";
  const isPaused = status === "paused";
  const isIdle = status === "idle";

  const handleButtonClick = () => {
    if (isIdle) {
      setStatus("running");
    } else if (isRunning) {
      setStatus("paused");
    } else if (isPaused) {
      setStatus("running");
    } else {
      console.error("Unknown status");
    }
  };

  // FIXME: Ghost buttons keep their hover css colors after touching on mobile
  return (
    <div className="flex flex-col gap-32 sm:gap-20">
      <div className="flex items-center justify-center text-9xl font-medium">{formatTime(session)}</div>
      <div className="flex justify-center gap-8">
        <Button variant="ghost" size="icon" className="size-20 group transition-colors duration-300 sm:size-16">
          <RotateCcw className="size-10 sm:size-9 group-hover:opacity-100 opacity-70 duration-300 transition-opacity" />
        </Button>
        <Button
          variant="default"
          size="icon"
          className="size-20 transition-colors duration-300 sm:size-16"
          onClick={handleButtonClick}
        >
          {isRunning ? (
            <Pause className="size-10 sm:size-9" />
          ) : isPaused ? (
            <Play className="ml-1 size-10 sm:size-9" />
          ) : (
            <Play className="ml-1 size-10 sm:size-9" />
          )}
        </Button>
        <Button variant="ghost" size="icon" className="size-20 transition-colors duration-300 sm:size-16 group">
          <SkipForward className="size-10 sm:size-9 opacity-70 group-hover:opacity-100 duration-300 transition-opacity" />
        </Button>
      </div>
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
