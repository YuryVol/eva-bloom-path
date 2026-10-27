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

const HERO_SRC = "/assets/eva/step-07-current-state.png";
const HERO_ALT =
  "Ева стоит на каменной площадке у светящейся арки — символ пути к желаемому состоянию";

export const Route = createFileRoute("/_authenticated/journey/current-state")({
  component: CurrentStateScreen,
});

function gapCopy(gap: number, desired: string) {
  const d = desired || "это состояние";
  if (gap <= 1) return `Ты уже почти в «${d}». Осталось дотянуться.`;
  if (gap <= 3) return `«${d}» рядом. Расстояние небольшое — но честное.`;
  if (gap <= 5) return `До «${d}» половина пути. ЕВА пойдёт с тобой.`;
  if (gap <= 7) return `Путь к «${d}» долгий. Это не слабость — это правда.`;
  return `«${d}» далеко. И именно поэтому стоит идти.`;
}

function CurrentStateScreen() {
  const a = useAddress();
  const { state, journeyId, setStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const [value, setValue] = useState<number>(
    typeof state.current_state_score === "number" ? state.current_state_score : 5,
  );
  const [saving, setSaving] = useState(false);

  const desired = state.desired_state || "желаемое состояние";
  const gap = 10 - value;

  const handleNext = async () => {
    if (!journeyId) return;
    setSaving(true);
    const next = {
      ...state,
      current_state_score: value,
      xp: (state.xp || 0) + 3,
    };
    patch({ current_state_score: value, xp: next.xp });
    setStep("resistance");
    try {
      await save({
        data: { id: journeyId, state: next as never, current_step: "resistance" },
      });
      navigate({ to: "/journey/resistance" as never });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FadeTransition k="current-state">
      <JourneyScene current={{ src: HERO_SRC, alt: HERO_ALT }}>
        <div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {a.gde_ty}
              </p>
              <h1
                className="mx-auto mt-2 max-w-[360px] font-display text-glow md:mt-4 md:max-w-none md:text-5xl"
                style={{
                  fontSize: "clamp(38px, 9vw, 54px)",
                  lineHeight: 0.96,
                  marginBottom: 12,
                }}
              >
                Насколько состояние «{desired}» {a.ty} {a.oschuschajesh} сегодня?
              </h1>
              <p className="mx-auto max-w-[340px] text-[15px] leading-[1.35] text-muted-foreground md:mt-4 md:max-w-md md:text-sm md:leading-relaxed">
                0 — совсем нет. 10 — это уже {a.tvoyo} состояние прямо сейчас.
              </p>
            </div>

            <div className="mt-[18px] md:mt-8">
              <GlassCard className="md:!p-8 !p-[22px] !rounded-[28px] md:!rounded-2xl">
                <Slider010 value={value} onChange={setValue} />
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      сейчас
                    </div>
                    <div className="mt-1 font-display text-2xl text-foreground">{value}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      расстояние
                    </div>
                    <div className="mt-1 font-display text-2xl text-foreground/80">{gap}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                      цель
                    </div>
                    <div className="mt-1 font-display text-2xl text-foreground/80">10</div>
                  </div>
                </div>
                <p className="mt-6 text-center font-display text-base italic text-foreground/80">
                  {gapCopy(gap, state.desired_state)}
                </p>
              </GlassCard>
            </div>

            <div className="mt-5 flex flex-col items-center gap-2 md:mt-8">
              <GlowButton onClick={handleNext} disabled={saving}>
                {saving ? "сохраняю…" : "Это честно"}
              </GlowButton>
              <p className="text-xs text-muted-foreground">+3 XP за честность</p>
            </div>
        </div>
      </JourneyScene>
    </FadeTransition>
  );
}
