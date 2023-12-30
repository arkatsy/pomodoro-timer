import { produce } from "immer";
import { useEffect, useReducer } from "react";

export type TimerStatus = "running" | "paused" | "paused" | "idle" | "done";

type CountdownState = {
  session: number;
  time: number;
  status: TimerStatus;
};

type CountdownAction =
  | {
      type:
        | "BEGIN_COUNTDOWN"
        | "PAUSE_COUNTDOWN"
        | "RESUME_COUNTDOWN"
        | "COUNTDOWN_TICK"
        | "FINISH_COUNTDOWN"
        | "RESET_COUNTDOWN";
    }
  | {
      type: "SET_SESSION";
      session: number;
    };

const countdownReducer = produce((draft: CountdownState, action: CountdownAction) => {
  switch (action.type) {
    case "BEGIN_COUNTDOWN":
      draft.status = "running";
      break;
    case "PAUSE_COUNTDOWN":
      draft.status = "paused";
      break;
    case "RESUME_COUNTDOWN":
      draft.status = "running";
      break;
    case "COUNTDOWN_TICK":
      draft.time -= 1;
      break;
    case "FINISH_COUNTDOWN":
      draft.status = "done";
      break;
    case "RESET_COUNTDOWN":
      draft.time = draft.session;
      draft.status = "idle";
      break;
    case "SET_SESSION":
      draft.session = action.session;
      draft.time = action.session;
      draft.status = "idle";
      break;
  }
});

export default function useCountdown(session: number | (() => number)) {
  const [state, dispatch] = useReducer(countdownReducer, {
    session: typeof session === "function" ? session() : session,
    time: typeof session === "function" ? session() : session,
    status: "idle",
  });

  const beginCountdown = () => dispatch({ type: "BEGIN_COUNTDOWN" });
  const pauseCountdown = () => dispatch({ type: "PAUSE_COUNTDOWN" });
  const resumeCountdown = () => dispatch({ type: "RESUME_COUNTDOWN" });
  const tick = () => dispatch({ type: "COUNTDOWN_TICK" });
  const finishCountdown = () => dispatch({ type: "FINISH_COUNTDOWN" });
  const resetCountdown = () => dispatch({ type: "RESET_COUNTDOWN" });
  const setSession = (session: number) => dispatch({ type: "SET_SESSION", session });

  useEffect(() => {
    if (state.status === "running" && state.time > 0) {
      const timer = setInterval(tick, 1000);
      return () => clearInterval(timer);
    }

    if (state.time === 0) {
      finishCountdown();
    }
  }, [state.status, state.time]);

  return {
    time: state.time,
    status: state.status,
    begin: beginCountdown,
    pause: pauseCountdown,
    resume: resumeCountdown,
    reset: resetCountdown,
    setSession,
  };
}
