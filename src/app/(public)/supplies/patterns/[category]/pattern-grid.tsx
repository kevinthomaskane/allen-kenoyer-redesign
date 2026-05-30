"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { patternAlt, patternImageUrl, type Pattern } from "@/lib/patterns";
import { cn } from "@/lib/utils";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type Props = {
  patterns: Pattern[];
};

export function PatternGrid({ patterns }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex != null ? patterns[activeIndex] : null;

  const close = useCallback(() => setActiveIndex(null), []);
  const goPrev = useCallback(
    () =>
      setActiveIndex((i) =>
        i == null ? null : (i - 1 + patterns.length) % patterns.length,
      ),
    [patterns.length],
  );
  const goNext = useCallback(
    () => setActiveIndex((i) => (i == null ? null : (i + 1) % patterns.length)),
    [patterns.length],
  );

  useEffect(() => {
    if (activeIndex == null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, goPrev, goNext]);

  return (
    <>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {patterns.map((p, i) => (
          <li key={`${p.category}-${p.number}`}>
            <button
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                "group bg-card border-border ring-offset-background focus-visible:ring-ring block w-full overflow-hidden rounded-md border transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
              )}
              aria-label={`View ${patternAlt(p)}`}
            >
              <div className="bg-primary-pale relative aspect-square w-full">
                <Image
                  src={patternImageUrl(p)}
                  alt={patternAlt(p)}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="border-border flex items-baseline justify-between border-t px-3 py-2">
                <span className="text-primary font-medium">#{p.number}</span>
                <span className="text-text-mid text-sm">
                  {priceFormatter.format(p.price)}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <Dialog
        open={activeIndex != null}
        onOpenChange={(open) => !open && close()}
      >
        <DialogContent
          showCloseButton
          className="sm:max-w-3xl"
          aria-describedby={undefined}
        >
          {active && (
            <>
              <DialogTitle className="text-primary font-serif text-2xl">
                Pattern #{active.number}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {patternAlt(active)} — {priceFormatter.format(active.price)}
              </DialogDescription>
              <div className="bg-primary-pale relative mt-2 aspect-square w-full overflow-hidden rounded-md sm:aspect-[4/3]">
                <Image
                  src={patternImageUrl(active)}
                  alt={patternAlt(active)}
                  fill
                  sizes="(min-width: 768px) 768px, 100vw"
                  className="object-contain p-4 sm:p-8"
                  priority
                />
              </div>
              <div className="text-text-mid mt-3 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={goPrev}
                  className="hover:text-primary inline-flex items-center gap-1 font-medium transition-colors"
                  aria-label="Previous pattern"
                >
                  <ChevronLeft className="size-4" aria-hidden />
                  Previous
                </button>
                <span className="text-primary text-lg font-medium">
                  {priceFormatter.format(active.price)}
                </span>
                <button
                  type="button"
                  onClick={goNext}
                  className="hover:text-primary inline-flex items-center gap-1 font-medium transition-colors"
                  aria-label="Next pattern"
                >
                  Next
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              </div>
              <p className="text-text-mid mt-4 text-center text-xs italic">
                To order pattern #{active.number}, call or email and reference
                the pattern number.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
