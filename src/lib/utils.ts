import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test.each([
    { input: 0, expected: "0:00" },
    { input: 1, expected: "0:01" },
    { input: 10, expected: "0:10" },
    { input: 30, expected: "0:30" },
    { input: 1 * 60, expected: "1:00" },
    // prettier-ignore
    { input: (1 * 60) + 1, expected: "1:01" },
    { input: 10 * 60, expected: "10:00" },
    // prettier-ignore
    { input: (10 * 60) + 1, expected: "10:01" },
    { input: 45 * 60, expected: "45:00" },
    { input: 60 * 60, expected: "60:00" },
    // prettier-ignore
    { input: (60 * 60) + 1, expected: "60:01" },
  ])("formatTime($input) === $expected", ({ input, expected }) => {
    expect(formatTime(input)).toBe(expected);
  });
}

export type TabId = "pomodoro" | "shortBreak" | "longBreak";
export type Tab = {
  id: TabId;
  name: string;
};

export type Tabs = {
  [key in TabId]: Tab;
};

export const tabs: Tabs = {
  pomodoro: { id: "pomodoro", name: "Pomodoro" },
  shortBreak: { id: "shortBreak", name: "Short Break" },
  longBreak: { id: "longBreak", name: "Long Break" },
};

export const helper_tabsList = ["pomodoro", "shortBreak", "longBreak"] as const;
