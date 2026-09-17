"use client";

import { useRef } from "react";
import {
  BoldIcon,
  Heading2Icon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  QuoteIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { FieldWrapper, type BaseFieldProps } from "./field-wrapper";

type RichTextFieldProps = BaseFieldProps & {
  rows?: number;
};

type Tool = {
  id: string;
  icon: typeof BoldIcon;
  labelKey: "bold" | "italic" | "heading" | "link" | "list" | "quote";
  /** Wraps the selection, or is inserted at the start of the line. */
  wrap?: [string, string];
  linePrefix?: string;
};

const TOOLS: Tool[] = [
  { id: "bold", icon: BoldIcon, labelKey: "bold", wrap: ["**", "**"] },
  { id: "italic", icon: ItalicIcon, labelKey: "italic", wrap: ["_", "_"] },
  { id: "link", icon: LinkIcon, labelKey: "link", wrap: ["[", "](https://)"] },
  { id: "heading", icon: Heading2Icon, labelKey: "heading", linePrefix: "## " },
  { id: "list", icon: ListIcon, labelKey: "list", linePrefix: "- " },
  { id: "quote", icon: QuoteIcon, labelKey: "quote", linePrefix: "> " },
];

/**
 * Markdown editor with a formatting toolbar.
 *
 * Deliberately not a WYSIWYG: markdown stays a plain string, so it is diffable,
 * safe to store, and renders identically in both text directions — which is
 * where contenteditable editors tend to break down in Arabic. A richer editor
 * can replace the internals later without changing this field's API.
 */
export function RichTextField({ rows = 12, ...base }: RichTextFieldProps) {
  const t = useTranslations("Form");
  const { register, setValue, control } = useFormContext();
  const value = useWatch({ control, name: base.name }) as unknown;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const registration = register(base.name);

  const applyTool = (tool: Tool) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = typeof value === "string" ? value : "";
    const { selectionStart, selectionEnd } = textarea;
    const selected = text.slice(selectionStart, selectionEnd);

    let next: string;
    let cursor: number;

    if (tool.wrap) {
      const [open, close] = tool.wrap;
      next =
        text.slice(0, selectionStart) +
        open +
        selected +
        close +
        text.slice(selectionEnd);
      cursor = selectionStart + open.length + selected.length;
    } else {
      const lineStart = text.lastIndexOf("\n", selectionStart - 1) + 1;
      const prefix = tool.linePrefix ?? "";
      next = text.slice(0, lineStart) + prefix + text.slice(lineStart);
      cursor = selectionStart + prefix.length;
    }

    setValue(base.name, next, { shouldDirty: true, shouldValidate: true });

    // Restore focus and caret after React commits the new value.
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const characterCount = typeof value === "string" ? value.length : 0;

  return (
    <FieldWrapper {...base}>
      {({ id, invalid }) => (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1 rounded-md border p-1">
            {TOOLS.map((tool) => (
              <Button
                key={tool.id}
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label={t(tool.labelKey)}
                disabled={base.disabled}
                onClick={() => applyTool(tool)}
              >
                <tool.icon className="size-3.5" />
              </Button>
            ))}
            <span className="ms-auto pe-1.5 text-xs text-muted-foreground tabular-nums">
              {t("characters", { count: characterCount })}
            </span>
          </div>

          <Textarea
            id={id}
            rows={rows}
            disabled={base.disabled}
            aria-invalid={invalid}
            className="font-mono text-sm"
            {...registration}
            ref={(element) => {
              registration.ref(element);
              textareaRef.current = element;
            }}
          />
          <p className="text-xs text-muted-foreground">{t("markdownHint")}</p>
        </div>
      )}
    </FieldWrapper>
  );
}
