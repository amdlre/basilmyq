"use client";

import type { ReactNode } from "react";
import {
  CircleCheckIcon,
  InfoIcon,
  OctagonAlertIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export type ConfirmStatus = "success" | "info" | "warning" | "error";

/** Icon and colour per status, all from design tokens (rule 8). */
const STATUS: Record<
  ConfirmStatus,
  { icon: LucideIcon; badge: string; action: string }
> = {
  success: {
    icon: CircleCheckIcon,
    badge: "bg-success/10 text-success",
    action: "bg-success/10 text-success hover:bg-success/20",
  },
  info: {
    icon: InfoIcon,
    badge: "bg-primary/10 text-primary",
    action: "",
  },
  warning: {
    icon: TriangleAlertIcon,
    badge: "bg-warning/10 text-warning",
    action: "bg-warning/10 text-warning hover:bg-warning/20",
  },
  error: {
    icon: OctagonAlertIcon,
    badge: "bg-destructive/10 text-destructive",
    action: "",
  },
};

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Defaults to a status-appropriate question. */
  title?: string;
  /** The item being acted on, echoed back so the user sees what they chose. */
  itemName?: string;
  description?: ReactNode;
  confirmLabel?: string;
  /** `error` for anything destructive, such as a delete. */
  status?: ConfirmStatus;
  onConfirm: () => void;
};

/**
 * The single confirm step every destructive action in the app goes through,
 * after shadcn studio's dialog-03: a status icon, a centred question and the
 * item it applies to.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  itemName,
  description,
  confirmLabel,
  status = "info",
  onConfirm,
}: ConfirmDialogProps) {
  const t = useTranslations("Common");
  const { icon: Icon, badge, action } = STATUS[status];
  const isDestructive = status === "error";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader className="place-items-center! items-center text-center">
          <div
            className={cn(
              "mx-auto mb-2 flex size-12 items-center justify-center rounded-full",
              badge,
            )}
          >
            <Icon className="size-6" aria-hidden />
          </div>
          <AlertDialogTitle>
            {title ??
              (isDestructive ? t("confirmDeleteTitle") : t("confirmTitle"))}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {description ?? t("confirmDescription")}
            {itemName ? (
              <span className="mt-2 block font-medium text-foreground">
                {itemName}
              </span>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            variant={isDestructive ? "destructive" : "default"}
            className={action}
            onClick={onConfirm}
          >
            {confirmLabel ?? (isDestructive ? t("delete") : t("confirm"))}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
