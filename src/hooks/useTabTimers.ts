import useCountdown from "@/hooks/useCountdown";
import { useState } from "react";
import { tabs, type Tab, type TabId } from "@/lib/utils";

export default function useTabTimers(pomodoroTime: number, shortBreakTime: number, longBreakTime: number) {
  const pomodoroCountdown = useCountdown(pomodoroTime);
  const shortBreakCountdown = useCountdown(shortBreakTime);
  const longBreakCountdown = useCountdown(longBreakTime);

  const [activeTab, setActiveTab] = useState<Tab>(tabs.pomodoro);

  function resetActiveTabTimer() {
    switch (activeTab.id) {
      case "pomodoro":
        pomodoroCountdown.reset();
        break;
      case "shortBreak":
        shortBreakCountdown.reset();
        break;
      case "longBreak":
        longBreakCountdown.reset();
        break;
    }
  }

  const changeActiveTab = (tabId: TabId) => {
    resetActiveTabTimer();
    setActiveTab(tabs[tabId]);
  };

  const nextTab = () => {
    resetActiveTabTimer();
    const isPomodoro = activeTab.id === "pomodoro";
    const isShortBreak = activeTab.id === "shortBreak";
    const nextTabId: TabId = isPomodoro ? "shortBreak" : isShortBreak ? "longBreak" : "pomodoro";
    setActiveTab(tabs[nextTabId]);
  };

  const applySettings = (newSettings: { pomodoro: number; shortBreak: number; longBreak: number }) => {
    pomodoroCountdown.setSession(newSettings.pomodoro);
    shortBreakCountdown.setSession(newSettings.shortBreak);
    longBreakCountdown.setSession(newSettings.longBreak);
  };

  return {
    activeTab,
    pomodoroCountdown,
    shortBreakCountdown,
    longBreakCountdown,
    changeActiveTab,
    nextTab,
    applySettings,
  };
}
