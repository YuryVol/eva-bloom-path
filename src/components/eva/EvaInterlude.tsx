import { AnimatePresence, motion } from "framer-motion";
import { useInterlude, SCENE_MAP } from "@/lib/eva-interlude";

import type { TargetAndTransition } from "framer-motion";

const motionVariants: Record<"breathe" | "sway" | "pulse" | "rise", TargetAndTransition> = {
  breathe: { scale: [0.96, 1.02, 0.98], transition: { duration: 1.4, repeat: Infinity } },
  sway: { rotate: [-2, 2, -2], transition: { duration: 1.6, repeat: Infinity } },
  pulse: { scale: [1, 1.05, 1], transition: { duration: 0.9, repeat: Infinity } },
  rise: { y: [6, -6, 6], transition: { duration: 1.8, repeat: Infinity } },
};

export function EvaInterludeHost() {
  const { active, finish } = useInterlude();
  const cfg = active ? SCENE_MAP[active] : null;

  return (
    <AnimatePresence>
      {active && cfg && (
        cfg.video ? (
          <motion.div
            key={active}
            className="fixed inset-0 z-[60] bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <video
              src={cfg.video}
              autoPlay
              muted
              playsInline
              loop={cfg.loop}
              onEnded={cfg.loop ? undefined : finish}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-5 px-6 pb-10 text-center">
              {cfg.subtitle && (
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/80 md:text-xs">
                  {cfg.subtitle}
                </p>
              )}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="font-display text-2xl italic text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] md:text-3xl"
              >
                {cfg.caption}
              </motion.p>
              <button
                type="button"
                onClick={finish}
                className="mt-2 rounded-full bg-white/95 px-10 py-3 text-sm font-medium text-foreground shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition hover:scale-105 hover:bg-white"
              >
                Перейти
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key={active}
            type="button"
            onClick={finish}
            aria-label="Пропустить переход"
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 px-6 backdrop-blur-md"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, oklch(0.96 0.04 80 / 0.95), oklch(0.88 0.05 70 / 0.92) 60%, oklch(0.78 0.06 60 / 0.88))",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.div
              className="relative w-56 h-56 md:w-72 md:h-72"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, oklch(0.85 0.13 75 / 0.45), transparent 65%)",
                  filter: "blur(10px)",
                }}
              />
              <motion.img
                src={cfg.src}
                alt={cfg.alt}
                className="relative h-full w-full object-contain drop-shadow-[0_20px_30px_oklch(0.5_0.08_70/0.25)]"
                animate={motionVariants[cfg.motion]}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="font-display text-xl italic text-foreground/90 md:text-2xl"
            >
              {cfg.caption}
            </motion.p>
          </motion.button>
        )
      )}
    </AnimatePresence>
  );
}
