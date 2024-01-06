import { ThemeProvider } from "@/components/theme-provider";
import PomodoroCard from "@/components/pomodoro-card";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="flex min-h-dvh items-center justify-center gap-72">
        <PomodoroCard />
      </div>
    </ThemeProvider>
  );
}
