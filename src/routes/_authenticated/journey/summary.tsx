import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { ShareDialog, handleNativeShare } from "@/components/eva/ShareDialog";
import { PartnerGiftBlock } from "@/components/partners/PartnerGiftBlock";
import { useJourneyStore } from "@/lib/journey-store";
import { completeJourney, createNextJourney, saveMicroAction } from "@/lib/journey.functions";
import { saveDiaryEntry } from "@/lib/diary.functions";
import { checkPremiumStatus } from "@/lib/premium.functions";
import { useAppConfig } from "@/lib/app-config-context";
import { pickMicroAction } from "@/lib/micro-actions";
import { initialJourneyState } from "@/lib/journey-types";
import { SPHERES, VARIANT_META, type SphereId } from "@/lib/journey-types";
import { getEntryStep } from "@/lib/sphere-journeys";
import { getPartnerForRoute } from "@/lib/partner-trigger";
import { motion, AnimatePresence } from "framer-motion";
import { Share2 } from "lucide-react";
import { useAddress } from "@/lib/use-address";
import { PremiumCTA } from "@/components/premium/PremiumCTA";
import { canShowCTA, markCTAShown } from "@/lib/cta-frequency";

export const Route = createFileRoute("/_authenticated/journey/summary")({
  component: SummaryScreen,
});

function useCountUp(target: number, duration = 1200, enabled = false) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (!enabled || target === 0) { setValue(target); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(ease * target));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, enabled]);
  return value;
}

function RewardParticles({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 14 }, (_, i) => {
    const angle = (i / 14) * 2 * Math.PI + (i % 3) * 0.4;
    const dist = 50 + (i % 4) * 18;
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist - 40,
      color: i % 3 === 0 ? "oklch(0.74 0.13 70)" : i % 3 === 1 ? "oklch(0.85 0.15 90)" : "oklch(0.7 0.08 280)",
      size: 4 + (i % 3) * 2,
      delay: (i % 5) * 0.06,
    };
  });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: p.size, height: p.size,
            borderRadius: "50%",
            background: p.color,
            "--dx": `${p.dx}px`,
            "--dy": `${p.dy}px`,
            animationDelay: `${p.delay}s`,
            animation: "float-particle 1s ease-out forwards",
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

const HERO_SRC = "/assets/eva/step-13-final-path.png";
const HERO_ALT =
  "Ева рядом с картой пройденного пути, блокнотом, свечой и светящимися камнями";

function getRoleNote(roles: string[]): string | null {
  if (roles.includes("В декрете") || roles.includes("Забочусь о семье"))
    return "Заботиться о других и не забывать о себе — это тоже работа.";
  if (roles.includes("Работаю"))
    return "Среди дел и дедлайнов найти минуту для себя — это уже немало.";
  if (roles.includes("Учусь"))
    return "Внутренняя работа не менее важна, чем любой экзамен.";
  if (roles.includes("Ищу себя"))
    return "Искать — значит уже двигаться. Это уже путь.";
  if (roles.includes("Сейчас отдыхаю / восстанавливаюсь"))
    return "Восстановление требует смелости. Ты здесь — и это важно.";
  return null;
}

