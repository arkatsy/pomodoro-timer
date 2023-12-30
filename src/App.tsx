import { ThemeProvider } from "@/components/theme-provider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@radix-ui/react-tabs";
import { type TimerId, defaultTimerTabs, formatTime } from "@/lib/utils";
import { Button } from "./components/ui/button";
import useCountdown from "./hooks/useCountdown";
import { useState } from "react";
import { PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react";

export default function App() {
  const [tabs, setTabs] = useState(defaultTimerTabs);
  const getTabSession = (tabId: TimerId = tabs.find((tab) => tab.isActive)!.id) =>
    tabs.find((tab) => tab.id === tabId)!.time;

  const {
    time,
    begin,
    status,
    pause,
    resume,
    reset: handleResetButtonClick,
    setSession,
  } = useCountdown(getTabSession);

  const handleTabChange = (value: string) => {
    const tabId = value as TimerId;
    setTabs((tabs) => tabs.map((tab) => ({ ...tab, isActive: tab.id === tabId })));
    setSession(getTabSession(tabId));
  };
  const handlePlaybackButtonClick = () => (isIdle ? begin() : isRunning ? pause() : resume());

  const isRunning = status === "running";
  const isIdle = status === "idle";
  const isPaused = status === "paused";

  const progress = (time / getTabSession()) * 100;
  const activeTabId = tabs.find((tab) => tab.isActive)!.id;
  const tw_iconSizes = "w-6 h-6";

  return (
    <ThemeProvider defaultTheme="system">
      <div className="flex flex-col items-center min-h-dvh gap-72">
        <Progress
          value={progress}
          className={`rounded-none h-2 text-primary ${isPaused && "text-primary animate-pulse"}`}
        />
        <Tabs className="w-[500px]" value={activeTabId} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3 p-1.5 items-center justify-center rounded-md bg-muted text-muted-foreground">
            {tabs.map(({ id, name }) => (
              <TabsTrigger
                key={id}
                value={id}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 text-md font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                {name}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent
            value={activeTabId}
            tabIndex={-1}
            className="flex gap-16 flex-col justify-center items-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="text-[7rem] font-semibold mt-16">{formatTime(time)}</span>
            <div className="flex gap-8">
              <Button
                variant="outline"
                className="font-bold py-6 text-2xl uppercase tracking-wider"
                onClick={handlePlaybackButtonClick}
              >
                <span>
                  {isIdle || isPaused ? (
                    <PlayIcon className={tw_iconSizes} />
                  ) : (
                    <PauseIcon className={tw_iconSizes} />
                  )}
                </span>
              </Button>
              <Button variant="outline" onClick={handleResetButtonClick} className="py-6">
                <RotateCcwIcon className={tw_iconSizes} />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ThemeProvider>
  );
}
