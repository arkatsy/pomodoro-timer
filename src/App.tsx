import { useEffect } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Progress } from "@/components/ui/progress";
import TooltipButton from "@/components/ui/tooltip-button";
import Pomodoro from "@/components/features/pomodoro";
import Settings from "@/components/features/settings";
import { FastForwardIcon, PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react";
import useTabTimers from "./hooks/useTabTimers";
import { type TabId, cn, defaultTimers, formatTime, helper_tabsList, tabs } from "./lib/utils";
import useSound from "use-sound";
import startSound from "@/assets/session-start.mp3";
import stopSound from "@/assets/session-stop.mp3";
import tabSound from "@/assets/tab-sound.mp3";
import timerDoneSound from "@/assets/timer-done.mp3";

export default function App() {
  const [playStartSound] = useSound(startSound, { volume: 0.2 });
  const [playStopSound] = useSound(stopSound, { volume: 0.2 });
  const [playTabSound] = useSound(tabSound, { volume: 0.2 });
  const [playTimerDoneSound] = useSound(timerDoneSound, { volume: 0.2 });

  const {
    activeTab,
    changeActiveTab,
    nextTab,
    applySettings,
    longBreakCountdown,
    pomodoroCountdown,
    shortBreakCountdown,
  } = useTabTimers(defaultTimers.pomodoro, defaultTimers.shortBreak, defaultTimers.longBreak);

  const activeTimer =
    activeTab.id === "pomodoro"
      ? pomodoroCountdown
      : activeTab.id === "shortBreak"
        ? shortBreakCountdown
        : longBreakCountdown;

  const handlePlaybackButtonClick = () => {
    if (!isRunning) {
      playStartSound();
    } else {
      playStopSound();
    }
    return isIdle ? activeTimer.begin() : isRunning ? activeTimer.pause() : activeTimer.resume();
  };

  const handleTabClick = () => {
    playTabSound();
  };

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      playTabSound();
    }
  };

  const handleSkipButtonClick = () => {
    playTabSound();
    nextTab();
  };

  const isRunning = activeTimer.status === "running";
  const isIdle = activeTimer.status === "idle";
  const isPaused = activeTimer.status === "paused";
  const isBreak = !(+activeTab === 0);
  const shouldDisableTabs = isRunning;
  const isTimerZero = activeTimer.time === 0;
  const progress = (activeTimer.time / activeTimer.session) * 100;
  const controlButtons = [
    { id: "reset", Icon: RotateCcwIcon, tooltip: "Reset Timer", onClick: activeTimer.reset },
    {
      id: "playback",
      Icon: isIdle || isPaused ? PlayIcon : PauseIcon,
      tooltip: "Start/Pause Timer",
      onClick: handlePlaybackButtonClick,
      disabled: isTimerZero,
    },
    {
      id: "skip",
      Icon: FastForwardIcon,
      tooltip: isBreak ? "Skip Break" : "Skip Session",
      onClick: handleSkipButtonClick,
    },
  ] as const;

  useEffect(() => {
    if (isTimerZero) {
      playTimerDoneSound();
    }
  }, [isTimerZero]);

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="flex justify-center">
        <div className="flex w-full max-w-[1920px] flex-col items-center gap-32">
          <div className="flex w-full justify-between p-12">
            <h3 className="text-3xl font-bold">Pomodoro</h3>
            <div>
              <ThemeSwitcher />
              <Settings
                pomodoroSession={pomodoroCountdown.session}
                shortBreakSession={shortBreakCountdown.session}
                longBreakSession={longBreakCountdown.session}
                applySettings={applySettings}
              />
            </div>
          </div>
          <Pomodoro>
            <Pomodoro.Tabs value={activeTab.id} onValueChange={(value) => changeActiveTab(value as TabId)}>
              <Pomodoro.TabList>
                {helper_tabsList.map((tabId) => (
                  <Pomodoro.Tab
                    activeTab={activeTab}
                    key={tabId}
                    value={tabId}
                    onClick={handleTabClick}
                    onKeyDown={handleTabKeyDown}
                    disabled={shouldDisableTabs}
                  >
                    {tabs[tabId].name}
                  </Pomodoro.Tab>
                ))}
              </Pomodoro.TabList>
              <Pomodoro.TabContent value={activeTab.id}>
                <span
                  role="timer"
                  aria-label={
                    +activeTab === 1 ? "Short break time" : +activeTab === 2 ? "Long break time" : "Pomodoro time"
                  }
                  aria-pressed={isRunning}
                  className="text-8xl font-semibold min-[400px]:text-[7rem]"
                >
                  {formatTime(activeTimer.time)}
                </span>
                <div className="flex w-full flex-col gap-16">
                  <Progress
                    value={progress}
                    max={100}
                    className={`h-2 rounded-md bg-primary-foreground text-primary ${
                      isPaused && "animate-pulse text-primary"
                    }`}
                  />
                  <div className="flex w-full justify-center gap-8">
                    {controlButtons.map(({ id, Icon, tooltip, onClick, ...rest }) => (
                      <TooltipButton
                        key={id}
                        aria-label={id === "playback" ? (isIdle || isPaused ? "start" : "pause") : id}
                        className="group py-6"
                        tooltip={tooltip}
                        onClick={onClick}
                        variant={id === "playback" ? "default" : "ghost"}
                        {...rest}
                      >
                        <Icon
                          className={cn(
                            "h-6 w-6 ",
                            id === "playback" ? "text-primary-foreground" : "text-primary/80 group-hover:text-primary",
                          )}
                        />
                      </TooltipButton>
                    ))}
                  </div>
                </div>
              </Pomodoro.TabContent>
            </Pomodoro.Tabs>
          </Pomodoro>
        </div>
      </div>
    </ThemeProvider>
  );
}
