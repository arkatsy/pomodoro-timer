import { test, expect } from "vitest";
import App from "@/App.old";
import { getAllByRole, getByRole, render, userEvent } from "@/tests/utils";
import { defaultTimers, formatTime } from "@/lib/utils";

test("should render correctly", async () => {
  const { container } = render(<App />);

  const settingsBtn = getByRole(container, "button", { name: "settings" });
  const tabs = getAllByRole(container, "tab");
  const pomodoroTabBtn = getByRole(container, "tab", { name: "Pomodoro" });
  const shortBreakTabBtn = getByRole(container, "tab", { name: "Short Break" });
  const longBreakTabBtn = getByRole(container, "tab", { name: "Long Break" });
  const _ = getByRole(container, "button", { name: "start" });
  const __ = getByRole(container, "button", { name: "reset" });
  const ___ = getByRole(container, "button", { name: "skip" });
  const timeView = getByRole(container, "timer", { name: "Pomodoro time" });

  expect(tabs).toHaveLength(3);
  expect(pomodoroTabBtn).toHaveAttribute("aria-selected", "true");
  expect(shortBreakTabBtn).toHaveAttribute("aria-selected", "false");
  expect(longBreakTabBtn).toHaveAttribute("aria-selected", "false");
  expect(timeView).toHaveTextContent(formatTime(defaultTimers.pomodoro));
  expect(timeView).toHaveAccessibleName("Pomodoro time");
  expect(settingsBtn).toHaveAttribute("aria-expanded", "false");
});

test("should change tabs correctly", async () => {
  const user = userEvent.setup();
  const { container } = render(<App />);

  const tabs = getAllByRole(container, "tab");
  const pomodoroTabBtn = getByRole(container, "tab", { name: "Pomodoro" });
  const shortBreakTabBtn = getByRole(container, "tab", { name: "Short Break" });
  const longBreakTabBtn = getByRole(container, "tab", { name: "Long Break" });
  const timeView = getByRole(container, "timer", { name: "Pomodoro time" });

  expect(pomodoroTabBtn).toHaveAttribute("aria-selected", "true");
  expect(shortBreakTabBtn).toHaveAttribute("aria-selected", "false");
  expect(longBreakTabBtn).toHaveAttribute("aria-selected", "false");
  expect(timeView).toHaveTextContent(formatTime(defaultTimers.pomodoro));

  await user.click(shortBreakTabBtn);
  expect(pomodoroTabBtn).toHaveAttribute("aria-selected", "false");
  expect(shortBreakTabBtn).toHaveAttribute("aria-selected", "true");
  expect(longBreakTabBtn).toHaveAttribute("aria-selected", "false");
  expect(timeView).toHaveTextContent(formatTime(defaultTimers.shortBreak));

  await user.click(longBreakTabBtn);
  expect(pomodoroTabBtn).toHaveAttribute("aria-selected", "false");
  expect(shortBreakTabBtn).toHaveAttribute("aria-selected", "false");
  expect(longBreakTabBtn).toHaveAttribute("aria-selected", "true");
  expect(timeView).toHaveTextContent(formatTime(defaultTimers.longBreak));

  while (true) {
    await user.keyboard("Tab");
    if (tabs.includes(document.activeElement as HTMLElement)) break;
  }
  expect(document.activeElement).toBe(longBreakTabBtn);

  await user.keyboard("[ArrowLeft]");
  expect(document.activeElement).toBe(shortBreakTabBtn);
  expect(pomodoroTabBtn).toHaveAttribute("aria-selected", "false");
  expect(shortBreakTabBtn).toHaveAttribute("aria-selected", "true");
  expect(longBreakTabBtn).toHaveAttribute("aria-selected", "false");

  await user.keyboard("[ArrowRight]");
  expect(document.activeElement).toBe(longBreakTabBtn);
  expect(pomodoroTabBtn).toHaveAttribute("aria-selected", "false");
  expect(shortBreakTabBtn).toHaveAttribute("aria-selected", "false");
  expect(longBreakTabBtn).toHaveAttribute("aria-selected", "true");

  await user.keyboard("[ArrowRight]");
  expect(document.activeElement).toBe(pomodoroTabBtn);
  expect(pomodoroTabBtn).toHaveAttribute("aria-selected", "true");
  expect(shortBreakTabBtn).toHaveAttribute("aria-selected", "false");
  expect(longBreakTabBtn).toHaveAttribute("aria-selected", "false");

  await user.keyboard("[ArrowLeft]");
  expect(document.activeElement).toBe(longBreakTabBtn);
  expect(pomodoroTabBtn).toHaveAttribute("aria-selected", "false");
  expect(shortBreakTabBtn).toHaveAttribute("aria-selected", "false");
  expect(longBreakTabBtn).toHaveAttribute("aria-selected", "true");

  await user.keyboard("[ArrowLeft]");
  await user.keyboard("[ArrowLeft]");
  expect(document.activeElement).toBe(pomodoroTabBtn);
  expect(pomodoroTabBtn).toHaveAttribute("aria-selected", "true");
  expect(shortBreakTabBtn).toHaveAttribute("aria-selected", "false");
  expect(longBreakTabBtn).toHaveAttribute("aria-selected", "false");

  await user.keyboard("[ArrowRight]");
  expect(document.activeElement).toBe(shortBreakTabBtn);
  expect(pomodoroTabBtn).toHaveAttribute("aria-selected", "false");
  expect(shortBreakTabBtn).toHaveAttribute("aria-selected", "true");
  expect(longBreakTabBtn).toHaveAttribute("aria-selected", "false");
});