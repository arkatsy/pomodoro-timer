import { produce } from "immer";
import { ClockIcon, HourglassIcon, SettingsIcon } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import InputNumber from "@/components/ui/input-number";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SettingsProps = {
  pomodoroSession: number;
  shortBreakSession: number;
  longBreakSession: number;
  applySettings: (newSettings: { pomodoro: number; shortBreak: number; longBreak: number }) => void;
};

// TODO: Rewrite
export default function Settings({
  pomodoroSession,
  shortBreakSession,
  longBreakSession,
  applySettings,
}: SettingsProps) {
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

  const beautifyPreviewText = (label: string) => {
    return (
      (!(label === "Session")
        ? `${label.split(" ").at(0)} ${label.split(" ").at(1)?.toLowerCase()}`
        : label) + " "
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="group p-1" aria-label="Settings">
          <SettingsIcon className="size-7 sm:size-8 text-primary sm:text-primary/80 duration-300 group-hover:text-primary group-focus-visible:text-primary" />
        </button>
      </DialogTrigger>
      <DialogContent className="top-1/2">
        <DialogHeader>
          <DialogTitle className="text-2xl" id="dialog-title">
            Pomodoro Settings
          </DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="flex flex-col py-2">
          <ul className="flex flex-col gap-12">
            {inputGroups.map(({ label, mins, secs, onMinsChange, onSecsChange, Icon }) => (
              <li key={label} className="flex flex-col gap-4">
                <Label className="flex w-fit items-center gap-2 text-lg font-bold" htmlFor={label}>
                  <Icon className="size-5" />
                  <span>{label}</span>
                </Label>
                <div className="flex items-center">
                  <InputNumber
                    id={label}
                    min={0}
                    max={999}
                    onValueChange={onMinsChange}
                    defaultValue={mins}
                  />
                  <Separator className="-ml-2 w-4" />
                  <InputNumber min={0} max={99} onValueChange={onSecsChange} defaultValue={secs} />
                </div>
                <div className="flex gap-2 text-sm">
                  <span>
                    {beautifyPreviewText(label)}
                    preview:
                  </span>
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
