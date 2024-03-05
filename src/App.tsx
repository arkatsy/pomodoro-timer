import notificationIcon from "@/assets/notification-icon.png";
import notificationSound from "@/assets/notification-sound.wav";
import tabSound from "@/assets/tab-sound.wav";
import startSound from "@/assets/water-drop.wav";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useMediaQuery from "@/hooks/useMediaQuery";
import useStore from "@/lib/store";
import worker from "@/lib/time-worker";
import { TabId, cn, formatTime, tabs } from "@/lib/utils";
import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useSound from "use-sound";
import Settings from "@/components/settings";

// TODO: Move duration time to a source of truth place
export default function App() {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { activeTabId, setActiveTabId, sessions, muted, setPomodoro, setLongBreak, setShortBreak } =
    useStore();
  const [playTabSound] = useSound(tabSound, { volume: 0.15 });

  const onTabChange = (newTabId: string) => {
    !muted && playTabSound();
    setActiveTabId(newTabId as TabId);
  };

  return (
    <div className="flex min-h-dvh flex-col items-center">
      <Header />
      <div id="experience" className="flex grow items-center justify-center">
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
            <TabsContent className="w-full p-4" key={tab.id} value={tab.id}>
              <Timer sessionTime={sessions[activeTabId]} type={activeTabId} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
      {!isMobile && (
        <div className="mb-24">
          <Settings
            applySettings={(settings) => {
              setPomodoro(settings.pomodoro);
              setShortBreak(settings.shortBreak);
              setLongBreak(settings.longBreak);
            }}
            longBreakSession={sessions["long-break"]}
            shortBreakSession={sessions["short-break"]}
            pomodoroSession={sessions.pomodoro}
          />
        </div>
      )}
    </div>
  );
}

// TODO: Add sounds to the buttons
// TODO: Add tooltip to the buttons
// TODO: Code cleanup
function Timer({ sessionTime, type }: { sessionTime: number; type: TabId }) {
  const [count, setCount] = useState(sessionTime);
  const [status, setStatus] = useState<"idle" | "running" | "stopped" | "done">("idle");
  const { nextTab, muted } = useStore((state) => ({ nextTab: state.nextTab, muted: state.muted }));
  const [playTabSound] = useSound(tabSound, { volume: 0.15 });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    Notification.permission,
  );
  const [playNotificationSound, { stop: stopNotificationSound }] = useSound(notificationSound, {
    volume: 0.5,
  });
  const [playStartSound] = useSound(startSound, { volume: 1 });
  const notificationRef = useRef<Notification | null>(null);

  const isRunning = status === "running";
  const isStopped = status === "stopped";
  const isIdle = status === "idle";

  const tabName = tabs.find((tab) => tab.id === type)!.name;

  // TODO: Preferably this would be better inside the onTimeTick callback
  //       Reminder, the issue was the stale count value
  useEffect(() => {
    if (count === 0) {
      worker.stop();
      setStatus("done");
      !muted && playNotificationSound();
      if (notificationPermission === "granted") {
        notificationRef.current = new Notification(`${tabName}`, {
          body: `Your ${tabName.split(" ").at(1)?.toLowerCase()} ${type === "pomodoro" ? "session" : ""} has finished`,
          icon: notificationIcon,
        });
      }
    }
  }, [count]);

  useEffect(() => {
    const onTimeTick = () => {
      setCount((count) => count - 1);
    };

    // NOTE: If it gets too cumbersome, move it to a separate useEffect and / or a custom hook
    const onVisibilityChange = (e: Event) => {
      if (!notificationRef.current) return;
      if (document.visibilityState === "visible") {
        // TODO: The event is not always triggered as expected, try switch to focus / blur events
        stopNotificationSound();
        notificationRef.current.close();
        notificationRef.current = null;
      }
    };

    worker.subscribe(onTimeTick);
    window.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      worker.unsubscribe(onTimeTick);
      window.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const handlePlayClick = () => {
    Notification.requestPermission().then((result: NotificationPermission) => {
      setNotificationPermission(result);
    });

    if (isIdle) !muted && playStartSound();

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
    !muted && playTabSound();
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
          <RotateCcw className="size-10 opacity-70 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 sm:size-9" />
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
          <SkipForward className="size-10 opacity-70 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 sm:size-9" />
        </Button>
      </div>
    </div>
  );
}
