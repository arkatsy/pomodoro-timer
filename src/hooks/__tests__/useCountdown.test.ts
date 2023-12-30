import { renderHook, act } from "@/tests/utils";
import useCountdown, { type TimerStatus } from "@/hooks/useCountdown";
import { test, expect, vi } from "vitest";

test("should return the correct initial state", () => {
  const SESSION = 25;
  const { result } = renderHook(() => useCountdown(SESSION));
  expect(result.current.status).toBe<TimerStatus>("idle");
  expect(result.current.time).toBe(SESSION);
});

test("should return the correct state after calling begin", () => {
  const SESSION = 25;
  const { result } = renderHook(() => useCountdown(SESSION));
  expect(result.current.status).toBe<TimerStatus>("idle");

  act(() => result.current.begin());
  expect(result.current.status).toBe<TimerStatus>("running");
});

test("should return the correct state after calling pause", () => {
  const SESSION = 25;
  const { result } = renderHook(() => useCountdown(SESSION));
  act(() => result.current.begin());
  expect(result.current.status).toBe<TimerStatus>("running");

  act(() => result.current.pause());
  expect(result.current.status).toBe<TimerStatus>("paused");
});

test("should return the correct state after calling resume", () => {
  const SESSION = 25;
  const { result } = renderHook(() => useCountdown(SESSION));
  act(() => result.current.begin());
  act(() => result.current.pause());
  expect(result.current.status).toBe<TimerStatus>("paused");

  act(() => result.current.resume());
  expect(result.current.status).toBe<TimerStatus>("running");
});

test("should return the correct state after calling reset", () => {
  const SESSION = 25;
  const { result } = renderHook(() => useCountdown(SESSION));
  act(() => result.current.begin());
  act(() => result.current.pause());
  act(() => result.current.reset());
  expect(result.current.status).toBe<TimerStatus>("idle");
});

test("should decrement the timer every second by 1", async () => {
  vi.useFakeTimers();
  const SESSION = 25;
  const { result } = renderHook(() => useCountdown(SESSION));
  act(() => result.current.begin());
  Array.from({ length: SESSION }, (_, i) => i + 1).map((i) => {
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.time).toBe(SESSION - i);
  });
});

test("should stop the timer when the time left reaches 0 and return the correct state", async () => {
  vi.useFakeTimers();
  const SESSION = 25;
  const { result } = renderHook(() => useCountdown(SESSION));
  act(() => result.current.begin());
  Array.from({ length: SESSION }, (_, i) => i + 1).map((i) => {
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.time).toBe(SESSION - i);
  });
  expect(result.current.status).toBe<TimerStatus>("done");
});
