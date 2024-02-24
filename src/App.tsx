import switchOff from "@/assets/switch-off.wav";
import switchOn from "@/assets/switch-on.wav";
import tabSound from "@/assets/tab-sound.wav";
import { Expand } from "@theme-toggles/react";
import "@theme-toggles/react/css/Expand.css";
import { motion } from "framer-motion";
import { useState } from "react";
import useSound from "use-sound";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/hooks/useTheme";
import useWindowSize from "@/hooks/useWindowSize";
import { cn } from "@/lib/utils";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const TABS: { id: TabId; name: string }[] = [
  { id: "pomodoro", name: "Pomodoro" },
  { id: "short-break", name: "Short Break" },
  { id: "long-break", name: "Long Break" },
];

const tabIds = ["pomodoro", "short-break", "long-break"] as const;
type TabId = (typeof tabIds)[number];

type ActiveTabStore = {
  activeTabId: TabId;
  setActiveTabId: (newTabId: TabId) => void;
};

const useActiveTabStore = create<ActiveTabStore>()(
  persist(
    (set) => ({
      activeTabId: tabIds[0],
      setActiveTabId: (newTabId) => set((state) => ({ activeTabId: newTabId })),
    }),
    { name: "active-tab" },
  ),
);

// TODO: Hide logo in small screens (mobile ?)
// TODO: Make sure reduced motion is respected
// TODO: Move duration time to a source of truth place
// TODO: Add action buttons
// TODO: On mobile, the timer needs to be more at the center
// FIXME: On color mode change, the tab text color is changing with a delay (happens only on the inactive tabs) ?!
export default function App() {
  const { activeTabId, setActiveTabId } = useActiveTabStore();
  const [windowWidth] = useWindowSize(); // TODO: useWindowSize hook needs improvement (change initial value to null maybe ?)
  const [playTabSound] = useSound(tabSound, { volume: 0.2 });
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
          className={cn(
            "flex flex-col items-center gap-20",
            isMobile && "fixed bottom-0 flex-col-reverse",
          )}
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
                  className={cn(
                    "peer relative z-20 h-full w-full rounded-full transition-colors duration-300 data-[state=active]:bg-transparent",
                    isMobile && "text-md rounded-none data-[state=active]:bg-primary-foreground",
                  )}
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
          <div className={cn("order-3", isMobile && "order-0")}>ACTIONS</div>
          <TabsContent value={"pomodoro" as TabId}>
            <div className="flex items-center justify-center text-8xl font-medium">25:00</div>
          </TabsContent>
          <TabsContent value={"short-break" as TabId}>
            <div className="flex items-center justify-center text-8xl font-medium">5:00</div>
          </TabsContent>
          <TabsContent value={"long-break" as TabId}>
            <div className="flex items-center justify-center text-8xl font-medium">15:00</div>
          </TabsContent>
        </Tabs>
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
