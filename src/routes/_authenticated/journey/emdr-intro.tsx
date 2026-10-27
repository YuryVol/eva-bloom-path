import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { useAddress } from "@/lib/use-address";
import { useAmbientTrack } from "@/lib/use-ambient-track";

export const Route = createFileRoute("/_authenticated/journey/emdr-intro")({
  component: EmdrIntroScreen,
});

const HERO_SRC = "/assets/eva/eva-emdr-pose.png";
const HERO_ALT = "Ева в подготовительной позе для EMDR";

const CONTRAINDICATIONS = [
  "психотические состояния или обострения",
  "эпилепсия в период нестабильности",
  "острый кризис или мысли о самоповреждении",
  "выраженные сложности с концентрацией внимания",
];

function ContraindicationsAccordion() {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border/50 bg-card/50 px-4 py-3 text-left transition hover:bg-card/70"
      >
        <span className="text-xs text-muted-foreground">Когда лучше пропустить этот шаг</span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="contra"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <ul className="flex flex-col gap-1.5 rounded-b-2xl border border-t-0 border-border/50 bg-card/30 px-4 py-4">
              {CONTRAINDICATIONS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmdrIntroScreen() {
  useAmbientTrack("bowls");
  const a = useAddress();
  const { state, journeyId, setStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);
  const [saving, setSaving] = useState(false);

  const handleStart = async () => {
    if (!journeyId) return;
    navigate({ to: "/journey/emdr" as never });
  };

  const handleSkip = async () => {
    if (!journeyId || saving) return;
    setSaving(true);
    const next = {
      ...state,
      emdr_cycles: 0,
      xp: (state.xp || 0) + 1,
      coins: (state.coins || 0) + 1,
    };
    patch({ emdr_cycles: 0, xp: next.xp, coins: next.coins });
    setStep("reassess");
    save({ data: { id: journeyId, state: next as never, current_step: "reassess" } })
      .catch(() => {})
      .finally(() => setSaving(false));
    navigate({ to: "/journey/reassess" as never });
  };

  return (
    <FadeTransition k="emdr-intro">
      <JourneyScene
        current={{
          src: HERO_SRC,
          alt: HERO_ALT,
          objectPosition: "center 25%",
        }}
      >
        <div className="text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Практика
          </p>
          <h1 className="mt-2 font-display text-3xl text-glow md:mt-4 md:text-5xl">
            Сейчас произойдёт кое-что особенное
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:mt-4 md:mx-0 mx-auto">
            Мы попробуем технику, которая помогает мозгу «переварить» тяжёлые ощущения. Это безопасно и мягко.
          </p>
        </div>

        <p className="mt-4 text-center text-xs italic text-muted-foreground/70">
          Сотни женщин сделали этот шаг — и стали спокойнее.
        </p>

        <div className="mt-3 md:mt-5">
          <GlassCard>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
              {a.tebya_zhdet}
            </p>
            <ul className="flex flex-col gap-3">
              {[
                `${a.sledi} глазами за движущейся точкой — голова остаётся неподвижной`,
                `${a.uderzhivaj} в уме образ, который ${a.nashla} на прошлом шаге`,
                `${a.dyshe} спокойно — тело само знает, что делать`,
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-primary/40 font-display text-xs text-primary/80 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-foreground/80">{step}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>

        <details className="mt-4 rounded-2xl border border-border/30 bg-card/60 px-4 py-3">
          <summary className="cursor-pointer text-xs font-medium text-primary/80 hover:text-primary">
            Почему это работает?
          </summary>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            EMDR (десенсибилизация движениями глаз) — метод, рекомендованный ВОЗ для работы со стрессом и тревогой.
            Движения глаз за объектом активируют процессы переработки эмоциональных переживаний.
            Исследования показывают снижение тревожности уже после 1–3 сессий.
          </p>
        </details>

        <div className="mt-4">
          <ContraindicationsAccordion />
        </div>

        <div className="mt-6 flex flex-col items-center gap-3 md:items-start">
          <GlowButton onClick={handleStart}>
            Я готова
          </GlowButton>
          <p className="text-center text-xs text-muted-foreground/50">
            Сомневаешься — смело нажми «Пропустить», это нормально.
          </p>
          <button
            type="button"
            onClick={handleSkip}
            disabled={saving}
            className="text-xs tracking-wide text-muted-foreground/70 underline underline-offset-2 transition-colors hover:text-muted-foreground disabled:opacity-40"
          >
            Пропустить практику
          </button>
        </div>
      </JourneyScene>
    </FadeTransition>
  );
}
