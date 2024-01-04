import { type ComponentProps, type ElementRef, forwardRef, useState, Fragment } from "react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { formatTime, cn, tabs, helper_tabsList, TabId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Clock as ClockIcon,
  FastForward as FastForwardIcon,
  Pause as PauseIcon,
  Play as PlayIcon,
  RotateCcw as RotateCcwIcon,
  Settings as SettingsIcon,
  Hourglass as HourglassIcon,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { produce } from "immer";
import useTabTimers from "@/hooks/useTabTimers";
import InputNumber from "./ui/input-number";
import { LayoutGroup, motion } from "framer-motion";

export default function PomodoroCard() {
  const {
    activeTab,
    changeActiveTab,
    nextTab,
    applySettings,
    longBreakCountdown,
    pomodoroCountdown,
    shortBreakCountdown,
  } = useTabTimers(25 * 60, 5 * 60, 15 * 60);

  const activeTimer =
    activeTab.id === "pomodoro"
      ? pomodoroCountdown
      : activeTab.id === "shortBreak"
        ? shortBreakCountdown
        : longBreakCountdown;

  const handlePlaybackButtonClick = () =>
    isIdle ? activeTimer.begin() : isRunning ? activeTimer.pause() : activeTimer.resume();

  const isRunning = activeTimer.status === "running";
  const isIdle = activeTimer.status === "idle";
  const isPaused = activeTimer.status === "paused";
  const isBreak = !(+activeTab === 0);
  const shouldDisableTabs = isRunning;
  const progress = (activeTimer.time / activeTimer.session) * 100;
  const controlButtons = [
    { id: "reset", Icon: RotateCcwIcon, tooltip: "Reset Timer", onClick: activeTimer.reset },
    {
      id: "playstop",
      Icon: isIdle || isPaused ? PlayIcon : PauseIcon,
      tooltip: "Start/Pause Timer",
      onClick: handlePlaybackButtonClick,
    },
    { id: "skip", Icon: FastForwardIcon, tooltip: isBreak ? "Skip Break" : "Skip Session", onClick: nextTab },
  ] as const;

  return (
    <Card id="pomodoro-card" className="w-full min-w-[350px] max-w-lg space-y-0 p-10">
      <CardHeader className="px-0 pb-10 pt-0">
        <div className="flex items-baseline justify-between">
          <CardTitle className="text-3xl ">Pomodoro</CardTitle>
          <Settings
            pomodoroSession={pomodoroCountdown.session}
            shortBreakSession={shortBreakCountdown.session}
            longBreakSession={longBreakCountdown.session}
            applySettings={applySettings}
          />
        </div>
      </CardHeader>
      <Tabs value={activeTab.id} onValueChange={(value) => changeActiveTab(value as TabId)}>
        <LayoutGroup>
          <TabsList className="grid h-14 grid-cols-3">
            {helper_tabsList.map((tabId) => (
              <div key={tabId} className="relative z-0 h-full">
                <TabsTrigger
                  value={tabId}
                  className="peer relative z-20 h-full w-full px-0 text-sm data-[state=active]:bg-transparent min-[400px]:text-base"
                  disabled={shouldDisableTabs}
                >
                  {tabs[tabId].name}
                </TabsTrigger>
                {activeTab.id === tabId && (
                  <motion.div
                    className="absolute inset-0 z-10 rounded-md peer-data-[state=active]:bg-background peer-data-[state=active]:text-foreground peer-data-[state=active]:shadow-sm"
                    layoutId="timer-tab"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  ></motion.div>
                )}
              </div>
            ))}
          </TabsList>
        </LayoutGroup>
        <TabsContent
          value={activeTab.id}
          tabIndex={-1}
          className="mt-16 flex flex-col items-center justify-center gap-8 min-[400px]:gap-4"
        >
          <span className="text-8xl font-semibold min-[400px]:text-[7rem]">{formatTime(activeTimer.time)}</span>
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

type SettingsProps = {
  pomodoroSession: number;
  shortBreakSession: number;
  longBreakSession: number;
  applySettings: (newSettings: { pomodoro: number; shortBreak: number; longBreak: number }) => void;
};

function Settings({ pomodoroSession, shortBreakSession, longBreakSession, applySettings }: SettingsProps) {
  const [settings, setSettings] = useState({
    pomodoro: {
      mins: pomodoroSession / 60,
      secs: pomodoroSession % 60,
    },
    shortBreak: {
      mins: shortBreakSession / 60,
      secs: shortBreakSession % 60,
    },
    longBreak: {
      mins: longBreakSession / 60,
      secs: longBreakSession % 60,
    },
  });

  const handleSettingsDone = () => {
    const newPomodoroTime = settings.pomodoro.mins * 60 + settings.pomodoro.secs;
    const newShortBreakSession = settings.shortBreak.mins * 60 + settings.shortBreak.secs;
    const newLongBreakSession = settings.longBreak.mins * 60 + settings.longBreak.secs;

    applySettings({
      pomodoro: newPomodoroTime,
      shortBreak: newShortBreakSession,
      longBreak: newLongBreakSession,
    });
  };

  const handlePomodoroMinsChange = (mins: number) => {
    setSettings(
      produce((draft) => {
        draft.pomodoro.mins = mins;
      }),
    );
  };

  const handlePomodoroSecsChange = (secs: number) => {
    setSettings(
      produce((draft) => {
        draft.pomodoro.secs = secs;
      }),
    );
  };

  const handleShortBreakMinsChange = (mins: number) => {
    setSettings(
      produce((draft) => {
        draft.shortBreak.mins = mins;
      }),
    );
  };

  const handleShortBreakSecsChange = (secs: number) => {
    setSettings(
      produce((draft) => {
        draft.shortBreak.secs = secs;
      }),
    );
  };

  const handleLongBreakMinsChange = (mins: number) => {
    setSettings(
      produce((draft) => {
        draft.longBreak.mins = mins;
      }),
    );
  };

  const handleLongBreakSecsChange = (secs: number) => {
    setSettings(
      produce((draft) => {
        draft.longBreak.secs = secs;
      }),
    );
  };

  const inputGroups = [
    {
      Icon: ClockIcon,
      label: "Session",
      mins: settings.pomodoro.mins,
      secs: settings.pomodoro.secs,
      onMinsChange: handlePomodoroMinsChange,
      onSecsChange: handlePomodoroSecsChange,
    },
    {
      Icon: HourglassIcon,
      label: "Short Break",
      mins: settings.shortBreak.mins,
      secs: settings.shortBreak.secs,
      onMinsChange: handleShortBreakMinsChange,
      onSecsChange: handleShortBreakSecsChange,
    },
    {
      Icon: HourglassIcon,
      label: "Long Break",
      mins: settings.longBreak.mins,
      secs: settings.longBreak.secs,
      onMinsChange: handleLongBreakMinsChange,
      onSecsChange: handleLongBreakSecsChange,
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <ButtonWithTooltip tooltip="Pomodoro Settings" variant="ghost" className="group py-6">
          <SettingsIcon className="h-5 w-5 text-primary/80 group-hover:text-primary" />
        </ButtonWithTooltip>
      </DialogTrigger>
      <DialogContent className="top-1/2">
        <DialogHeader>
          <DialogTitle className="text-2xl">Pomodoro Settings</DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="flex flex-col py-2">
          <ul className="flex flex-col gap-12">
            {inputGroups.map(({ label, mins, secs, onMinsChange, onSecsChange, Icon }) => (
              <li key={label} className="flex flex-col gap-4">
                <Label className="flex w-fit items-center gap-2 text-lg font-bold" htmlFor="session">
                  <Icon className="size-5" />
                  <span>{label}</span>
                </Label>
                <div className="flex items-center">
                  <InputNumber min={0} max={999} onValueChange={onMinsChange} defaultValue={mins} />
                  <Separator className="-ml-2 w-4" />
                  <InputNumber min={0} max={99} onValueChange={onSecsChange} defaultValue={secs} />
                </div>
                <div className="flex gap-2 text-sm">
                  <span>Time Preview:</span>
                  <span>{formatTime(mins * 60 + secs)}</span>
                </div>
              </li>
            ))}
          </ul>
          <DialogClose asChild>
            <Button className="w-min self-end" onClick={handleSettingsDone}>
              Done
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type ButtonWithTooltipProps = ComponentProps<typeof Button> & {
  tooltip: string;
};

const ButtonWithTooltip = forwardRef<ElementRef<typeof DialogTrigger>, ButtonWithTooltipProps>(
  ({ children, tooltip, ...props }, ref) => {
    return (
      <TooltipProvider disableHoverableContent delayDuration={650}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button {...props} ref={ref}>
              {children}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);
