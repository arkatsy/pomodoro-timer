import { produce } from "immer";
import { ClockIcon, HourglassIcon, SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";
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
import useStore from "@/lib/store";

export default function Settings() {
  const [open, setOpen] = useState(false);

  const openSettingsDialog = () => setOpen(true);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="group p-2" aria-label="Settings" onClick={openSettingsDialog}>
          <SettingsIcon className="size-7 text-primary duration-300 group-hover:text-primary group-focus-visible:text-primary sm:size-8 sm:text-primary/80" />
        </button>
      </DialogTrigger>
      <DialogSettingsContent open={open} />
    </Dialog>
  );
}

function DialogSettingsContent({ open }: { open: boolean }) {
  const [sessions, setSessions] = useStore((state) => [state.sessions, state.setSessions]);

  const [draftSettings, setDraftSettings] = useState({ ...sessions });

  const pomodoroMins = Math.trunc(draftSettings.pomodoro / 60);
  const pomodoroSecs = Math.trunc(draftSettings.pomodoro % 60);
  const shortBreakMins = Math.trunc(draftSettings["short-break"] / 60);
  const shortBreakSecs = Math.trunc(draftSettings["short-break"] % 60);
  const longBreakMins = Math.trunc(draftSettings["long-break"] / 60);
  const longBreakSecs = Math.trunc(draftSettings["long-break"] % 60);

  const disabled = Object.entries(draftSettings).every(
    ([key, val]) => sessions[key as keyof typeof sessions] === val,
  );

  useEffect(() => {
    setDraftSettings({ ...sessions });
  }, [open]);

  const handleSettingsDone = () => setSessions({ ...draftSettings });

  const handlePomodoroMinsChange = (mins: number) => {
    setDraftSettings(
      produce((draft) => {
        draft.pomodoro = mins * 60 + pomodoroSecs;
      }),
    );
  };

  const handlePomodoroSecsChange = (secs: number) => {
    setDraftSettings(
      produce((draft) => {
        draft.pomodoro = pomodoroMins * 60 + secs;
      }),
    );
  };

  const handleShortBreakMinsChange = (mins: number) => {
    setDraftSettings(
      produce((draft) => {
        draft["short-break"] = mins * 60 + shortBreakSecs;
      }),
    );
  };

  const handleShortBreakSecsChange = (secs: number) => {
    setDraftSettings(
      produce((draft) => {
        draft["short-break"] = shortBreakMins * 60 + secs;
      }),
    );
  };

  const handleLongBreakMinsChange = (mins: number) => {
    setDraftSettings(
      produce((draft) => {
        draft["long-break"] = mins * 60 + longBreakSecs;
      }),
    );
  };

  const handleLongBreakSecsChange = (secs: number) => {
    setDraftSettings(
      produce((draft) => {
        draft["long-break"] = longBreakMins * 60 + secs;
      }),
    );
  };

  const inputGroups = [
    {
      Icon: ClockIcon,
      label: "Session",
      mins: pomodoroMins,
      secs: pomodoroSecs,
      onMinsChange: handlePomodoroMinsChange,
      onSecsChange: handlePomodoroSecsChange,
    },
    {
      Icon: HourglassIcon,
      label: "Short Break",
      mins: shortBreakMins,
      secs: shortBreakSecs,
      onMinsChange: handleShortBreakMinsChange,
      onSecsChange: handleShortBreakSecsChange,
    },
    {
      Icon: HourglassIcon,
      label: "Long Break",
      mins: longBreakMins,
      secs: longBreakSecs,
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
    <DialogContent className="top-1/2">
      <DialogHeader>
        <DialogTitle className="text-2xl" id="dialog-title">
          Settings
        </DialogTitle>
      </DialogHeader>
      <Separator />
      <div className="flex flex-col py-2">
        <ul className="flex flex-col gap-12">
          {inputGroups.map(({ label, mins, secs, onMinsChange, onSecsChange, Icon }) => (
            <li key={label} className="flex flex-col gap-4">
              <Label className="flex w-fit items-center gap-2 text-lg font-medium" htmlFor={label}>
                <Icon className="size-5" />
                <span>{label}</span>
              </Label>
              <div className="flex items-center">
                <InputNumber id={label} min={0} max={999} onValueChange={onMinsChange} defaultValue={mins} />
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
          <Button className="w-min self-end" onClick={handleSettingsDone} disabled={disabled}>
            Save
          </Button>
        </DialogClose>
      </div>
    </DialogContent>
  );
}
