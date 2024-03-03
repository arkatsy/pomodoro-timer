import worker from "@/lib/time-worker";
import { TabId, defaultSessions, tabIds } from "@/lib/utils";
import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Store = {
  activeTabId: TabId;
  sessions: Record<TabId, number>;

  setActiveTabId: (newTabId: TabId) => void;
  nextTab: () => void;
  setPomodoro: (session: number) => void;
  setShortBreak: (session: number) => void;
  setLongBreak: (session: number) => void;
};

const useStore = create<Store>()(
  persist(
    (set) => ({
      activeTabId: tabIds[0],
      sessions: {
        pomodoro: defaultSessions.pomodoro,
        "short-break": defaultSessions["short-break"],
        "long-break": defaultSessions["long-break"],
      },

      setActiveTabId: (newTabId) =>
        set(
          produce<Store>((state) => {
            worker.stop();
            state.activeTabId = newTabId;
          }),
        ),

      nextTab: () =>
        set(
          produce<Store>((state) => {
            worker.stop();
            state.activeTabId =
              state.activeTabId === "pomodoro"
                ? "short-break"
                : state.activeTabId === "short-break"
                  ? "long-break"
                  : "pomodoro";
          }),
        ),

      setPomodoro: (session) =>
        set(
          produce<Store>((state) => {
            worker.stop();
            state.sessions.pomodoro = session;
          }),
        ),

      setShortBreak: (session) =>
        set(
          produce<Store>((state) => {
            worker.stop();
            state.sessions["short-break"] = session;
          }),
        ),

      setLongBreak: (session) =>
        set(
          produce<Store>((state) => {
            worker.stop();
            state.sessions["long-break"] = session;
          }),
        ),
    }),
    {
      name: "store",
    },
  ),
);

export default useStore;