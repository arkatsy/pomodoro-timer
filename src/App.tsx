import tabSound from "@/assets/tab-sound.wav";
import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useWindowSize from "@/hooks/useWindowSize";
import useStore from "@/lib/store";
import worker from "@/lib/time-worker";
import { TabId, cn, formatTime, tabs } from "@/lib/utils";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useState } from "react";
import useSound from "use-sound";

// TODO: Merge it with App or create a header component that includes logo + theme toggle
function Logo() {
  return <div className="select-none text-4xl font-semibold tracking-wide">Pomodoro</div>;
}

// TODO: Hide logo in small screens (mobile ?)
// TODO: Move duration time to a source of truth place
// FIXME: Absolute positioned header items (possibly) are ruining the tabing experience.
export default function App() {
  const { activeTabId, setActiveTabId, sessions } = useStore();
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
      <div id="experience" className="flex min-h-dvh items-center justify-center">
        <Tabs
          value={activeTabId}
          onValueChange={onTabChange}
          className="fixed bottom-0 mt-0 flex flex-col-reverse items-center gap-24 sm:static sm:-mt-4 sm:flex-col"
        >
          <TabsList
            className={cn(
              "w-screen max-w-2xl select-none rounded-full transition-colors duration-300",
              isMobile && "rounded-none p-0",
            )}
          >
            {tabs.map((tab) => (
              <div className="relative z-0 h-full w-full" key={tab.id}>
                <TabsTrigger
                  value={tab.id}
                  className="text-md peer relative z-20 h-full w-full rounded-none transition-[colors,_opacity_300ms] duration-300  data-[state=active]:bg-primary-foreground data-[state=inactive]:transition-opacity sm:rounded-full sm:text-xl sm:data-[state=active]:bg-transparent"
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
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id}>
              <Timer sessionTime={sessions[activeTabId]} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

// TODO: Add sounds to the buttons
// TODO: Add tooltip to the buttons
function Timer({ sessionTime }: { sessionTime: number }) {
  const [count, setCount] = useState(sessionTime);
  const [status, setStatus] = useState<"idle" | "running" | "stopped" | "done">("idle");
  const nextTab = useStore((state) => state.nextTab);
  const [playTabSound] = useSound(tabSound, { volume: 0.15 });

  const isRunning = status === "running";
  const isStopped = status === "stopped";
  const isIdle = status === "idle";

  const onTimeTick = () => {
    setCount((prev) => prev - 1);
    if (count === 0) {
      worker.stop();
      setStatus("done");
    }
  };

  useEffect(() => {
    worker.subscribe(onTimeTick);

    return () => {
      worker.unsubscribe(onTimeTick);
    };
  }, []);

  const handlePlayClick = () => {
    if (isIdle || isStopped) {
      worker.start();
      setStatus("running");
    } else {
      worker.stop();
      setStatus("stopped");
    }
  };

  const handleSkipClick = () => {
    worker.stop();
    setStatus("idle");
    setCount(sessionTime);
    playTabSound();
    nextTab();
  };

  const handleResetClick = () => {
    worker.stop();
    setStatus("idle");
    setCount(sessionTime);
  };

  // FIXME: Ghost buttons keep their hover css colors after touching on mobile
  return (
    <div className="flex flex-col gap-32 sm:gap-20">
      <div className="flex items-center justify-center text-9xl font-medium">{formatTime(count)}</div>
      <div className="flex justify-center gap-8">
        <Button
          variant="ghost"
          size="icon"
          className="group size-20 transition-opacity duration-300 sm:size-16"
          onClick={handleResetClick}
        >
          <RotateCcw className="size-10 opacity-70 transition-opacity duration-300 group-hover:opacity-100 sm:size-9" />
        </Button>
        <Button
          variant="default"
          size="icon"
          className="size-20 transition-colors duration-300 sm:size-16"
          onClick={handlePlayClick}
        >
          {isRunning ? (
            <Pause className="size-10 sm:size-9" />
          ) : isStopped ? (
            <Play className="ml-1 size-10 sm:size-9" />
          ) : (
            <Play className="ml-1 size-10 sm:size-9" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="group size-20 transition-opacity duration-300 sm:size-16"
          onClick={handleSkipClick}
        >
          <SkipForward className="size-10 opacity-70 transition-opacity duration-300 group-hover:opacity-100 sm:size-9" />
        </Button>
      </div>
    </div>
  );
}