function DailyLimitCard() {
  const navigate = useNavigate();
  const { isPremiumApp } = useAppConfig();
  return (
    <div className="flex flex-col items-center justify-between p-4 text-center h-full">
      <p className="text-[9px] uppercase tracking-[0.3em] text-primary/60">На сегодня всё</p>
      <div>
        <p className="mt-1 text-2xl">🌙</p>
        <p className="mt-1 font-display text-sm leading-snug text-foreground/80">
          Путь из 3 сфер пройден
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground leading-relaxed">
          Возвращайся завтра — Ева будет ждать
        </p>
      </div>
      <div className="w-full space-y-2 mt-2">
        {isPremiumApp && (
          <button
            type="button"
            onClick={() => navigate({ to: "/premium/paywall" as never })}
            className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2 text-xs font-semibold text-white shadow-md shadow-amber-400/30 transition hover:from-amber-500 hover:to-amber-600"
          >
            ✨ Подключить EVA+
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate({ to: "/home" as never })}
          className="w-full rounded-xl border border-border/60 bg-background/30 py-2 text-xs text-muted-foreground transition hover:text-foreground"
        >
          Вернуться завтра
        </button>
      </div>
    </div>
  );
}

function SummaryScreen() {
  const a = useAddress();
  const { state, journeyId, reset } = useJourneyStore();
  const navigate = useNavigate();
  const complete = useServerFn(completeJourney);
  const fetchPremium = useServerFn(checkPremiumStatus);

  const [completed, setCompleted] = useState(false);
  const [totals, setTotals] = useState<{
    xp_total: number;
    coins_total: number;
    xp_awarded: number;
    coins_awarded: number;
    next_sphere_id: string | null;
  } | null>(null);
  const ranRef = useRef(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showSummaryCTA, setShowSummaryCTA] = useState(false);
  const [continuing, setContinuing] = useState(false);
  const [particlesActive, setParticlesActive] = useState(false);
  const createNext = useServerFn(createNextJourney);
  const saveDiary = useServerFn(saveDiaryEntry);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.is_anonymous) setIsAnonymous(true);
    });
    fetchPremium()
      .then(({ isPremium: p }) => {
        setIsPremium(p);
        if (!p && canShowCTA("summary", 3)) {
          setShowSummaryCTA(true);
          markCTAShown("summary");
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
          next_sphere_id: res.next_sphere_id ?? null,
        });
        setTimeout(() => setParticlesActive(true), 1400);
        setTimeout(() => setParticlesActive(false), 2600);
        // Save diary entry (fire-and-forget, premium gate checked server-side)
        if (journeyId) {
          saveDiary({
            data: {
              journey_id: journeyId,
              sphere_id: state.priority_sphere ?? state.selected_spheres?.[0] ?? "growth",
              resistance_before: state.resistance_score_before ?? 5,
              resistance_after: state.resistance_score_after ?? 5,
              goal_text: state.goal_text ?? undefined,
            },
          }).catch(() => {});
        }
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

  // Partner gift block: baseline = ease-score equivalent of resistance_before
  const sphereId = (state.priority_sphere || state.selected_spheres[0] || "health") as SphereId;
  const baselineScore = state.sphere_scores[sphereId] ?? 5;
  // growth: для non-skipped путей — снижение сопротивления = рост; для skipped — 0
  const growthScore = state.deep_work_skipped ? 0 : Math.max(0, before - after);
  const partners = journeyId
    ? getPartnerForRoute({
        sphere_id: sphereId,
        baseline_score: baselineScore,
        current_score: baselineScore + growthScore,
        has_children_mention: false,
      })
    : [];
  const [partnerSkipped, setPartnerSkipped] = useState(false);

  const xpCount = useCountUp(totals?.xp_awarded ?? 0, 1200, !!totals);
  const coinsCount = useCountUp(totals?.coins_awarded ?? 0, 1000, !!totals);

  const microActionText = pickMicroAction(state.priority_sphere ?? state.selected_spheres[0] ?? "growth");
  const [microAccepted, setMicroAccepted] = useState(false);
  const [microSaving, setMicroSaving] = useState(false);
  const doSaveMicro = useServerFn(saveMicroAction);

  const handleAcceptMicro = async () => {
    setMicroSaving(true);
    await doSaveMicro({ data: { text: microActionText } }).catch(() => {});
    setMicroAccepted(true);
    setMicroSaving(false);
  };

  const handleNewJourney = async () => {
    if (totals?.next_sphere_id) {
      // Create the next journey on the server with the correct sphere context,
      // then update the store directly — avoids the race condition where
      // JourneyLayout's getActiveJourney would overwrite store state.
      setContinuing(true);
      try {
        const sphereId = totals.next_sphere_id as SphereId;
        const scores  = (state.sphere_scores ?? {}) as Record<string, number>;
        const sphereIds = Array.isArray(state.selected_spheres) ? (state.selected_spheres as string[]) : [];
        const roles = state.user_roles ?? [];
        const fullState = {
          ...initialJourneyState,
          priority_sphere: sphereId,
          selected_spheres: sphereIds as SphereId[],
          sphere_scores: scores,
          user_roles: roles,
        } as JourneyState;
        const entryStep = getEntryStep(sphereId, fullState);
        const { id: newId } = await createNext({
          data: { priority_sphere: sphereId, selected_spheres: sphereIds, sphere_scores: scores, user_roles: roles, current_step: entryStep },
        });
        // setJourney sets loaded=true so JourneyLayout won't refetch
        useJourneyStore.getState().setJourney(newId, fullState, entryStep);
        navigate({ to: `/journey/${entryStep}` as never });
      } catch (e) {
        console.error("[summary] createNextJourney failed", e);
      } finally {
        setContinuing(false);
      }
    } else {
      // All queued spheres done — let user pick new ones
      reset();
      navigate({ to: "/journey/spheres" as never });
    }
  };

  return (
    <FadeTransition k="summary">
      <JourneyScene current={{ src: HERO_SRC, alt: HERO_ALT }} sticky>
        <div className="text-center md:text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Путь пройден
          </p>
          <h1 className="mt-2 font-display text-3xl text-glow md:mt-4 md:text-5xl">
            {a.vy ? "Вы сделали это." : "Ты сделала это."}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:mx-0 mx-auto">
            {a.vy ? "Один маленький виток внутренней работы. Это не магия. Это вы услышали себя." : "Один маленький виток внутренней работы. Это не магия. Это ты услышала себя."}
          </p>
          {(() => {
            const note = getRoleNote(state.user_roles ?? []);
            return note ? (
              <p className="mt-2 max-w-md text-sm italic leading-relaxed text-muted-foreground/60 md:mx-0 mx-auto">
                {note}
              </p>
            ) : null;
          })()}
        </div>

        {/* ── XP + Монеты ── */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="relative">
            <RewardParticles active={particlesActive} />
            <motion.div
              animate={particlesActive ? { scale: [1, 1.06, 1], boxShadow: ["0 0 0px transparent", "0 0 28px oklch(0.74 0.13 70/0.5)", "0 0 0px transparent"] } : {}}
              transition={{ duration: 0.6 }}
              className="rounded-2xl"
            >
              <GlassCard className="p-5 text-center" selected>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">XP за путь</p>
                <p className="mt-2 font-display text-4xl text-glow text-primary">+{xpCount}</p>
                {totals && <p className="mt-1 text-[10px] text-muted-foreground">всего: {totals.xp_total}</p>}
              </GlassCard>
            </motion.div>
          </div>
          <div className="relative">
            <RewardParticles active={particlesActive} />
            <motion.div
              animate={particlesActive ? { scale: [1, 1.06, 1], boxShadow: ["0 0 0px transparent", "0 0 28px oklch(0.85 0.15 90/0.4)", "0 0 0px transparent"] } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-2xl"
            >
              <GlassCard className="p-5 text-center" selected>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Монеты</p>
                <p className="mt-2 font-display text-4xl text-accent">+{coinsCount}</p>
                {totals && <p className="mt-1 text-[10px] text-muted-foreground">всего: {totals.coins_total}</p>}
              </GlassCard>
            </motion.div>
          </div>
        </div>

        {/* Подсказки при первом путешествии */}
        {totals && totals.xp_total === totals.xp_awarded && (
          <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-center">
            <p className="text-xs leading-relaxed text-foreground/70">
              <span className="font-medium text-primary">XP</span> — опыт, который повышает уровень и открывает новые практики.{" "}
              <span className="font-medium text-accent">Монеты</span> — открывают расширенные упражнения в каталоге.
            </p>
          </div>
        )}

        {/* ── Саммари ── */}
        <GlassCard className="mt-3 overflow-hidden p-0">

          {/* Саммари таблица */}
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-border/40">
                <td className="w-28 px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground align-top pt-3.5">Сфера</td>
                <td className="px-4 py-3 font-display text-base">{sphere}</td>
              </tr>
              {state.journey_variant && VARIANT_META[state.journey_variant] && (
                <tr className="border-b border-border/40">
                  <td className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground align-top pt-3.5">Путь</td>
                  <td className="px-4 py-3 text-sm">{VARIANT_META[state.journey_variant].icon} {VARIANT_META[state.journey_variant].label}</td>
                </tr>
              )}
              {state.desired_goal && (
                <tr className="border-b border-border/40">
                  <td className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground align-top pt-3.5">Цель</td>
                  <td className="px-4 py-3 font-display text-base italic">«{state.desired_goal}»</td>
                </tr>
              )}
              {state.desired_state && (
                <tr className="border-b border-border/40">
                  <td className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground align-top pt-3.5">Состояние</td>
                  <td className="px-4 py-3 font-display text-base">{state.desired_state}</td>
                </tr>
              )}
              {!state.deep_work_skipped && state.resistance_score_before > 0 && (state.journey_variant === "deep" || state.journey_variant === "somatic" || !state.journey_variant) && (
                <tr className="border-b border-border/40">
                  <td className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground align-top pt-3.5">Сопротивление</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-3 font-display text-base">
                      <span className="text-muted-foreground">{before}</span>
                      <span className="text-primary">→</span>
                      <span>{after}</span>
                      <span className={delta > 0 ? "text-primary text-glow" : delta < 0 ? "text-accent" : "text-muted-foreground"}>
                        {delta > 0 ? `−${delta}` : delta < 0 ? `+${-delta}` : "0"}
                      </span>
                    </span>
                  </td>
                </tr>
              )}
              {state.journey_variant === "narrative" && state.narrative_word && (
                <tr className="border-b border-border/40">
                  <td className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground align-top pt-3.5">Слово</td>
                  <td className="px-4 py-3 font-display text-base italic">«{state.narrative_word}»</td>
                </tr>
              )}
              {state.journey_variant === "gratitude" && state.gratitude_items?.[0] && (
                <tr className="border-b border-border/40">
                  <td className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground align-top pt-3.5">Ресурс</td>
                  <td className="px-4 py-3 text-sm">{state.gratitude_items[0]}</td>
                </tr>
              )}
              {state.journey_variant === "polarity" && state.polarity_realistic && (
                <tr className="border-b border-border/40">
                  <td className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground align-top pt-3.5">Реально</td>
                  <td className="px-4 py-3 text-sm">{state.polarity_realistic}</td>
                </tr>
              )}
              {state.selected_practice_id && !state.practice_skipped && (
                <tr>
                  <td className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground align-top pt-3.5">Практика</td>
                  <td className="px-4 py-3">
                    <p className="font-display text-base text-foreground">{state.selected_practice_name ?? "Практика завершена"}</p>
                    <p className="mt-0.5 text-xs text-primary/80">+5 XP · +2 монеты</p>
                  </td>
                </tr>
              )}
              {state.practice_skipped && (
                <tr>
                  <td className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground align-top pt-3.5">Практика</td>
                  <td className="px-4 py-3 text-sm italic text-muted-foreground">Пропущена</td>
                </tr>
              )}
              {(state as never as { first_step?: string }).first_step && (
                <tr>
                  <td className="px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground align-top pt-3.5">Первый шаг</td>
                  <td className="px-4 py-3 font-display text-base">{(state as never as { first_step: string }).first_step}</td>
                </tr>
              )}
            </tbody>
          </table>
        </GlassCard>

        {/* ── Premium CTA (summary) ── */}
        {showSummaryCTA && (
          <PremiumCTA format="c" context="summary" className="mt-5" />
        )}

        {/* ── Шаг в реальную жизнь + Продолжить путешествие — в один ряд ── */}
        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 grid grid-cols-2 gap-3"
          >
            {/* Шаг в реальную жизнь */}
            <GlassCard className="flex flex-col p-4" selected>
              <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                {microAccepted ? "✓ Принято" : "✨ Шаг в жизнь"}
              </p>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-foreground">
                {microActionText}
              </p>
              {!microAccepted ? (
                <button
                  type="button"
                  onClick={handleAcceptMicro}
                  disabled={microSaving}
                  className="mt-3 w-full rounded-xl bg-amber-400/80 py-2 text-xs font-medium text-amber-900 transition hover:bg-amber-400 disabled:opacity-50"
                >
                  {microSaving ? "…" : "Беру на себя"}
                </button>
              ) : (
                <p className="mt-2 text-[10px] text-primary/60 italic">Ева напомнит через 24ч</p>
              )}
            </GlassCard>

            {/* Следующая сфера / Продолжить / Дневной лимит */}
            <GlassCard className="flex flex-col items-center justify-between p-4 text-center" selected>
              {totals ? (
                // Daily limit reached for free users when all spheres done
                !isPremium && !totals.next_sphere_id ? (
                  <DailyLimitCard />
                ) : (
                  <>
                    {totals.next_sphere_id ? (
                      <>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-primary/60">Следующий путь</p>
                        <p className="mt-1.5 font-display text-lg text-glow leading-tight">
                          {SPHERES.find((s) => s.id === totals.next_sphere_id)?.label ?? totals.next_sphere_id}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-primary/60">Все три пути</p>
                        <p className="mt-1.5 font-display text-xl text-glow">✨</p>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={handleNewJourney}
                      disabled={continuing}
                      className="mt-3 w-full rounded-xl bg-primary py-2 text-xs font-medium text-primary-foreground shadow-[0_4px_16px_oklch(0.74_0.13_70/0.3)] transition hover:opacity-90 disabled:opacity-50"
                    >
                      {continuing ? "…" : "Продолжить"}
                    </button>
                  </>
                )
              ) : (
                <p className="text-xs text-muted-foreground">Загрузка…</p>
              )}
            </GlassCard>
          </motion.div>
        )}

        {/* ── Зарегистрироваться (анонимные) ── */}
        {isAnonymous && (
          <div className="mt-5 rounded-2xl border border-amber-300/60 bg-amber-50/70 px-5 py-4">
            <p className="font-display text-base text-foreground">
              {a.vy ? "Сохраните свой прогресс" : "Сохрани свой прогресс"}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {a.vy
                ? "Вы прошли путь — не теряйте его. Зарегистрируйтесь, чтобы XP и монеты остались с вами."
                : "Ты прошла путь — не теряй его. Зарегистрируйся, чтобы XP и монеты остались с тобой."}
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/auth-invite" as never })}
              className="mt-3 w-full rounded-xl bg-amber-400/80 py-2.5 text-sm font-medium text-amber-900 transition hover:bg-amber-400"
            >
              Зарегистрироваться
            </button>
          </div>
        )}

        {/* ── Прогресс · В Мой мир · Поделиться ── */}
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => navigate({ to: "/profile" as never })}
            className="flex-1 inline-flex items-center justify-center rounded-full border border-primary/40 bg-primary/5 px-3 py-2.5 text-sm font-display text-primary/90 transition-all hover:bg-primary/10 hover:text-primary"
          >
            Прогресс
          </button>
          <button
            type="button"
            onClick={() => navigate({ to: "/home" as never })}
            className="flex-1 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/30 px-3 py-2.5 text-sm font-display text-foreground/70 transition-all hover:bg-background/60 hover:text-foreground"
          >
            В Мой мир
          </button>
          <button
            type="button"
            onClick={() => handleNativeShare(false, () => setShareOpen(true))}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border border-border/60 bg-background/30 px-3 py-2.5 text-sm font-display text-foreground/90 transition-all hover:bg-background/60 hover:border-primary/40 hover:text-foreground"
          >
            <Share2 className="h-3.5 w-3.5" />
            Поделиться
          </button>
        </div>

        {/* ── Дар пути (всегда открыт, заголовок внутри компонента) ── */}
        {journeyId && partners.length > 0 && !partnerSkipped && (
          <div className="mt-5 border-t border-border/30 pt-4">
            <PartnerGiftBlock
              partners={partners}
              sphereId={sphereId}
              journeyId={journeyId}
              coinsBalance={totals?.coins_total ?? state.coins ?? 0}
              onSkip={() => setPartnerSkipped(true)}
            />
          </div>
        )}
      </JourneyScene>
      <ShareDialog open={shareOpen} onOpenChange={setShareOpen} />
    </FadeTransition>
  );
}
