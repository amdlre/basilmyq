"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlusIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImageUploadProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  /** Uploads the file and resolves to its public URL. */
  onUpload?: (file: File) => Promise<string>;
  disabled?: boolean;
  alt?: string;
};

/**
 * Drag-and-drop image field with preview and removal. The actual transport is
 * injected via `onUpload`, so the component does not care whether the file goes
 * to local storage or UploadThing (decided in Phase 4).
 */
export function ImageUpload({
  value,
  onChange,
  onUpload,
  disabled = false,
  alt = "",
}: ImageUploadProps) {
  const t = useTranslations("Upload");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file || !onUpload) return;

    if (!file.type.startsWith("image/")) {
      setError(t("notAnImage"));
      return;
    }

    setError(null);
    setIsUploading(true);
    try {
      onChange(await onUpload(file));
    } catch {
      setError(t("uploadFailed"));
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
          className="aspect-video w-full object-cover"
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
          "flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed transition-colors",
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
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
