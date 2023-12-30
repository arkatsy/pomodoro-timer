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

export type TimerId = "pomodoro" | "short-break" | "long-break";
export type Timer = { id: TimerId; name: string };
export type TimerTab = Timer & { time: number; isActive: boolean };

export const timersList: Timer[] = [
  { id: "pomodoro", name: "Pomodoro" },
  { id: "short-break", name: "Short Break" },
  { id: "long-break", name: "Long Break" },
];

export const defaultTimerTabs: TimerTab[] = [
  { id: "pomodoro", name: "Pomodoro", time: 25 * 60, isActive: true },
  { id: "short-break", name: "Short Break", time: 5 * 60, isActive: false },
  { id: "long-break", name: "Long Break", time: 15 * 60, isActive: false },
];
