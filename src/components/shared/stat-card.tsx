import type { LucideIcon } from "lucide-react";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatVariant =
  "default" | "success" | "warning" | "danger" | "accent";

const ICON_CLASSES: Record<StatVariant, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
  accent: "bg-primary/10 text-primary",
};

export type Stat = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: StatVariant;
  /** Percentage change against the previous period. */
  trend?: number;
  hint?: string;
};

export function StatCard({
  label,
  value,
  icon: Icon,
  variant = "default",
  trend,
  hint,
}: Stat) {
  const TrendIcon =
    trend === undefined ? null : trend >= 0 ? TrendingUpIcon : TrendingDownIcon;

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm text-muted-foreground">{label}</p>
          {/* Tabular figures keep columns of numbers aligned. */}
          <p className="font-heading text-2xl font-semibold tabular-nums">
            {value}
          </p>
          {trend !== undefined || hint ? (
            <div className="flex items-center gap-1.5 text-xs">
              {TrendIcon ? (
                <span
                  className={cn(
                    "flex items-center gap-0.5 font-medium tabular-nums",
                    trend !== undefined && trend >= 0
                      ? "text-success"
                      : "text-destructive",
                  )}
                >
                  <TrendIcon className="size-3" />
                  {Math.abs(trend ?? 0)}%
                </span>
              ) : null}
              {hint ? (
                <span className="truncate text-muted-foreground">{hint}</span>
              ) : null}
            </div>
          ) : null}
        </div>

        {Icon ? (
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              ICON_CLASSES[variant],
            )}
          >
            <Icon className="size-4.5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
