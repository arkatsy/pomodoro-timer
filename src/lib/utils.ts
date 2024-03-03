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
    { input: 1 * 60 + 1, expected: "1:01" },
    { input: 10 * 60, expected: "10:00" },
    { input: 10 * 60 + 1, expected: "10:01" },
    { input: 45 * 60, expected: "45:00" },
    { input: 60 * 60, expected: "60:00" },
    { input: 60 * 60 + 1, expected: "60:01" },
  ])("formatTime($input) === $expected", ({ input, expected }) => {
    expect(formatTime(input)).toBe(expected);
  });
}

export const defaultSessions: Record<TabId, number> = {
  pomodoro: 25 * 60, // 25 mins
  "short-break": 5 * 60, // 5 mins
  "long-break": 15 * 60, // 15 mins
};

export const tabIds = ["pomodoro", "short-break", "long-break"] as const;
export type TabId = (typeof tabIds)[number];

export const tabs: { id: TabId; name: string }[] = [
  { id: "pomodoro", name: "Pomodoro" },
  { id: "short-break", name: "Short Break" },
  { id: "long-break", name: "Long Break" },
];
