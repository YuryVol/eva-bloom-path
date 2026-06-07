import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { EmdrAnimation } from "@/components/eva/EmdrAnimation";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";

export const Route = createFileRoute("/_authenticated/journey/emdr")({
  component: EmdrScreen,
});

const SHAPE_LABELS: Record<string, string> = {
  stone: "камень",
  knot: "узел",
  wall: "стену",
  fog: "туман",
  ice: "лёд",
  thorn: "шипы",
  void: "пустоту",
  shadow: "тень",
};



const CONTRAINDICATIONS = [
  "активные психозы (шизофрения, бредовые расстройства)",
  "эпилепсия (в стадии нестабильности)",
  "острые суицидальные состояния",
  "тяжёлые когнитивные нарушения",
  "неспособность удерживать внимание",
  "отсутствие мотивации к участию в терапевтическом процессе",
];

function EmdrInfoAccordion() {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full max-w-2xl">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/60 px-5 py-4 text-left backdrop-blur-sm transition hover:bg-card/80"
      >
        <span className="text-sm text-muted-foreground">Что такое EMDR и противопоказания</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="emdr-info"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 rounded-b-2xl border border-t-0 border-border/60 bg-card/40 px-5 py-5 backdrop-blur-sm">
              <p className="text-sm leading-relaxed text-muted-foreground">
                EMDR активирует естественные механизмы переработки через билатеральную
                стимуляцию (движения глаз, звуки, тактильные сигналы). Это помогает мозгу
                «перезаписать» травматичные воспоминания.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Метод EMDR не заставляет вас месяцами «пережёвывать» травму, а помогает
                мозгу переработать её на физиологическом уровне.
              </p>
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                  Противопоказания к практике:
                </p>
                <ul className="flex flex-col gap-1.5">
                  {CONTRAINDICATIONS.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmdrScreen() {
  const { state, journeyId, setStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const shapeLabel = SHAPE_LABELS[state.resistance_shape] || "это";
  const goal = state.desired_goal || "своей цели";

  const handleComplete = () => {
    setDone(true);
    patch({ emdr_cycles: 3 });
  };

  const handleNext = async () => {
    if (!journeyId) return;
    setSaving(true);
    const next = {
      ...state,
      emdr_cycles: 3,
      xp: (state.xp || 0) + 15,
      coins: (state.coins || 0) + 5,
    };
    patch({ emdr_cycles: 3, xp: next.xp, coins: next.coins });
    setStep("reassess");
    try {
      await save({
        data: { id: journeyId, state: next as never, current_step: "reassess" },
      });
      navigate({ to: "/journey/reassess" as never });
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!journeyId) return;
    setSaving(true);
    const next = {
      ...state,
      emdr_cycles: 0,
      xp: (state.xp || 1) + 1,
      coins: (state.coins || 1) + 1,
    };
    patch({ emdr_cycles: 0, xp: next.xp, coins: next.coins });
    setStep("reassess");
    try {
      await save({
        data: { id: journeyId, state: next as never, current_step: "reassess" },
      });
      navigate({ to: "/journey/reassess" as never });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FadeTransition k="emdr">
      <div className="step-10-screen">
        <div className="step-10-content">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Практика
            </p>
            <h1 className="step-10-title mt-4 font-display text-4xl text-glow md:text-5xl">
              Сейчас мы мягко растворим это
            </h1>
            <p className="step-10-description mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Удерживай образ, который ты почувствовала. Следи глазами за светом:
              не двигай головой. Дай телу самостоятельно справиться с этим дискомфортом.
            </p>
          </div>


          <div className="mt-6 w-full max-w-2xl">
            <EmdrInfoAccordion />
          </div>

          <div className="emdr-practice-card mt-6 w-full max-w-2xl">
            <GlassCard className="p-4 md:p-8">
              <EmdrAnimation cycles={3} onComplete={handleComplete} />
            </GlassCard>
          </div>

          {done && (
            <div className="mt-8 w-full max-w-2xl text-center">
              <p className="font-display text-base italic text-foreground/80">
                Сделай глубокий вдох. Заметь, что изменилось внутри.
              </p>
              <div className="mt-6 flex flex-col items-center gap-2">
                <GlowButton onClick={handleNext} disabled={saving}>
                  {saving ? "сохраняю…" : "Я готова проверить"}
                </GlowButton>
                <p className="text-xs text-muted-foreground">
                  +15 XP · +5 монет за прохождение цикла
                </p>
              </div>
            </div>
          )}

          <button
            onClick={handleSkip}
            disabled={saving}
            className="mt-6 mb-2 text-xs tracking-wide text-muted-foreground/60 underline-offset-2 transition-colors hover:text-muted-foreground hover:underline disabled:opacity-40"
          >
            Пропустить
          </button>
        </div>
      </div>
    </FadeTransition>
  );
}
