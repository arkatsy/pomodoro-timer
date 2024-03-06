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
import { Palette, Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import useSound from "use-sound";
import Settings from "@/components/settings";
import usePalette from "@/hooks/usePalette";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./components/ui/select";
import { useTheme } from "./hooks/useTheme";

export default function App() {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { activeTabId, setActiveTabId, sessions, muted } = useStore();
  const [playTabSound] = useSound(tabSound, { volume: 0.15 });
  const [palette, setPalette] = usePalette();
  const [theme] = useTheme();

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
            className={cn("w-screen max-w-2xl select-none rounded-full", isMobile && "rounded-none p-0")}
          >
            {tabs.map((tab) => (
              <div className="relative z-0 h-full w-full" key={tab.id}>
                <TabsTrigger
                  value={tab.id}
                  className={cn(
                    "text-md peer relative z-20 h-full w-full rounded-none text-secondary-foreground sm:rounded-full sm:text-xl sm:data-[state=active]:bg-transparent",
                    palette !== "initial" && "text-secondary-foreground/75",
                  )}
                >
                  {tab.name}
                </TabsTrigger>
                {!isMobile && tab.id === activeTabId && (
                  <motion.div
                    id={`timer-tab-${tab.id}`}
                    layoutId="timer-tab"
                    className={
                      "absolute inset-0 z-10 rounded-full peer-data-[state=active]:bg-background peer-data-[state=active]:shadow-sm"
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
              <Timer type={activeTabId} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
      {!isMobile && (
        <div className="mb-24">
          <Settings />
        </div>
      )}
      {!isMobile && (
        <div className="mb-16 mr-24 self-end">
          <Select onValueChange={setPalette}>
            <SelectTrigger className="flex size-10 items-center justify-center border-none p-1">
              <Color palette={palette} />
            </SelectTrigger>
            <SelectContent className="" side="top" align="end">
              {Object.keys(palettes).map((key) => (
                <SelectItem value={key} key={key}>
                  <Color palette={key as "initial" | "olive" | "vanilla" | "sand"} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

const palettes = {
  initial: {
    dark: "#111112",
    light: "#000000",
  },
  olive: {
    dark: "#273518",
    light: "#273518",
  },
  vanilla: {
    dark: "#5a0c0d",
    light: "#360708",
  },
  sand: {
    dark: "#287170",
    light: "#274754",
  },
};

function Color({ palette = "initial" }: { palette: "initial" | "olive" | "vanilla" | "sand" }) {
  const [theme] = useTheme();

  const color = palettes[palette][theme === "dark" ? "dark" : "light"];

  return <div style={{ backgroundColor: color }} className="size-5 rounded-full" />;
}

function Timer({ type }: { type: TabId }) {
  const { nextTab, muted, session } = useStore((state) => ({
    nextTab: state.nextTab,
    muted: state.muted,
    session: state.sessions[type],
  }));
  const [count, setCount] = useState(session);
  const [status, setStatus] = useState<"idle" | "running" | "stopped" | "done">("idle");
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

  // Syncs the count with the session time when session changes (e.g. from settings)
  useEffect(() => {
    worker.stop();
    setCount(session);
    setStatus("idle");
  }, [session]);

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
    setCount(session);
    !muted && playTabSound();
    nextTab();
  };

  const handleResetClick = () => {
    worker.stop();
    setStatus("idle");
    setCount(session);
  };

  return (
    <div className="flex flex-col gap-32 sm:gap-20">
      <div className="flex items-center justify-center text-9xl font-medium">{formatTime(count)}</div>
      <div className="flex justify-center gap-8">
        <Button
          variant="ghost"
          size="icon"
          className="group size-20 rounded-xl sm:size-16"
          onClick={handleResetClick}
        >
          <RotateCcw className="size-10 opacity-70 group-hover:opacity-100 group-focus-visible:opacity-100 sm:size-9" />
        </Button>
        <Button
          variant="default"
          size="icon"
          className="size-20 rounded-xl sm:size-16"
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
          className="group size-20 rounded-xl sm:size-16"
          onClick={handleSkipClick}
        >
          <SkipForward className="size-10 opacity-70 group-hover:opacity-100 group-focus-visible:opacity-100 sm:size-9" />
        </Button>
      </div>
    </div>
  );
}
