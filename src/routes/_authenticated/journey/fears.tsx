import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { JourneyScene, type SceneVisual } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { useAddress } from "@/lib/use-address";
import { type SphereId } from "@/lib/journey-types";
import { getNextStep } from "@/lib/sphere-journeys";

export const Route = createFileRoute("/_authenticated/journey/fears")({
  component: FearsScreen,
});

const UNIVERSAL_FEARS_SELF = [
  "Что не получится",
  "Что будет больно",
  "Что снова не хватит сил",
  "Что это не моё",
  "Что мои желания — это эгоизм",
  "Что это очередная попытка, которая ни к чему не приведёт",
];

const UNIVERSAL_FEARS_WORLD = [
  "Что осудят",
  "Что разочарую близких",
  "Что придётся менять слишком много",
  "Что окажусь одна",
  "Что если займусь собой — всё рухнет",
];

const UNIVERSAL_FEARS = [...UNIVERSAL_FEARS_SELF, ...UNIVERSAL_FEARS_WORLD];

const SPHERE_FEARS: Partial<Record<SphereId, string[]>> = {
  relationships: [
    "Что меня не услышат",
    "Что потеряю партнёра",
    "Что буду слишком уязвимой",
    "Что меня отвергнут",
  ],
  family: [
    "Что меня не услышат",
    "Что стану причиной конфликта",
    "Что ничего не изменится",
    "Что придётся взять на себя слишком много",
  ],
  career: [
    "Что я недостаточно хороша для этого",
    "Что потеряю стабильность",
    "Что это не принесёт денег",
    "Что слишком поздно менять",
  ],
  growth: [
    "Что не хватит дисциплины",
    "Что быстро брошу",
    "Что уже упустила время",
    "Что это не даст результата",
  ],
  finance: [
    "Что денег никогда не будет хватать",
    "Что я плохо распоряжаюсь деньгами",
    "Что это слишком сложно для меня",
    "Что я не заслуживаю большего",
  ],
  rest: [
    "Что буду чувствовать себя ленивой",
    "Что всё развалится без меня",
    "Что не умею отдыхать",
    "Что не заслужила",
  ],
  people: [
    "Что останусь одна",
    "Что меня отвергнут",
    "Что буду обузой",
    "Что не смогу поддерживать связи",
  ],
  health: [
    "Что снова не получится",
    "Что надо кардинально менять жизнь",
    "Что тело меня подводит",
    "Что слишком много всего нарушено",
  ],
};

const FEAR_VISUALS: Record<string, SceneVisual> = {
  default: {
    src: "/assets/eva/fears/Fears_default.png",
    alt: "Ева встречает страхи",
    objectPosition: "center 30%",
  },
  "Что не получится": {
    src: "/assets/eva/fears/Chto_ne_poluchitsya.png",
    alt: "Что не получится",
    objectPosition: "center 30%",
  },
  "Что осудят": {
    src: "/assets/eva/fears/Chto_osudyat.png",
    alt: "Что осудят",
    objectPosition: "center 30%",
  },
  "Что будет больно": {
    src: "/assets/eva/fears/Chto_budet_bolno.png",
    alt: "Что будет больно",
    objectPosition: "center 30%",
  },
  "Что разочарую близких": {
    src: "/assets/eva/fears/Chto_razocharuyu.png",
    alt: "Что разочарую близких",
    objectPosition: "center 30%",
  },
  "Что снова не хватит сил": {
    src: "/assets/eva/fears/Ne_hvatit_sil.png",
    alt: "Что не хватит сил",
    objectPosition: "center 30%",
  },
  "Что придётся менять слишком много": {
    src: "/assets/eva/fears/Pridetsya_menyat.png",
    alt: "Что придётся менять",
    objectPosition: "center 30%",
  },
  "Что окажусь одна": {
    src: "/assets/eva/fears/Ostanus_odin.png",
    alt: "Что окажусь одна",
    objectPosition: "center 30%",
  },
  "Что это не моё": {
    src: "/assets/eva/fears/Chto_ne_moe.png",
    alt: "Что это не моё",
    objectPosition: "center 30%",
  },
};

const MAX_PICK = 3;

function FearChip({
  f,
  active,
  disabled,
  onToggle,
  onHover,
  onLeave,
}: {
  f: string;
  active: boolean;
  disabled: boolean;
  onToggle: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      disabled={disabled}
      className={`rounded-2xl border px-4 py-3 text-left backdrop-blur-sm transition ${
        active
          ? "border-destructive/60 bg-destructive/10 text-foreground shadow-[0_6px_18px_-10px_oklch(0.65_0.16_30/0.5)]"
          : disabled
            ? "cursor-not-allowed border-border/40 bg-muted/40 text-muted-foreground/50"
            : "border-border bg-card text-foreground/90 hover:border-destructive/40"
      }`}
    >
      <span className="font-display text-base">{f}</span>
    </button>
  );
}

function FearGroup({
  label,
  fears,
  selected,
  onToggle,
  onHover,
  onLeave,
}: {
  label: string;
  fears: string[];
  selected: string[];
  onToggle: (f: string) => void;
  onHover: (f: string) => void;
  onLeave: () => void;
}) {
  if (fears.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </p>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
        {fears.map((f) => (
          <FearChip
            key={f}
            f={f}
            active={selected.includes(f)}
            disabled={!selected.includes(f) && selected.length >= MAX_PICK}
            onToggle={() => onToggle(f)}
            onHover={() => onHover(f)}
            onLeave={onLeave}
          />
        ))}
      </div>
    </div>
  );
}

