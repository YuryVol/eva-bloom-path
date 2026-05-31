import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { useState } from "react";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { Slider010 } from "@/components/eva/Slider010";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";

export const Route = createFileRoute("/_authenticated/journey/reassess")({
  component: ReassessScreen,
});

const HERO_SRC = "/assets/eva/step-11-resistance-release.png";
const HERO_ALT =
  "Ева рядом с трансформированным камнем — цепи ослабли, изнутри пробивается тёплый свет";

function diffCopy(before: number, after: number) {
  const delta = before - after;
  if (delta >= 5) return "Огромный сдвиг. Тело услышало тебя.";
  if (delta >= 3) return "Стало заметно легче. Это работа изнутри.";
  if (delta >= 1) return "Чуть-чуть отпустило. Этого уже достаточно.";
  if (delta === 0) return "Пока всё так же — это тоже нормально. Иногда нужно время.";
  return "Сейчас плотнее, чем было. Будь к себе бережен — что-то поднялось наружу.";
}

function ReassessScreen() {
  const { state, journeyId, setStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const before = state.resistance_score_before ?? 5;
  const [value, setValue] = useState<number>(
    typeof state.resistance_score_after === "number" && state.resistance_score_after !== 5
      ? state.resistance_score_after
      : Math.max(0, before - 2),
  );
  const [saving, setSaving] = useState(false);

  const delta = before - value;
  const positive = delta > 0;

  const handleNext = async () => {
    if (!journeyId) return;
    setSaving(true);
    const bonus = positive ? 10 : 5;
    const coins = positive ? 5 : 2;
    const next = {
      ...state,
      resistance_score_after: value,
      xp: (state.xp || 0) + bonus,
      coins: (state.coins || 0) + coins,
    };
    patch({ resistance_score_after: value, xp: next.xp, coins: next.coins });
    setStep("success");
    try {
      await save({
        data: { id: journeyId, state: next as never, current_step: "success" },
      });
      
      navigate({ to: "/journey/success" as never });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FadeTransition k="reassess">
      <JourneyScene current={{ src: HERO_SRC, alt: HERO_ALT }}>
        <div className="text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Проверка
          </p>
          <h1 className="mt-2 font-display text-3xl text-glow md:mt-4 md:text-5xl">
            Насколько сейчас тебе это легко?
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:mt-4 md:mx-0 mx-auto">
            Вспомни цель: «{state.desired_goal || "свою цель"}». Просто заметь, как
            ощущается сейчас — без попыток «угадать правильно».
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            0 — легко. 10 — мешает что-то.
          </p>
        </div>

        <div className="mt-5 md:mt-8">
          <GlassCard>
            <Slider010 value={value} onChange={setValue} />
            <p className="mt-6 text-center font-display text-base italic text-foreground/80">
              {diffCopy(before, value)}
            </p>
          </GlassCard>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <GlassCard className="p-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Было
            </p>
            <p className="mt-2 font-display text-3xl text-foreground">{before}</p>
          </GlassCard>
          <GlassCard className="p-4 text-center" selected={positive}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Δ
            </p>
            <p
              className={`mt-2 font-display text-3xl ${
                positive
                  ? "text-glow text-primary"
                  : delta < 0
                    ? "text-accent"
                    : "text-foreground/70"
              }`}
            >
              {delta > 0 ? `−${delta}` : delta < 0 ? `+${-delta}` : "0"}
            </p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Стало
            </p>
            <p className="mt-2 font-display text-3xl text-foreground">{value}</p>
          </GlassCard>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <GlowButton onClick={handleNext} disabled={saving}>
            {saving ? "сохраняю…" : "Зафиксировать"}
          </GlowButton>
          <p className="text-xs text-muted-foreground">
            {positive
              ? `+10 XP · +5 монет за сдвиг на ${delta}`
              : "+5 XP · +2 монеты за честность"}
          </p>
        </div>
      </JourneyScene>
    </FadeTransition>
  );
}
