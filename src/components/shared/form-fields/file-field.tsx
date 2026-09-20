"use client";

import { useRef, useState } from "react";
import { FileTextIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { FieldWrapper, type BaseFieldProps } from "./field-wrapper";

async function uploadDocument(file: File): Promise<string> {
  const body = new FormData();
  body.set("file", file);
  body.set("kind", "document");

  const response = await fetch("/api/upload", { method: "POST", body });
  if (!response.ok) throw new Error("UPLOAD_FAILED");

  const { url } = (await response.json()) as { url: string };
  return url;
}

/**
 * Upload field for a single document.
 *
 * Stores the resulting URL, like `ImageField`, so the rest of the app keeps
 * treating it as a plain string — only the way it gets there changes.
 */
export function FileField(base: BaseFieldProps) {
  const t = useTranslations("Upload");
  const { control } = useFormContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <FieldWrapper {...base}>
      {({ id }) => (
        <Controller
          control={control}
          name={base.name}
          render={({ field }) => {
            const url = typeof field.value === "string" ? field.value : null;

            const handle = async (file: File | undefined) => {
              if (!file) return;
              setError(null);
              setIsUploading(true);
              try {
                field.onChange(await uploadDocument(file));
              } catch {
                setError(t("uploadFailed"));
              } finally {
                setIsUploading(false);
              }
            };

            if (url) {
              return (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <FileTextIcon className="size-5 shrink-0 text-muted-foreground" />
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    dir="ltr"
                    className="min-w-0 flex-1 truncate text-sm hover:underline"
                  >
                    {url.split("/").pop()}
                  </a>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("removeFile")}
                    disabled={base.disabled}
                    onClick={() => field.onChange(null)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              );
            }

            return (
              <div className="space-y-1.5">
                <button
                  type="button"
                  id={id}
                  disabled={base.disabled || isUploading}
                  onClick={() => inputRef.current?.click()}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                    void handle(event.dataTransfer.files[0]);
                  }}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-sm transition-colors",
                    "hover:border-primary/50 hover:bg-accent/50",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    isDragging && "border-primary bg-accent",
                    base.disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <UploadIcon className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {isUploading ? t("uploading") : t("dropFileHint")}
                  </span>
                </button>

                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  tabIndex={-1}
                  onChange={(event) => void handle(event.target.files?.[0])}
                />

                {error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : null}
              </div>
            );
          }}
        />
      )}
    </FieldWrapper>
  );
}
