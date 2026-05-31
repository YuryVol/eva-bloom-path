import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  src: string;
  alt: string;
  caption?: string;
  children: ReactNode;
  className?: string;
}

/**
 * App-shell layout for journey screens.
 *
 * Mobile: compact hero strip (~24vh) on top, the rest of the screen is a
 * scrollable interactive panel — no whole-page scroll.
 *
 * Desktop (md+): two columns. Left = sticky Eva visual filling the column.
 * Right = scrollable interactive panel.
 *
 * The parent route layout MUST provide a fixed-height container
 * (e.g. h-[100dvh] flex flex-col overflow-hidden) for the inner scroll to work.
 */
export function EvaScene({ src, alt, caption, children, className }: Props) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-10",
        className,
      )}
    >
      {/* Eva visual */}
      <figure className="relative shrink-0 md:h-full md:min-h-0">
        <div
          className={cn(
            "relative overflow-hidden border border-border bg-card/60 shadow-card",
            "rounded-2xl md:rounded-3xl",
            "h-[24vh] max-h-[220px] md:h-full md:max-h-none",
          )}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 110%, oklch(0.74 0.13 70 / 0.18), transparent 60%)",
            }}
          />
          <img
            src={src}
            alt={alt}
            loading="lazy"
            className="relative block h-full w-full object-cover object-center"
          />
          {caption && (
            <figcaption className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background/70 px-3 py-1 text-[11px] italic text-muted-foreground backdrop-blur-sm md:bottom-3 md:text-xs">
              {caption}
            </figcaption>
          )}
        </div>
      </figure>

      {/* Interactive panel — the only scrollable area */}
      <div className="relative mt-4 min-h-0 flex-1 overflow-y-auto pr-1 md:mt-0 md:max-h-full">
        <div className="pb-6">{children}</div>
      </div>
    </div>
  );
}
