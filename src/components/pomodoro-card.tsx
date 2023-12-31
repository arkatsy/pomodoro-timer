import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@radix-ui/react-tabs";
import { type TimerId, defaultTimerTabs, formatTime, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import useCountdown from "@/hooks/useCountdown";
import { ComponentProps, useState } from "react";
import { FastForward, PauseIcon, PlayIcon, RotateCcwIcon, SettingsIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Separator } from "./ui/separator";

function ButtonWithTooltip({
  children,
  tooltip,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  tooltip: string;
} & ComponentProps<typeof Button>) {
  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button className={className} {...props}>
            {children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function PomodoroCard() {
  const [tabs, setTabs] = useState(defaultTimerTabs);
  const getTabSession = (tabId: TimerId = tabs.find((tab) => tab.isActive)!.id) =>
    tabs.find((tab) => tab.id === tabId)!.time;

  const { time, begin, status, pause, resume, reset: handleResetButtonClick, setSession } = useCountdown(getTabSession);

  const handleTabChange = (value: string) => {
    const tabId = value as TimerId;
    setTabs((tabs) => tabs.map((tab) => ({ ...tab, isActive: tab.id === tabId })));
    setSession(getTabSession(tabId));
  };

  const moveToNextTab = () => {
    const activeTabIndex = tabs.findIndex((tab) => tab.isActive);
    const nextTabIndex = (activeTabIndex + 1) % tabs.length;
    handleTabChange(tabs[nextTabIndex].id);
  };

  const handlePlaybackButtonClick = () => (isIdle ? begin() : isRunning ? pause() : resume());

  const activeTabId = tabs.find((tab) => tab.isActive)!.id;
  const isRunning = status === "running";
  const isIdle = status === "idle";
  const isPaused = status === "paused";
  const isBreak = !(activeTabId === "pomodoro");
  const shouldDisableTabs = !isIdle;
  const progress = (time / getTabSession()) * 100;
  const controlButtons = [
    { id: "reset", Icon: RotateCcwIcon, tooltip: "Reset Timer", onClick: handleResetButtonClick },
    {
      id: "playstop",
      Icon: isIdle || isPaused ? PlayIcon : PauseIcon,
      tooltip: "Start/Pause Timer",
      onClick: handlePlaybackButtonClick,
    },
    { id: "skip", Icon: FastForward, tooltip: isBreak ? "Skip Break" : "Skip Session", onClick: moveToNextTab },
  ] as const;

  return (
    <Card id="pomodoro-card" className="w-full min-w-fit max-w-lg space-y-0 p-10">
      <CardHeader className="px-0 pb-10 pt-0">
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-3xl ">Pomodoro</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <ButtonWithTooltip tooltip="Pomodoro Settings" variant="ghost" className="group py-6">
                <SettingsIcon className="h-5 w-5 text-primary/80 group-hover:text-primary" />
              </ButtonWithTooltip>
            </DialogTrigger>
            <DialogContent className="top-[25%]">
              <DialogHeader>
                <DialogTitle className="text-2xl">Pomodoro Settings</DialogTitle>
              </DialogHeader>
              <Separator />
              <div>
                <p>Coming Soon</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <Tabs value={activeTabId} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 items-center justify-center rounded-md bg-muted p-1.5 text-muted-foreground">
          {tabs.map(({ id, name }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="text-md inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-2 font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              disabled={shouldDisableTabs}
            >
              {name}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent
          value={activeTabId}
          tabIndex={-1}
          className="mt-16 flex flex-col items-center justify-center ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className="text-[7rem] font-semibold">{formatTime(time)}</span>
          <div className="flex w-full flex-col gap-16">
            <Progress
              value={progress}
              max={100}
              className={`h-2 rounded-md bg-primary-foreground text-primary ${
                isPaused && "animate-pulse text-primary"
              }`}
            />
            <div className="flex w-full justify-center gap-8">
              {controlButtons.map(({ id, Icon, tooltip, onClick }) => (
                <ButtonWithTooltip
                  key={id}
                  className="group py-6"
                  tooltip={tooltip}
                  onClick={onClick}
                  variant={id === "playstop" ? "default" : "outline"}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6 ",
                      id === "playstop" ? "text-primary-foreground" : "text-primary/80 group-hover:text-primary",
                    )}
                  />
                </ButtonWithTooltip>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
