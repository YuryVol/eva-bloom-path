import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const CYCLE_SECONDS = 15;

export function EmdrAnimation({ cycles = 3, onComplete }: { cycles?: number; onComplete: () => void }) {
  const [running, setRunning] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [remaining, setRemaining] = useState(CYCLE_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setCycle((c) => {
            const next = c + 1;
            if (next >= cycles) {
              setRunning(false);
              onComplete();
              return next;
            }
            return next;
          });
          return CYCLE_SECONDS;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, cycles, onComplete]);

  return (
    <div className="flex flex-col items-center gap-10 py-6">
      <div className="relative h-28 w-full max-w-md overflow-hidden rounded-full bg-muted">
        {running && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 size-14 rounded-full bg-primary"
            style={{
              boxShadow:
                "0 0 40px oklch(0.74 0.13 70 / 0.7), 0 0 14px oklch(0.74 0.13 70 / 0.9)",
            }}
            initial={{ left: 0 }}
            animate={{ left: "calc(100% - 3.5rem)" }}
            transition={{ duration: 1.4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
        )}
        {!running && (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Следи глазами за движением света
          </div>
        )}
      </div>
      <div className="text-center">
        <div className="font-display text-5xl text-foreground">
          {running ? remaining : CYCLE_SECONDS}
        </div>
        <div className="mt-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Цикл {Math.min(cycle + (running ? 1 : 0), cycles)} / {cycles}
        </div>
      </div>
      {!running && cycle < cycles && (
        <button
          onClick={() => {
            setCycle(0);
            setRemaining(CYCLE_SECONDS);
            setRunning(true);
          }}
          className="rounded-full bg-primary px-10 py-3 text-primary-foreground shadow-[0_8px_28px_oklch(0.74_0.13_70/0.45)] transition hover:scale-105"
        >
          Начать
        </button>
      )}
      {!running && cycle >= cycles && (
        <p className="text-sm text-muted-foreground">Цикл завершён. Сделай вдох.</p>
      )}
    </div>
  );
}
