import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { MotionConfig } from "framer-motion";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </ThemeProvider>,
);
