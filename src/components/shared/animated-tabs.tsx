"use client";

import { type ReactNode, useId, useState } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/motion-tabs";
import { cn } from "@/lib/utils";

export type AnimatedTab = {
  value: string;
  label: ReactNode;
  content: ReactNode;
};

type AnimatedTabsProps = {
  tabs: AnimatedTab[];
  defaultValue?: string;
  className?: string;
  /** Keeps the tab strip under the dashboard top bar while the page scrolls. */
  sticky?: boolean;
};

/**
 * The app's one tab strip, after shadcn studio's tabs-27.
 *
 * Only the active panel is rendered. The generated `TabsContents` slides every
 * panel side by side instead, which sizes the strip to the tallest panel and
 * slides the wrong way under RTL.
 */
export function AnimatedTabs({
  tabs,
  defaultValue,
  className,
  sticky = false,
}: AnimatedTabsProps) {
  const id = useId();
  const [active, setActive] = useState(defaultValue ?? tabs[0]?.value ?? "");
  const current = tabs.find((tab) => tab.value === active);

  return (
    <Tabs
      value={active}
      onValueChange={setActive}
      className={cn("gap-4", className)}
    >
      {/* Scrolls rather than wraps, so the highlight stays on one row. */}
      <div
        className={cn(
          "no-scrollbar max-w-full overflow-x-auto",
          // `top-14` matches the height of the dashboard top bar.
          sticky && "sticky top-14 z-20 -mx-1 bg-background px-1 py-2",
        )}
      >
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              id={`${id}-tab-${tab.value}`}
              aria-selected={tab.value === active}
              aria-controls={`${id}-panel-${tab.value}`}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {current ? (
        <TabsContent
          key={current.value}
          value={current.value}
          id={`${id}-panel-${current.value}`}
          aria-labelledby={`${id}-tab-${current.value}`}
          // Popovers and focus rings inside forms must not be clipped.
          className="overflow-visible"
        >
          {current.content}
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
