import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { type SphereId } from "@/lib/journey-types";
import { getNextStep } from "@/lib/sphere-journeys";

export const Route = createFileRoute("/_authenticated/journey/breathing-work")({
  component: BreathingWorkScreen,
});

const HERO_SRC = "/assets/eva/step-3-path.png";

// 4-7-8 phases
const PHASES_478 = [
  { label: "Вдох", duration: 4, color: "rgba(255,210,120,0.6)" },
  { label: "Задержка", duration: 7, color: "rgba(200,170,100,0.4)" },
  { label: "Выдох", duration: 8, color: "rgba(140,180,160,0.5)" },
];

const BODY_SCAN_STEPS = [
  "Почувствуй ступни. Тяжёлые и тёплые.",
  "Внимание поднимается к голеням и коленям.",
  "Живот — расслабь его с каждым выдохом.",
  "Грудь — не контролируй дыхание, просто замечай.",
  "Плечи — позволь им опуститься.",
  "Лицо — расслабь челюсть, веки.",
  "Ты здесь. Ты в порядке.",
];

function BreathingWorkScreen() {
  const { state, journeyId, pushStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const [type, setType] = useState<"478" | "body-scan" | null>(null);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  // 4-7-8
  const [cycleCount, setCycleCount] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseLeft, setPhaseLeft] = useState(0);
  const [running, setRunning] = useState(false);

  // Body scan
  const [scanStep, setScanStep] = useState(0);
  const scanTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running || type !== "478") return;
    const phase = PHASES_478[phaseIdx];
    setPhaseLeft(phase.duration);
    const interval = setInterval(() => {
      setPhaseLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          const next = phaseIdx + 1;
          if (next >= PHASES_478.length) {
            const newCycle = cycleCount + 1;
            setCycleCount(newCycle);
            if (newCycle >= 3) {
              setRunning(false);
              setDone(true);
            } else {
              setPhaseIdx(0);
            }
          } else {
            setPhaseIdx(next);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phaseIdx]);

  const startScan = () => {
    setScanStep(0);
    let i = 0;
    scanTimer.current = setInterval(() => {
      i++;
      if (i >= BODY_SCAN_STEPS.length) {
        clearInterval(scanTimer.current!);
        setDone(true);
      } else {
        setScanStep(i);
      }
    }, 8000);
  };

  const handleNext = async () => {
    if (!journeyId) return;
    setSaving(true);
    const next = { ...state, breathing_type: type ?? "478", xp: (state.xp || 0) + 8, coins: (state.coins || 0) + 3 };
    patch({ breathing_type: type ?? "478", xp: next.xp, coins: next.coins });
    const nextStep = getNextStep(state.priority_sphere as SphereId, "breathing-work", next);
    pushStep(nextStep);
    try {
      await save({ data: { id: journeyId, state: next as never, current_step: nextStep } });
      navigate({ to: `/journey/${nextStep}` as never });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FadeTransition k="breathing-work">
      <JourneyScene current={{ src: HERO_SRC, alt: "Ева и дыхание" }}>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Медитативный путь</p>
          <h1 className="mt-2 font-display text-3xl text-glow md:text-5xl">Остановиться и услышать</h1>
        </div>

        <AnimatePresence mode="wait">
          {!type && (
            <motion.div key="pick" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-5 flex flex-col gap-3">
              <GlassCard className="cursor-pointer p-5" onClick={() => setType("478")}>
                <p className="font-medium">🌬️ Дыхание 4-7-8</p>
                <p className="mt-1 text-xs text-muted-foreground">3 цикла · ~2 мин · успокаивает нервную систему</p>
              </GlassCard>
              <GlassCard className="cursor-pointer p-5" onClick={() => { setType("body-scan"); startScan(); }}>
                <p className="font-medium">🌿 Сканирование тела</p>
                <p className="mt-1 text-xs text-muted-foreground">7 шагов · ~1 мин · возвращает в тело</p>
              </GlassCard>
            </motion.div>
          )}

          {type === "478" && !done && (
            <motion.div key="478" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-5 flex flex-col items-center gap-4 text-center">
              <p className="text-xs text-muted-foreground">Цикл {cycleCount + 1} из 3</p>
              {running && (
                <p className="text-[10px] text-muted-foreground/50">
                  Осталось ~{Math.ceil(((3 - cycleCount - 1) * 19 + (phaseIdx === 0 ? 4 + 7 + 8 - (4 - phaseLeft) : phaseIdx === 1 ? 7 + 8 - (7 - phaseLeft) : 8 - (8 - phaseLeft))) / 60)}:{String(((3 - cycleCount - 1) * 19 + (phaseIdx === 0 ? 4 + 7 + 8 - (4 - phaseLeft) : phaseIdx === 1 ? 7 + 8 - (7 - phaseLeft) : phaseLeft)) % 60).padStart(2, "0")}
                </p>
              )}
              {running ? (
                <>
                  <motion.div
                    className="flex size-28 items-center justify-center rounded-full border-4"
                    style={{ borderColor: PHASES_478[phaseIdx].color }}
                    animate={{ scale: phaseIdx === 0 ? [1, 1.15] : phaseIdx === 2 ? [1.15, 1] : 1.15 }}
                    transition={{ duration: PHASES_478[phaseIdx].duration, ease: "easeInOut" }}
                  >
                    <div className="text-center">
                      <p className="font-display text-3xl text-primary">{phaseLeft}</p>
                      <p className="text-xs text-muted-foreground">{PHASES_478[phaseIdx].label}</p>
                    </div>
                  </motion.div>
                  <p className="text-xs text-muted-foreground">Вдох 4 · Задержка 7 · Выдох 8</p>
                </>
              ) : (
                <GlowButton onClick={() => { setRunning(true); setPhaseIdx(0); }}>Начать дыхание</GlowButton>
              )}
            </motion.div>
          )}

          {type === "body-scan" && !done && (
            <motion.div key="scan" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-5 text-center">
              <AnimatePresence mode="wait">
                <motion.p key={scanStep}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="font-display text-xl text-foreground/90">
                  {BODY_SCAN_STEPS[scanStep]}
                </motion.p>
              </AnimatePresence>
              <p className="mt-3 text-xs text-muted-foreground">{scanStep + 1} / {BODY_SCAN_STEPS.length}</p>
            </motion.div>
          )}

          {done && (
            <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-5 text-center">
              <p className="font-display text-lg italic text-foreground/80">
                Хорошо. Ты дала себе паузу. Теперь — практика.
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
