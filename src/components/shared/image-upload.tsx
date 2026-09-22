"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlusIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UploadResponse = { url?: string; error?: string };

class UploadError extends Error {}

/** Posts one file to the dashboard's upload route and returns its URL. */
async function uploadToLibrary(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);

  const response = await fetch("/api/upload", { method: "POST", body });
  const result = (await response.json().catch(() => ({}))) as UploadResponse;

  if (!response.ok || !result.url) {
    throw new UploadError(result.error ?? "UPLOAD_FAILED");
  }
  return result.url;
}

type ImageUploadProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  /** Uploads the file and resolves to its public URL. Defaults to the library. */
  onUpload?: (file: File) => Promise<string>;
  disabled?: boolean;
  alt?: string;
  /** A short strip instead of a 16:9 box — for logos and icons. */
  compact?: boolean;
};

/**
 * Drag-and-drop image field with preview and removal. Files go to the media
 * library unless another transport is injected via `onUpload`.
 */
export function ImageUpload({
  value,
  onChange,
  onUpload = uploadToLibrary,
  disabled = false,
  alt = "",
  compact = false,
}: ImageUploadProps) {
  const t = useTranslations("Upload");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t("notAnImage"));
      return;
    }

    setError(null);
    setIsUploading(true);
    try {
      onChange(await onUpload(file));
      toast.success(t("uploaded"));
    } catch (caught) {
      const reason = caught instanceof UploadError ? caught.message : "";
      const message =
        reason === "TOO_LARGE"
          ? t("tooLarge")
          : reason === "UNSAFE_SVG"
            ? t("unsafeSvg")
            : reason === "INVALID_TYPE"
              ? t("notAnImage")
              : t("uploadFailed");
      setError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  if (value) {
    return (
      <div className="relative w-full overflow-hidden rounded-lg border">
        <Image
          src={value}
          alt={alt}
          width={640}
          height={360}
          className={cn(
            "w-full",
            compact
              ? "h-20 bg-muted object-contain p-2"
              : "aspect-video object-cover",
          )}
        />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute end-2 top-2 size-8"
          aria-label={t("remove")}
          disabled={disabled}
          onClick={() => onChange(null)}
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
        disabled={disabled || isUploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void handleFile(event.dataTransfer.files[0]);
        }}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg border border-dashed transition-colors",
          compact ? "h-20 px-3" : "aspect-video flex-col",
          "hover:border-primary/50 hover:bg-accent/50",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          isDragging && "border-primary bg-accent",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <ImagePlusIcon className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {isUploading ? t("uploading") : t("dropHint")}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          // Allows choosing the same file again after an error.
          event.target.value = "";
        }}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
