import worker from "@/lib/time-worker";
import { TabId, defaultSessions, tabIds } from "@/lib/utils";
import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Store = {
  activeTabId: TabId;
  sessions: Record<TabId, number>;
  muted: boolean;

  setActiveTabId: (newTabId: TabId) => void;
  nextTab: () => void;
  setSessions: (sessions: Record<TabId, number>) => void;
  setMuted: (muted: boolean) => void;
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
      muted: false,

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

      setSessions: (sessions) =>
        set(
          produce<Store>((state) => {
            worker.stop();
            state.sessions = sessions;
          }),
        ),

      setMuted: (muted) =>
        set(
          produce((state) => {
            state.muted = muted;
          }),
        ),
    }),
    {
      name: "store",
    },
  ),
);

export default useStore;
