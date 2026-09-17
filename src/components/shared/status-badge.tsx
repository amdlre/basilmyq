import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusTone =
  "neutral" | "success" | "warning" | "danger" | "accent";

const TONE_CLASSES: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground border-transparent",
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  danger: "bg-destructive/10 text-destructive border-destructive/20",
  accent: "bg-primary/10 text-primary border-primary/20",
};

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
  icon?: LucideIcon;
  className?: string;
};

/** One badge for every status in the app — tones only, never raw colours. */
export function StatusBadge({
  label,
  tone = "neutral",
  icon: Icon,
  className,
}: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(TONE_CLASSES[tone], className)}>
      {Icon ? <Icon className="size-3" /> : null}
      {label}
    </Badge>
  );
}
