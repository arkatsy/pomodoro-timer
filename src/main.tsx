import ReactDOM from "react-dom/client";
import { StrictMode } from "react";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { MotionConfig } from "framer-motion";

const __DEV__ = import.meta.env.DEV;

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("No root element found");

ReactDOM.createRoot(rootEl).render(
  <StrictMode>
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <App />
        {__DEV__ && <Dev />}
      </MotionConfig>
    </ThemeProvider>
  </StrictMode>,
);

function Dev() {
  return (
    <div className="fixed left-1/2 top-0">
      <a className="underline" target="_blank" href="https://github.com/arkatsy/pomodoro-timer.git">
        Github
      </a>
    </div>
  );
}
