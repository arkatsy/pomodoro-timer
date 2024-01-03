import { test, expect, describe, vi } from "vitest";
import { renderHook, act } from "@/tests/utils";
import useTabTimers from "@/hooks/useTabTimers";

test("should return the correct initial state", () => {
  const { result } = renderHook(() => useTabTimers(25 * 60, 5 * 60, 15 * 60));

  expect(result.current.pomodoroCountdown.time).toBe(25 * 60);
  expect(result.current.shortBreakCountdown.time).toBe(5 * 60);
  expect(result.current.longBreakCountdown.time).toBe(15 * 60);
  expect(result.current.activeTab.id).toBe("pomodoro");
});

test("should change active tab", () => {
  const { result } = renderHook(() => useTabTimers(25 * 60, 5 * 60, 15 * 60));

  act(() => result.current.changeActiveTab("shortBreak"));
  expect(result.current.activeTab.id).toBe("shortBreak");
});

test("should change active tab to the next tab", () => {
  const { result } = renderHook(() => useTabTimers(25 * 60, 5 * 60, 15 * 60));

  act(() => result.current.nextTab());
  expect(result.current.activeTab.id).toBe("shortBreak");
  act(() => result.current.nextTab());
  expect(result.current.activeTab.id).toBe("longBreak");
  act(() => result.current.nextTab());
  expect(result.current.activeTab.id).toBe("pomodoro");
});

test("should reset the current timer before moving to other tabs", () => {
  const { result } = renderHook(() => useTabTimers(25 * 60, 5 * 60, 15 * 60));
  act(() => result.current.pomodoroCountdown.begin());
  act(() => result.current.nextTab());
  expect(result.current.activeTab.id).toBe("shortBreak");
  expect(result.current.shortBreakCountdown.status).toBe("idle");
  expect(result.current.shortBreakCountdown.time).toBe(5 * 60);
});

test("should decrement the proper timer correctly", async () => {
  vi.useFakeTimers();
  let POMODORO_SESSION = 25 * 60;
  const { result } = renderHook(() => useTabTimers(POMODORO_SESSION, 5 * 60, 15 * 60));

  act(() => result.current.pomodoroCountdown.begin());
  Array.from({ length: POMODORO_SESSION }, (_, i) => i + 1).forEach((i) => {
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.pomodoroCountdown.time).toBe(POMODORO_SESSION - i);
  });
});

test("should apply settings correctly", () => {
  const { result } = renderHook(() => useTabTimers(25 * 60, 5 * 60, 15 * 60));

  act(() => result.current.applySettings({ pomodoro: 10 * 60, shortBreak: 3 * 60, longBreak: 12 * 60 }));
  expect(result.current.pomodoroCountdown.session).toBe(10 * 60);
  expect(result.current.shortBreakCountdown.session).toBe(3 * 60);
  expect(result.current.longBreakCountdown.session).toBe(12 * 60);
});
