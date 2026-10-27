import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { useAddress } from "@/lib/use-address";

export const Route = createFileRoute("/_authenticated/journey/self-letter")({
  component: SelfLetterScreen,
});

const HERO_SRC = "/assets/eva/step-3-path.png";
const PHASE_SEC = 120; // 2 min per phase

function SelfLetterScreen() {
  const a = useAddress();
  const { state, journeyId, pushStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const [phase, setPhase] = useState<1 | 2 | "done">(1);
  const [timeLeft, setTimeLeft] = useState(PHASE_SEC);
  const [saving, setSaving] = useState(false);
  const [writingMode, setWritingMode] = useState<"app" | "paper">("app");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); timerRef.current = null; return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const nextPhase = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (phase === 1) { setPhase(2); setTimeLeft(PHASE_SEC); }
    else { setPhase("done"); }
  };

  const handleNext = async () => {
    if (!journeyId) return;
    setSaving(true);
    const next = { ...state, xp: (state.xp || 0) + 10, coins: (state.coins || 0) + 4 };
    patch({ xp: next.xp, coins: next.coins });
    pushStep("practice-select");
    try {
      await save({ data: { id: journeyId, state: next as never, current_step: "practice-select" } });
      navigate({ to: "/journey/practice-select" as never });
    } finally {
      setSaving(false);
    }
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <FadeTransition k="self-letter">
      <JourneyScene current={{ src: HERO_SRC, alt: "Ева и письмо" }}>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Диалог с собой</p>
          <h1 className="mt-2 font-display text-3xl text-glow md:text-5xl">Письмо мудрой себе</h1>
        </div>

        {/* Mode toggle */}
        {phase !== "done" && (
          <div className="mt-4 flex items-center justify-center gap-1 rounded-xl border border-border/40 bg-card/40 p-1">
            <button type="button" onClick={() => setWritingMode("app")}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${writingMode === "app" ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground"}`}>
              В приложении
            </button>
            <button type="button" onClick={() => setWritingMode("paper")}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${writingMode === "paper" ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground"}`}>
              На бумаге
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {phase === 1 && (
            <motion.div key="p1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {a.napishi} себе из этой сферы — о том, что болит, чего не хватает, что накопилось.
                </p>
                <span className="ml-4 shrink-0 font-mono text-sm text-muted-foreground">
                  {mins}:{String(secs).padStart(2, "0")}
                </span>
              </div>
              {writingMode === "app" ? (
                <textarea rows={7} placeholder="Дорогая я..."
                  className="mt-3 w-full resize-none rounded-2xl border border-border/50 bg-card/40 px-4 py-3 text-sm placeholder:text-muted-foreground/40 focus:border-primary/60 focus:outline-none"
                  onFocus={startTimer}
                />
              ) : (
                <div className="mt-3 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/40 bg-card/20 py-8 text-center">
                  <p className="text-2xl">✍️</p>
                  <p className="text-sm text-muted-foreground">Пиши на бумаге. Ева подождёт.</p>
                  {!timerRef.current && (
                    <button type="button" onClick={startTimer} className="rounded-xl bg-primary/10 px-4 py-2 text-xs text-primary transition hover:bg-primary/20">
                      Запустить таймер
                    </button>
                  )}
                </div>
              )}
              <div className="mt-4">
                <GlowButton onClick={nextPhase}>Готово · перейти к ответу</GlowButton>
              </div>
            </motion.div>
          )}

          {phase === 2 && (
            <motion.div key="p2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Теперь — ответь от мудрой себя. Той, что знает больше. С заботой и без осуждения.
                </p>
                <span className="ml-4 shrink-0 font-mono text-sm text-muted-foreground">
                  {mins}:{String(secs).padStart(2, "0")}
                </span>
              </div>
              {writingMode === "app" ? (
                <textarea rows={7} placeholder="С любовью к себе..."
                  className="mt-3 w-full resize-none rounded-2xl border border-border/50 bg-card/40 px-4 py-3 text-sm placeholder:text-muted-foreground/40 focus:border-primary/60 focus:outline-none"
                  onFocus={startTimer}
                />
              ) : (
                <div className="mt-3 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/40 bg-card/20 py-8 text-center">
                  <p className="text-2xl">✍️</p>
                  <p className="text-sm text-muted-foreground">Продолжай на бумаге.</p>
                </div>
              )}
              <div className="mt-4">
                <GlowButton onClick={nextPhase}>Готово</GlowButton>
              </div>
            </motion.div>
          )}

          {phase === "done" && (
            <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-5 text-center">
              <p className="font-display text-lg italic text-foreground/80">
                Ты поговорила с собой. Это ценнее, чем кажется.
              </p>
              <p className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0"><rect x="3" y="7" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                Письма хранятся только в приложении и не передаются на сервер.
              </p>
              <div className="mt-5">
                <GlowButton onClick={handleNext} disabled={saving}>
                  {saving ? "сохраняю…" : "Выбрать практику"}
                </GlowButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </JourneyScene>
    </FadeTransition>
  );
}
