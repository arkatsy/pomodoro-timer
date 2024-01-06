import { Tabs, TabsContent, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { type ComponentProps } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { type Tab, type TabId, tabs } from "@/lib/utils";

type PomodoroProps = {
  children: React.ReactNode;
};

function Pomodoro({ children }: PomodoroProps) {
  return <div className="w-full max-w-screen-sm">{children}</div>;
}

type PomodoroTabsProps = {
  value: string;
  onValueChange: (newVal: string) => void;
  children: React.ReactNode;
};

function PomodoroTabs({ value, onValueChange, children }: PomodoroTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      {children}
    </Tabs>
  );
}

type PomodoroTabListProps = {
  children: React.ReactNode;
};

function PomodoroTabList({ children }: PomodoroTabListProps) {
  return (
    <LayoutGroup>
      <TabsList className="grid h-14 grid-cols-3">{children}</TabsList>
    </LayoutGroup>
  );
}

type PomodoroTabProps = {
  value: string;
  activeTab: Tab;
  children: React.ReactNode;
} & ComponentProps<typeof TabsTrigger>;

function PomodoroTab({ value, activeTab, children, ...rest }: PomodoroTabProps) {
  return (
    <div className="relative z-0 h-full">
      <TabsTrigger
        aria-label={tabs[value as TabId].name}
        value={value}
        className="peer relative z-20 h-full w-full px-0 text-sm data-[state=active]:bg-transparent min-[400px]:text-base"
        {...rest}
      >
        {children}
      </TabsTrigger>
      {activeTab.id === value && (
        <motion.div
          className="absolute inset-0 z-10 rounded-md peer-data-[state=active]:bg-background peer-data-[state=active]:text-foreground peer-data-[state=active]:shadow-sm"
          layoutId="timer-tab"
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        ></motion.div>
      )}
    </div>
  );
}

type PomodoroTabContentProps = {
  value: string;
  children: React.ReactNode;
};

function PomodoroTabContent({ value, children }: PomodoroTabContentProps) {
  return (
    <TabsContent
      value={value}
      tabIndex={-1}
      className="mt-16 flex flex-col items-center justify-center gap-8 min-[400px]:gap-4"
    >
      {children}
    </TabsContent>
  );
}

Pomodoro.Tabs = PomodoroTabs;
Pomodoro.TabList = PomodoroTabList;
Pomodoro.Tab = PomodoroTab;
Pomodoro.TabContent = PomodoroTabContent;

export default Pomodoro;
