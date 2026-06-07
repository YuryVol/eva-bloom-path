import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { ShareDialog, handleNativeShare } from "@/components/eva/ShareDialog";
import { useJourneyStore } from "@/lib/journey-store";
import { completeJourney } from "@/lib/journey.functions";
import { SPHERES } from "@/lib/journey-types";
import { Share2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/journey/summary")({
  component: SummaryScreen,
});

const HERO_SRC = "/assets/eva/step-13-final-path.png";
const HERO_ALT =
  "Ева рядом с картой пройденного пути, блокнотом, свечой и светящимися камнями";

function SummaryScreen() {
  const { state, journeyId, reset } = useJourneyStore();
  const navigate = useNavigate();
  const complete = useServerFn(completeJourney);

  const [completed, setCompleted] = useState(false);
  const [totals, setTotals] = useState<{
    xp_total: number;
    coins_total: number;
    xp_awarded: number;
    coins_awarded: number;
  } | null>(null);
  const ranRef = useRef(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (ranRef.current || !journeyId || completed) return;
    ranRef.current = true;
    complete({
      data: {
        id: journeyId,
        state: state as never,
      },
    })
      .then((res) => {
        setCompleted(true);
        setTotals({
          xp_total: res.xp_total,
          coins_total: res.coins_total,
          xp_awarded: res.xp_awarded,
          coins_awarded: res.coins_awarded,
        });
      })
      .catch(() => setCompleted(true));
  }, [journeyId, state, complete, completed]);


  const sphere =
    SPHERES.find((s) => s.id === state.priority_sphere)?.label ||
    state.priority_sphere ||
    "—";
  const before = state.resistance_score_before ?? 0;
  const after = state.resistance_score_after ?? 0;
  const delta = before - after;

  const handleNewJourney = () => {
    reset();
    navigate({ to: "/home" as never });
  };

  return (
    <FadeTransition k="summary">
      <JourneyScene current={{ src: HERO_SRC, alt: HERO_ALT }} sticky>
        <div className="text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Путь пройден
          </p>
          <h1 className="mt-2 font-display text-3xl text-glow md:mt-4 md:text-5xl">
            Ты сделала это.
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:mx-0 mx-auto">
            Один маленький виток внутренней работы. Это не магия — это ты,
            услышавшая себя.
          </p>
        </div>

        <div className="mt-6 md:mt-8 grid grid-cols-2 gap-3">
          <GlassCard className="text-center p-5" selected>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              XP за путь
            </p>
            <p className="mt-2 font-display text-4xl text-glow text-primary">
              +{totals?.xp_awarded ?? 0}
            </p>
            {totals && (
              <p className="mt-1 text-[10px] text-muted-foreground">
                всего: {totals.xp_total}
              </p>
            )}
          </GlassCard>
          <GlassCard className="text-center p-5" selected>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Монеты
            </p>
            <p className="mt-2 font-display text-4xl text-accent">
              +{totals?.coins_awarded ?? 0}
            </p>
            {totals && (
              <p className="mt-1 text-[10px] text-muted-foreground">
                всего: {totals.coins_total}
              </p>
            )}
          </GlassCard>
        </div>

        <div className="mt-6 space-y-3">
          <GlassCard className="p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Сфера
            </p>
            <p className="mt-2 font-display text-lg">{sphere}</p>
          </GlassCard>

          <GlassCard className="p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Цель
            </p>
            <p className="mt-2 font-display text-lg italic">
              «{state.desired_goal || "—"}»
            </p>
          </GlassCard>

          {state.desired_state && (
            <GlassCard className="p-5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Желаемое состояние
              </p>
              <p className="mt-2 font-display text-lg">{state.desired_state}</p>
            </GlassCard>
          )}

          <GlassCard className="p-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Сопротивление
            </p>
            <div className="mt-2 flex items-center justify-between font-display text-lg">
              <span className="text-muted-foreground">{before}</span>
              <span className="text-2xl text-primary">→</span>
              <span>{after}</span>
              <span
                className={
                  delta > 0
                    ? "text-primary text-glow"
                    : delta < 0
                      ? "text-accent"
                      : "text-muted-foreground"
                }
              >
                {delta > 0 ? `−${delta}` : delta < 0 ? `+${-delta}` : "0"}
              </span>
            </div>
          </GlassCard>

          {(state as never as { first_step?: string }).first_step && (
            <GlassCard className="p-5 border-primary/40">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Твой первый шаг
              </p>
              <p className="mt-2 font-display text-lg text-foreground">
                {(state as never as { first_step: string }).first_step}
              </p>
            </GlassCard>
          )}
        </div>

        <div className="mt-8 md:mt-10 flex flex-col items-center gap-3">
          <GlowButton onClick={handleNewJourney}>Начать новый путь</GlowButton>
          <button
            type="button"
            onClick={() => handleNativeShare(false, () => setShareOpen(true))}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/30 px-6 py-2.5 text-sm font-display text-foreground/90 transition-all hover:bg-background/60 hover:border-primary/40 hover:text-foreground"
          >
            <Share2 className="h-4 w-4" />
            Поделиться с другом
          </button>
          <button
            onClick={() => navigate({ to: "/home" as never })}
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
          >
            на главную
          </button>
        </div>
      </JourneyScene>
      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} />
    </FadeTransition>
  );
}
