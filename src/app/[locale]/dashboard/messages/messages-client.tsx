"use client";

import { useState, useTransition } from "react";
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  InboxIcon,
  MailOpenIcon,
  ReplyIcon,
  Trash2Icon,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  deleteMessages,
  markMessageRead,
  setMessagesArchived,
  setMessagesRead,
} from "@/server/actions/messages";
import type { MessageRow } from "@/server/queries/dashboard";

/**
 * List and detail rather than a DataTable: an inbox is read one item at a time,
 * and opening a message is itself a mutation (it marks it read).
 */
export function MessagesClient({ rows }: { rows: MessageRow[] }) {
  const t = useTranslations("Messages");
  const tCommon = useTranslations("Common");
  const format = useFormatter();
  // Nothing is auto-selected on purpose: opening a message marks it read, so
  // merely visiting the inbox must not clear the unread badge.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [, startTransition] = useTransition();

  const selected = rows.find((row) => row.id === selectedId) ?? null;

  const open = (row: MessageRow) => {
    setSelectedId(row.id);
    // Opening is what marks it read — no extra button to forget.
    if (!row.isRead) {
      startTransition(async () => {
        await markMessageRead(row.id);
      });
    }
  };

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={InboxIcon}
        title={t("empty")}
        description={t("emptyHint")}
      />
    );
  }

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[22rem_1fr]">
        <Card className="overflow-hidden p-0">
          <ScrollArea className="h-[32rem]">
            <ul className="divide-y">
              {rows.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => open(row)}
                    className={cn(
                      "w-full space-y-1 px-4 py-3 text-start transition-colors hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      selectedId === row.id && "bg-accent",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "truncate",
                          row.isRead
                            ? "text-muted-foreground"
                            : "font-semibold",
                        )}
                      >
                        {row.name}
                      </span>
                      {!row.isRead ? (
                        <span
                          className="size-2 shrink-0 rounded-full bg-primary"
                          aria-label={t("unread")}
                        />
                      ) : null}
                    </div>
                    <p className="truncate text-sm">{row.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {format.dateTime(row.createdAt, {
                        dateStyle: "medium",
                      })}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            {selected ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="font-heading text-lg font-semibold">
                      {selected.subject}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selected.name} · <span dir="ltr">{selected.email}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format.dateTime(selected.createdAt, {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  {selected.isArchived ? (
                    <StatusBadge label={t("archived")} tone="neutral" />
                  ) : null}
                </div>

                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {selected.message}
                </p>

                <div className="flex flex-wrap gap-2 border-t pt-4">
                  <Button asChild size="sm">
                    {/* A mailto: reply keeps the admin in their own mail client. */}
                    <a
                      href={`mailto:${selected.email}?subject=${encodeURIComponent(
                        `Re: ${selected.subject}`,
                      )}`}
                    >
                      <ReplyIcon />
                      {t("actions.reply")}
                    </a>
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      startTransition(async () => {
                        await setMessagesArchived(
                          [selected.id],
                          !selected.isArchived,
                        );
                        toast.success(
                          selected.isArchived
                            ? t("unarchivedToast")
                            : t("archivedToast"),
                        );
                      })
                    }
                  >
                    {selected.isArchived ? (
                      <ArchiveRestoreIcon />
                    ) : (
                      <ArchiveIcon />
                    )}
                    {selected.isArchived
                      ? t("actions.unarchive")
                      : t("actions.archive")}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      startTransition(async () => {
                        await setMessagesRead([selected.id], !selected.isRead);
                        toast.success(t("readToast"));
                      })
                    }
                  >
                    <MailOpenIcon />
                    {selected.isRead
                      ? t("actions.markUnread")
                      : t("actions.markRead")}
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    className="ms-auto"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2Icon />
                    {tCommon("delete")}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t("selectHint")}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        itemName={selected?.subject}
        status="error"
        onConfirm={() => {
          if (!selected) return;
          startTransition(async () => {
            await deleteMessages([selected.id]);
            setSelectedId(null);
            toast.success(tCommon("deleted"));
          });
          setConfirmDelete(false);
        }}
      />
    </>
  );
}
