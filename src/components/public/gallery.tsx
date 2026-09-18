"use client";

import { useState } from "react";
import Image from "next/image";

import { BLUR_DATA_URL } from "@/lib/blur";
import { useTranslations } from "next-intl";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

/** Thumbnails that open full size in a dialog — keyboard and escape included. */
export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const t = useTranslations("ProjectsPage");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  const current = openIndex === null ? null : images[openIndex];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Image
              src={image}
              alt={`${alt} — ${index + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          </button>
        ))}
      </div>

      <Dialog
        open={openIndex !== null}
        onOpenChange={(open) => {
          if (!open) setOpenIndex(null);
        }}
      >
        <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">{t("gallery")}</DialogTitle>
          {current ? (
            <Image
              src={current}
              alt={alt}
              width={1600}
              height={1200}
              className="h-auto w-full rounded-lg object-contain"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
