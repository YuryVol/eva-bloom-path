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
import { useAddress } from "@/lib/use-address";

export const Route = createFileRoute("/_authenticated/journey/reassess")({
  component: ReassessScreen,
});

const HERO_SRC = "/assets/eva/step-11-resistance-release.png";
const HERO_ALT =
  "Ева рядом с трансформированным камнем — цепи ослабли, изнутри пробивается тёплый свет";

// before = resistance score (0=нет сопротивления, 10=максимум)
// easeValue = ease score (0=всё ещё тяжело, 10=легко)
// improvement > 0 означает прогресс
function diffCopy(improvement: number) {
  if (improvement >= 5) return "Огромный сдвиг. Тело услышало тебя.";
  if (improvement >= 3) return "Стало заметно легче. Это работа изнутри.";
  if (improvement >= 1) return "Чуть-чуть отпустило. Этого уже достаточно.";
  if (improvement === 0) return "Пока всё так же — это тоже нормально. Иногда нужно время.";
  return "Сейчас плотнее, чем было. Будь к себе бережна — что-то поднялось наружу.";
}

function ReassessScreen() {
  const a = useAddress();
  const { state, journeyId, setStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  // before = resistance score (0=нет, 10=максимум)
  const before = state.resistance_score_before ?? 5;

  // value = ease score (0=всё ещё тяжело, 10=легко)
  // Если уже сохранено — конвертируем из resistance обратно в ease
  const [value, setValue] = useState<number>(
    typeof state.resistance_score_after === "number" && state.resistance_score_after !== 5
      ? 10 - state.resistance_score_after
      : Math.min(10, 10 - Math.max(0, before - 2)),
  );
  const [saving, setSaving] = useState(false);

  // improvement > 0 означает прогресс (стало легче)
  // before (resistance) → on ease scale: 10 - before
  const improvement = value - (10 - before);
  const positive = improvement > 0;

  const handleNext = async () => {
    if (!journeyId) return;
    setSaving(true);
    const bonus = positive ? 10 : 5;
    const coins = positive ? 5 : 2;
    // Сохраняем в формате resistance (10 - ease) для совместимости с серверной логикой
    const resistanceAfter = 10 - value;
    const next = {
      ...state,
      resistance_score_after: resistanceAfter,
      xp: (state.xp || 0) + bonus,
      coins: (state.coins || 0) + coins,
    };
    patch({ resistance_score_after: resistanceAfter, xp: next.xp, coins: next.coins });
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
            {a.naskolko_legko}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:mt-4 md:mx-0 mx-auto">
            {a.vsomni} цель: «{state.desired_goal || "свою цель"}». Просто {a.zameti.toLowerCase()}, как
            ощущается сейчас — без попыток «угадать правильно».
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            0 — всё ещё тяжело · 10 — это легко
          </p>
        </div>

        <div className="mt-5 md:mt-8">
          <GlassCard>
            <Slider010 value={value} onChange={setValue} />
            <p className="mt-6 text-center font-display text-base italic text-foreground/80">
              {diffCopy(improvement)}
            </p>
          </GlassCard>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <GlassCard className="p-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Тяжесть
            </p>
            <p className="mt-2 font-display text-3xl text-foreground">{before}</p>
            <p className="mt-1 text-[10px] text-muted-foreground/70">до</p>
          </GlassCard>
          <GlassCard className="p-4 text-center" selected={positive}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Сдвиг
            </p>
            <p
              className={`mt-2 font-display text-3xl ${
                positive
                  ? "text-glow text-primary"
                  : improvement < 0
                    ? "text-accent"
                    : "text-foreground/70"
              }`}
            >
              {improvement > 0 ? `+${improvement}` : improvement < 0 ? `${improvement}` : "0"}
            </p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Лёгкость
            </p>
            <p className="mt-2 font-display text-3xl text-foreground">{value}</p>
            <p className="mt-1 text-[10px] text-muted-foreground/70">сейчас</p>
          </GlassCard>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2">
          <GlowButton onClick={handleNext} disabled={saving}>
            {saving ? "сохраняю…" : "Зафиксировать"}
          </GlowButton>
          <p className="text-xs text-muted-foreground">
            {positive
              ? `+10 XP · +5 монет за сдвиг на ${improvement}`
              : "+5 XP · +2 монеты за честность"}
          </p>
        </div>
      </JourneyScene>
    </FadeTransition>
  );
}
