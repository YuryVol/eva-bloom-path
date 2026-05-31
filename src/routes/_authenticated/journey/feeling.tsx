import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { useState } from "react";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { JourneyScene, type SceneVisual } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";

export const Route = createFileRoute("/_authenticated/journey/feeling")({
  component: FeelingScreen,
});

const FEELINGS = [
  { id: "calm", label: "Спокойствие", hint: "когда внутри тихо" },
  { id: "freedom", label: "Свобода", hint: "когда решаешь сама" },
  { id: "lightness", label: "Лёгкость", hint: "когда отпустила лишнее" },
  { id: "confidence", label: "Уверенность", hint: "когда опора внутри" },
  { id: "warmth", label: "Тепло", hint: "когда чувствую любовь" },
  { id: "joy", label: "Радость", hint: "когда жизнь играет" },
  { id: "clarity", label: "Ясность", hint: "когда вижу путь" },
  { id: "power", label: "Сила", hint: "когда могу" },
];

const STATE_IMAGES: Record<string, string> = {
  default: "/assets/eva/states/step-06-state-01-default.png",
  "Спокойствие": "/assets/eva/states/step-06-state-02-spokoystvie.png",
  "Свобода": "/assets/eva/states/step-06-state-03-svoboda.png",
  "Лёгкость": "/assets/eva/states/step-06-state-04-legkost.png",
  "Уверенность": "/assets/eva/states/step-06-state-05-uverennost.png",
  "Тепло": "/assets/eva/states/step-06-state-06-teplo.png",
  "Радость": "/assets/eva/states/step-06-state-07-radost.png",
  "Ясность": "/assets/eva/states/step-06-state-08-yasnost.png",
  "Сила": "/assets/eva/states/step-06-state-09-sila.png",
};

const ALL_STATE_VISUALS: SceneVisual[] = Object.entries(STATE_IMAGES).map(
  ([label, src]) => ({ src, alt: label, objectPosition: "center 30%" }),
);

function FeelingScreen() {
  const { state, journeyId, setStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const initialIsPreset = FEELINGS.some((f) => f.label === state.desired_state);
  const [picked, setPicked] = useState<string>(initialIsPreset ? state.desired_state : "");
  const [custom, setCustom] = useState<string>(initialIsPreset ? "" : state.desired_state || "");
  const [saving, setSaving] = useState(false);

  const value = picked || custom.trim();
  const canNext = value.length > 0 && !saving;

  const heroSrc = picked && STATE_IMAGES[picked] ? STATE_IMAGES[picked] : STATE_IMAGES.default;
  const current: SceneVisual = {
    src: heroSrc,
    alt: picked || "Желаемое состояние",
    objectPosition: "center 30%",
  };

  const pickPreset = (label: string) => {
    setPicked((cur) => (cur === label ? "" : label));
  };

  const handleNext = async () => {
    if (!journeyId || !canNext) return;
    const finalValue = picked || custom.trim();
    const isCustom = !FEELINGS.some((f) => f.label === finalValue);
    setSaving(true);
    const xpGain = isCustom ? 7 : 3;
    const coinGain = isCustom ? 3 : 0;
    const next = {
      ...state,
      desired_state: finalValue,
      xp: (state.xp || 0) + xpGain,
      coins: (state.coins || 0) + coinGain,
    };
    patch({ desired_state: finalValue, xp: next.xp, coins: next.coins });
    setStep("current-state");
    try {
      await save({
        data: { id: journeyId, state: next as never, current_step: "current-state" },
      });
      
      navigate({ to: "/journey/current-state" as never });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FadeTransition k="feeling">
      <JourneyScene current={current} all={ALL_STATE_VISUALS}>
        <div className="text-center md:text-left">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground md:text-xs">
            Желаемое состояние
          </p>
          <h1 className="mt-2 font-display text-3xl text-glow md:text-4xl">
            Какое состояние ты хочешь приобрести?
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground md:mx-0 mx-auto">
            Закрой на секунду глаза. Цель достигнута — что ты чувствуешь телом?
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3">
          {FEELINGS.map((f) => {
            const active = picked === f.label;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => pickPreset(f.label)}
                className={`group flex min-h-[84px] flex-col items-center justify-center rounded-2xl border px-2 py-2.5 text-center backdrop-blur-sm transition md:min-h-[96px] md:px-3 md:py-3 ${
                  active
                    ? "border-primary/70 bg-primary/10 shadow-[0_6px_20px_-8px_oklch(0.74_0.13_70/0.45)]"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div
                  className={`font-display text-base leading-tight md:text-lg ${
                    active ? "text-foreground text-glow" : "text-foreground/90"
                  }`}
                >
                  {f.label}
                </div>
                <div className="mt-1 text-[11px] leading-tight text-muted-foreground">
                  {f.hint}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-5">
          <GlassCard>
            <label className="block text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Или своими словами
            </label>
            <input
              type="text"
              value={custom}
              maxLength={80}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="например: «дома в себе»"
              className="mt-2 h-12 w-full rounded-xl border border-border bg-background/60 px-4 font-display text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none md:text-lg"
            />
            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>+7 XP · +3 монеты за своё слово</span>
              <span>{custom.length}/80</span>
            </div>
          </GlassCard>
        </div>

        <div className="mt-5 flex flex-col items-center gap-1.5 md:items-start">
          {value && (
            <p className="font-display text-sm italic text-foreground/80">
              «{value}» — пусть это будет маяком
            </p>
          )}
          <GlowButton onClick={handleNext} disabled={!canNext}>
            {saving ? "сохраняю…" : "Иду к этому"}
          </GlowButton>
        </div>
      </JourneyScene>
    </FadeTransition>
  );
}