function FearsScreen() {
  const a = useAddress();
  const { state, journeyId, pushStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const [selected, setSelected] = useState<string[]>(state.selected_fears || []);
  const [custom, setCustom] = useState("");
  const [saving, setSaving] = useState(false);
  const [hoveredFear, setHoveredFear] = useState<string | null>(null);

  const sphere = (state.priority_sphere || state.selected_spheres[0]) as SphereId | undefined;
  const sphereFears = sphere ? (SPHERE_FEARS[sphere] ?? []) : [];

  const { groupSelf, groupWorld } = useMemo(() => {
    const sphereSpecific = sphereFears.filter((f) => !UNIVERSAL_FEARS.includes(f));
    return {
      groupSelf: [...sphereSpecific, ...UNIVERSAL_FEARS_SELF],
      groupWorld: UNIVERSAL_FEARS_WORLD,
    };
  }, [sphere]);

  const allFearOptions = useMemo(() => [...groupSelf, ...groupWorld], [groupSelf, groupWorld]);

  const activeFearKey = useMemo(() => {
    if (hoveredFear && FEAR_VISUALS[hoveredFear]) return hoveredFear;
    for (let i = selected.length - 1; i >= 0; i--) {
      if (FEAR_VISUALS[selected[i]]) return selected[i];
    }
    return "default";
  }, [hoveredFear, selected]);

  const currentFearVisual = FEAR_VISUALS[activeFearKey] || FEAR_VISUALS.default;
  const allVisuals = Object.values(FEAR_VISUALS);

  const toggle = (f: string) => {
    setSelected((prev) => {
      if (prev.includes(f)) return prev.filter((x) => x !== f);
      if (prev.length >= MAX_PICK) return prev;
      return [...prev, f];
    });
  };

  const addCustom = () => {
    const v = custom.trim();
    if (!v) return;
    if (selected.includes(v) || selected.length >= MAX_PICK) return;
    setSelected((prev) => [...prev, v]);
    setCustom("");
  };

  const canNext = selected.length > 0 && !saving;

  const handleNext = async () => {
    if (!journeyId || !canNext) return;
    setSaving(true);
    const hasCustom = selected.some((f) => !UNIVERSAL_FEARS.includes(f) && !sphereFears.includes(f));
    const xpGain = hasCustom ? 6 : 3;
    const next = {
      ...state,
      selected_fears: selected,
      xp: (state.xp || 0) + xpGain,
    };
    patch({ selected_fears: selected, xp: next.xp });
    const nextStep = getNextStep(state.priority_sphere as SphereId, "fears", next);
    pushStep(nextStep);
    navigate({ to: `/journey/${nextStep}` as never });
    save({ data: { id: journeyId, state: next as never, current_step: nextStep } })
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  const customFears = selected.filter((f) => !allFearOptions.includes(f));

  return (
    <FadeTransition k="fears">
      <JourneyScene current={currentFearVisual} all={allVisuals}>
        <div className="text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Тени на пути
          </p>
          <h1 className="mt-4 font-display text-3xl text-glow md:text-4xl">
            Что встаёт между {a.toboj} и этим?
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:mx-0 mx-auto">
            {a.nazovi} до {MAX_PICK} страхов. Их сила слабеет, когда мы зовём их по имени.
          </p>
        </div>

        {/* Свой страх — сразу под описанием */}
        <div className="mt-5">
          <GlassCard>
            <label className="block text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Свой страх
            </label>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={custom}
                maxLength={120}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                placeholder="Назови своими словами…"
                className="flex-1 rounded-xl border border-border bg-background/60 px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={addCustom}
                disabled={!custom.trim() || selected.length >= MAX_PICK}
                className="rounded-xl border border-primary/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-foreground transition hover:bg-primary/10 disabled:opacity-40"
              >
                Добавить
              </button>
            </div>
            {customFears.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {customFears.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggle(f)}
                    className="rounded-full border border-destructive/50 bg-destructive/10 px-3 py-1 text-xs text-foreground hover:bg-destructive/20"
                  >
                    {f} ×
                  </button>
                ))}
              </div>
            )}
            <p className="mt-2 text-xs text-muted-foreground">+6 XP за свой страх</p>
          </GlassCard>
        </div>

        {/* Сетка страхов по категориям */}
        <div className="mt-5 space-y-5 pb-20">
          <FearGroup
            label="Про себя"
            fears={groupSelf}
            selected={selected}
            onToggle={toggle}
            onHover={setHoveredFear}
            onLeave={() => setHoveredFear(null)}
          />
          <FearGroup
            label="Про других и мир"
            fears={groupWorld}
            selected={selected}
            onToggle={toggle}
            onHover={setHoveredFear}
            onLeave={() => setHoveredFear(null)}
          />
        </div>

        {/* Sticky footer: счётчик + кнопка */}
        <div className="sticky bottom-0 -mx-1 flex items-center justify-between gap-4 bg-background/80 py-4 backdrop-blur-sm md:flex-row md:justify-between">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">
            выбрано {selected.length} / {MAX_PICK}
          </p>
          <GlowButton onClick={handleNext} disabled={!canNext}>
            {saving ? "сохраняю…" : "Я их вижу"}
          </GlowButton>
        </div>
      </JourneyScene>
    </FadeTransition>
  );
}
