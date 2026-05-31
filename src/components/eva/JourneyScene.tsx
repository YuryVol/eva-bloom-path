import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type SceneVisual = {
  src: string;
  alt: string;
  /** Image positioning inside the circle for "object-cover" framing. */
  objectPosition?: string;
  /** Optional zoom factor inside the circle (1 = fit). */
  scale?: number;
};

interface Props {
  /** The visual currently shown. */
  current: SceneVisual;
  /** All possible visuals — used to preload + crossfade between them. */
  all?: SceneVisual[];
  /** Optional caption under desktop rectangle. */
  caption?: string;
  /** Optional subtitle under the desktop caption. */
  captionSub?: string;
  /** Sticky desktop column (useful on long pages like summary). */
  sticky?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Unified hero layout for journey screens.
 *
 * Mobile (<md): circular portrait with warm halo + glow + soft shadow.
 *               Image is object-cover so no cropping edges show.
 * Desktop/tablet (md+): two-column grid. Left = rectangle with rounded
 *               corners holding the same image (object-contain so the
 *               whole illustration is visible). Right = scrollable content.
 */
export function JourneyScene({
  current,
  all,
  caption,
  captionSub,
  sticky = false,
  children,
  className,
}: Props) {
  const visuals = all && all.length > 0 ? all : [current];

  // Preload all variants so crossfades are instant.
  useEffect(() => {
    visuals.forEach((v) => {
      const img = new Image();
      img.src = v.src;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visuals.map((v) => v.src).join("|")]);

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-8 lg:gap-10",
        className,
      )}
    >
      {/* MOBILE: round portrait with halo */}
      <div className="mx-auto mb-4 mt-1 flex shrink-0 items-center justify-center md:hidden">
        <CircleHero current={current} all={visuals} />
      </div>

      {/* DESKTOP / TABLET: rectangle on the left */}
      <figure
        className={cn(
          "relative hidden shrink-0 md:flex md:flex-col md:h-full md:min-h-0",
          sticky && "md:sticky md:top-2 md:self-start",
        )}
      >
        <div className="relative h-full min-h-[420px] overflow-hidden rounded-3xl border border-border bg-card/60 shadow-card">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 110%, oklch(0.74 0.13 70 / 0.18), transparent 60%)",
            }}
          />
          {visuals.map((v) => {
            const isActive = v.src === current.src;
            return (
              <img
                key={v.src}
                src={v.src}
                alt={v.alt}
                loading="lazy"
                className="absolute inset-0 block h-full w-full"
                style={{
                  objectFit: "cover",
                  objectPosition: v.objectPosition ?? "center center",
                  opacity: isActive ? 1 : 0,
                  transition: "opacity 460ms ease",
                }}
              />
            );
          })}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{ boxShadow: "inset 0 0 48px rgba(246, 240, 230, 0.55)" }}
          />
        </div>
        {(caption || captionSub) && (
          <figcaption className="mt-4 text-center">
            {caption && (
              <p className="font-display text-lg text-foreground">{caption}</p>
            )}
            {captionSub && (
              <p className="mt-1 text-sm text-muted-foreground">{captionSub}</p>
            )}
          </figcaption>
        )}
      </figure>

      {/* Interactive panel — the only scrollable area */}
      <div className="relative min-h-0 flex-1 overflow-y-auto pr-1 md:max-h-full">
        <div className="pb-6">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Mobile circular portrait ---------- */

function CircleHero({
  current,
  all,
}: {
  current: SceneVisual;
  all: SceneVisual[];
}) {
  const orbitDots = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div className="relative flex size-52 items-center justify-center">
      {/* Sun halo radiating into background */}
      <div
        aria-hidden
        className="absolute -inset-10 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,236,170,0.7) 0%, rgba(255,224,150,0.45) 28%, rgba(255,214,140,0.22) 50%, rgba(255,214,140,0) 75%)",
        }}
      />
      {/* Pulsing outer glow */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            "0 0 22px 6px rgba(255,236,170,0.55), 0 0 50px 14px rgba(255,224,150,0.35)",
            "0 0 38px 14px rgba(255,248,214,0.9), 0 0 90px 30px rgba(255,224,150,0.55)",
            "0 0 22px 6px rgba(255,236,170,0.55), 0 0 50px 14px rgba(255,224,150,0.35)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Orbit sparkles */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {orbitDots.map((i) => {
          const angle = (i / orbitDots.length) * Math.PI * 2;
          const radius = 52;
          const left = 50 + Math.cos(angle) * radius;
          const top = 50 + Math.sin(angle) * radius;
          const delay = (i % 7) * 0.25;
          const duration = 2 + (i % 4) * 0.4;
          const size = 3 + (i % 3);
          return (
            <motion.span
              key={i}
              className="absolute rounded-full bg-[#FFF8D6]"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
                boxShadow: "0 0 10px 3px rgba(255,243,180,0.9)",
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
              transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>
      {/* Circular image frame */}
      <div
        className="relative size-52 overflow-hidden rounded-full border-2 border-[#FFF8D6]/80 bg-[#F9F4EE]"
        style={{
          boxShadow:
            "0 14px 32px -8px rgba(110,70,40,0.35), 0 6px 14px -4px rgba(110,70,40,0.28)",
        }}
      >
        {all.map((v) => {
          const isActive = v.src === current.src;
          const scale = v.scale ?? 1;
          return (
            <img
              key={v.src}
              src={v.src}
              alt={v.alt}
              draggable={false}
              className="absolute inset-0 h-full w-full select-none"
              style={{
                objectFit: "cover",
                objectPosition: v.objectPosition ?? "center 30%",
                transform: `scale(${isActive ? scale : scale * 0.985})`,
                opacity: isActive ? 1 : 0,
                filter: isActive ? "blur(0)" : "blur(4px)",
                transition:
                  "opacity 460ms ease, transform 460ms ease, filter 460ms ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
