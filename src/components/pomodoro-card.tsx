import { type ComponentProps, type ElementRef, forwardRef, useState } from "react";
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
  Minus as MinusIcon,
  Plus as PlusIcon,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { produce } from "immer";
import useTabTimers from "@/hooks/useTabTimers";

// TODO: Add tests
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
  const shouldDisableTabs = !isIdle;
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

  // TODO: Pause timer when settings dialog is open

  return (
    <Card id="pomodoro-card" className="w-full min-w-fit max-w-lg space-y-0 p-10">
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
        <TabsList className="grid h-14 w-full grid-cols-3 p-1.5">
          {helper_tabsList.map((tabId) => (
            <TabsTrigger key={tabId} value={tabId} className="h-full text-lg" disabled={shouldDisableTabs}>
              {tabs[tabId].name}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab.id} tabIndex={-1} className="mt-16 flex flex-col items-center justify-center">
          <span className="text-[7rem] font-semibold">{formatTime(activeTimer.time)}</span>
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

  // TODO: Separate InputNumber to its own component with its own state
  // TODO: InputNumber is not responsive for very small screens

  const onInputMinsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    const newValue = Number(value);
    if (newValue < 0 || isNaN(newValue)) {
      return;
    }
    if (newValue > 999) {
      setSettings(
        produce((draft: typeof settings) => {
          draft.pomodoro.mins = 999;
        }),
      );
    } else {
      setSettings(
        produce((draft: typeof settings) => {
          draft.pomodoro.mins = newValue;
        }),
      );
    }
  };

  const onInputSecsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;
    const newValue = Number(value);
    if (newValue < 0 || isNaN(newValue)) {
      return;
    }
    if (newValue > 59) {
      setSettings(
        produce((draft: typeof settings) => {
          draft.pomodoro.secs = 59;
        }),
      );
    } else {
      setSettings(
        produce((draft: typeof settings) => {
          draft.pomodoro.secs = newValue;
        }),
      );
    }
  };

  const onInputMinsPlus = () =>
    setSettings(
      produce((draft: typeof settings) => {
        if (!(draft.pomodoro.mins < 0 || draft.pomodoro.mins > 998)) draft.pomodoro.mins += 1;
      }),
    );

  const onInputMinsMinus = () =>
    setSettings(
      produce((draft: typeof settings) => {
        if (draft.pomodoro.mins > 0) draft.pomodoro.mins -= 1;
      }),
    );

  const onInputSecsPlus = () =>
    setSettings(
      produce((draft: typeof settings) => {
        if (!(draft.pomodoro.secs < 0 && draft.pomodoro.secs.toString().length <= 2) && draft.pomodoro.secs < 59)
          draft.pomodoro.secs += 1;
      }),
    );

  const onInputSecsMinus = () =>
    setSettings(
      produce((draft: typeof settings) => {
        if (draft.pomodoro.secs > 0 && draft.pomodoro.secs.toString().length <= 2) draft.pomodoro.secs -= 1;
      }),
    );

  const handleSettingsDone = () => {
    const newPomodoroTime = settings.pomodoro.mins * 60 + settings.pomodoro.secs;

    applySettings({
      pomodoro: newPomodoroTime,

      // TODO: Implement long break
      shortBreak: shortBreakSession,

      // TODO: Implement long break
      longBreak: longBreakSession,
    });
  };
  return (
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
        <div className="flex flex-col py-2">
          <ul>
            <li className="flex flex-col gap-4">
              <Label className="flex w-fit items-center gap-2 text-lg font-bold" htmlFor="session">
                <ClockIcon className="size-5" />
                <span>Session</span>
              </Label>
              <div className="flex items-center">
                <InputNumber
                  id="session-mins"
                  value={settings.pomodoro.mins}
                  onInput={onInputMinsChange}
                  onPlusClick={onInputMinsPlus}
                  onMinusClick={onInputMinsMinus}
                />
                <Separator className="-ml-2 w-4" />
                <InputNumber
                  id="session-secs"
                  value={settings.pomodoro.secs}
                  onInput={onInputSecsChange}
                  onPlusClick={onInputSecsPlus}
                  onMinusClick={onInputSecsMinus}
                />
              </div>
              <div className="flex gap-2 text-sm">
                <span>Time Preview:</span>
                <span>{formatTime(settings.pomodoro.mins * 60 + settings.pomodoro.secs)}</span>
              </div>
            </li>
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

function InputNumber({
  onInput,
  onPlusClick,
  onMinusClick,
  className,
  ...props
}: {
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPlusClick: () => void;
  onMinusClick: () => void;
  className?: string;
} & ComponentProps<typeof Input>) {
  return (
    <div className="relative flex w-full max-w-[185px] items-center">
      <Input inputMode="numeric" className={cn("mr-2", className)} onInput={onInput} {...props} />
      <div className="absolute right-2 top-0">
        <Button variant="outline" type="button" className="rounded-none" onClick={onPlusClick}>
          <PlusIcon className="h-4 w-4" />
        </Button>
        <Button variant="outline" type="button" className="rounded-l-none border-l-0" onClick={onMinusClick}>
          <MinusIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

type ButtonWithTooltipProps = ComponentProps<typeof Button> & {
  tooltip: string;
};

const ButtonWithTooltip = forwardRef<ElementRef<typeof DialogTrigger>, ButtonWithTooltipProps>(
  ({ children, tooltip, ...props }, ref) => {
    return (
      <TooltipProvider disableHoverableContent>
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
