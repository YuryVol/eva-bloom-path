import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney, getUserCoins, unlockPracticeWithCoins } from "@/lib/journey.functions";
import { getPracticesForSphere } from "@/lib/practice.functions";
import { useAddress } from "@/lib/use-address";
import type { Practice } from "@/types/practice";
import { checkPremiumStatus } from "@/lib/premium.functions";
import { PRACTICE_UNLOCK_COST, type PracticeType } from "@/lib/premium-gate";
import { PremiumBadge } from "@/components/premium/PremiumBadge";
import { PremiumGateSheet } from "@/components/premium/PremiumGateSheet";
import { useAppConfig } from "@/lib/app-config-context";
import { PremiumCTA } from "@/components/premium/PremiumCTA";

export const Route = createFileRoute("/_authenticated/journey/practice-select")({
  component: PracticeSelectScreen,
});

const TYPE_LABELS: Record<string, string> = {
  stabilization: "Заземление",
  relaxation: "Расслабление",
  harmonization: "Гармонизация",
};

const TYPE_ICONS: Record<string, string> = {
  stabilization: "🌱",
  relaxation: "🌊",
  harmonization: "✨",
};

const TYPE_COLORS: Record<string, string> = {
  stabilization: "border-emerald-300/40 bg-emerald-50/30",
  relaxation: "border-sky-300/40 bg-sky-50/30",
  harmonization: "border-violet-300/40 bg-violet-50/30",
};

function PracticeSelectScreen() {
  const a = useAddress();
  const { state, journeyId, setStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);
  const fetchPractices = useServerFn(getPracticesForSphere);
  const fetchPremium = useServerFn(checkPremiumStatus);
  const fetchCoins = useServerFn(getUserCoins);
  const doUnlock = useServerFn(unlockPracticeWithCoins);
  const { isPremiumApp } = useAppConfig();

  const [practices, setPractices] = useState<Practice[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isPremium, setIsPremium] = useState(false);
  const [coins, setCoins] = useState(0);
  const [unlockedThisJourney, setUnlockedThisJourney] = useState<Set<string>>(new Set());
  const [gateFeature, setGateFeature] = useState<"practice" | null>(null);
  const [unlocking, setUnlocking] = useState<string | null>(null);

  const sphere = state.priority_sphere || "rest";

  useEffect(() => {
    Promise.all([
      fetchPractices({ data: { sphere_id: sphere } }),
      fetchPremium(),
      fetchCoins(),
    ])
      .then(([pracs, premium, coinsData]) => {
        setPractices(pracs);
        setIsPremium(premium.isPremium);
        setCoins(coinsData.coins);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sphere]); // eslint-disable-line react-hooks/exhaustive-deps

  const isLocked = (p: Practice) => {
    if (!isPremiumApp) return false;
    if (isPremium) return false;
    if (p.type === "stabilization") return false;
    if (unlockedThisJourney.has(p.id)) return false;
    return true;
  };

  const handleUnlockWithCoins = async (p: Practice) => {
    const cost = PRACTICE_UNLOCK_COST[p.type as PracticeType];
    if (coins < cost) { setGateFeature("practice"); return; }
    setUnlocking(p.id);
    try {
      const result = await doUnlock({ data: { cost } });
      setCoins(result.coins);
      setUnlockedThisJourney((s) => new Set([...s, p.id]));
      setSelected(p.id);
    } catch {
      setGateFeature("practice");
    } finally {
      setUnlocking(null);
    }
  };

  const handleCardClick = (p: Practice) => {
    if (isLocked(p)) return; // locked — handled by button clicks
    setSelected(selected === p.id ? null : p.id);
  };

  const handleSkip = async () => {
    if (!journeyId) return;
    setSaving(true);
    const next = { ...state, selected_practice_id: null, selected_practice_key: null, selected_practice_name: null, practice_skipped: true };
    patch({ selected_practice_id: null, selected_practice_key: null, selected_practice_name: null, practice_skipped: true });
    setStep("reassess");
    try {
      await save({ data: { id: journeyId, state: next as never, current_step: "reassess" } });
      navigate({ to: "/journey/reassess" as never });
    } finally {
      setSaving(false);
    }
  };

  const handleSelect = async () => {
    if (!selected || !journeyId) return;
    setSaving(true);
    const selectedPractice = practices.find((p) => p.id === selected);
    const practiceKey = selectedPractice?.component_key ?? null;
    const practiceName = selectedPractice?.name ?? null;
    const next = { ...state, selected_practice_id: selected, selected_practice_key: practiceKey, selected_practice_name: practiceName, practice_skipped: false };
    patch({ selected_practice_id: selected, selected_practice_key: practiceKey, selected_practice_name: practiceName, practice_skipped: false });
    setStep("practice-run");
    try {
      await save({ data: { id: journeyId, state: next as never, current_step: "practice-run" } });
      navigate({ to: "/journey/practice-run" as never });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FadeTransition k="practice-select">
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Практика</p>
          <h1 className="mt-2 font-display text-3xl text-glow md:text-4xl">
            {a.vy ? "Выберите практику" : "Выбери практику"}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            {a.vy
              ? "Вы хорошо поработали. Выберите практику для интеграции — или пропустите."
              : "Ты хорошо поработала. Выбери практику для интеграции — или пропусти."}
          </p>
          {!isPremium && (
            <p className="mt-1.5 text-xs text-muted-foreground/60">
              Монеты: <span className="text-amber-600 font-medium">{coins} 🪙</span>
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {loading && (
            <p className="text-center text-sm text-muted-foreground">Загрузка практик…</p>
          )}
          {!loading && practices.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              Практики не найдены. Пропусти этот шаг.
            </p>
          )}
          {practices.map((p) => {
            const locked = isLocked(p);
            const cost = PRACTICE_UNLOCK_COST[p.type as PracticeType];
            const canAfford = coins >= cost;
            return (
              <motion.div
                key={p.id}
                whileTap={locked ? {} : { scale: 0.98 }}
                className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                  locked
                    ? "border-border/30 bg-muted/20 opacity-70"
                    : selected === p.id
                      ? "border-primary/60 bg-primary/10 shadow-md cursor-pointer"
                      : `${TYPE_COLORS[p.type]} hover:border-border cursor-pointer`
                }`}
                onClick={() => !locked && handleCardClick(p)}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-xl leading-none">{TYPE_ICONS[p.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {TYPE_LABELS[p.type]}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">{p.duration_min} мин</span>
                      {locked && <PremiumBadge onClick={() => setGateFeature("practice")} />}
                    </div>
                    <p className="mt-1 font-medium text-foreground">{p.name}</p>
                    <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{p.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground/70">
                      +{p.xp_reward} XP{p.coins_reward > 0 ? ` · +${p.coins_reward} монет` : ""}
                    </p>

                    {/* Unlock with coins or premium gate */}
                    {locked && cost > 0 && (
                      <div className="mt-3 flex gap-2">
                        {canAfford ? (
                          <button
                            type="button"
                            disabled={unlocking === p.id}
                            onClick={(e) => { e.stopPropagation(); handleUnlockWithCoins(p); }}
                            className="rounded-xl bg-amber-50 border border-amber-300/50 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100"
                          >
                            {unlocking === p.id ? "…" : `Разблокировать за ${cost} 🪙`}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setGateFeature("practice"); }}
                            className="rounded-xl bg-muted/40 border border-border/30 px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
                          >
                            Нужно {cost} 🪙 · Попробовать EVA+
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  {selected === p.id && (
                    <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-primary flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 pb-6">
          <GlowButton onClick={handleSelect} disabled={!selected || saving}>
            {saving ? "сохраняю…" : "Начать практику"}
          </GlowButton>
          <button
            type="button"
            onClick={handleSkip}
            disabled={saving}
            className="text-xs tracking-wide text-muted-foreground/60 underline-offset-2 transition-colors hover:text-muted-foreground hover:underline disabled:opacity-40"
          >
            Пропустить
          </button>
        </div>
      </div>

      {/* CTA под заблокированными практиками */}
      {!isPremium && practices.some((p) => isLocked(p)) && (
        <div className="mt-2 text-center">
          <PremiumCTA format="a" context="practice" />
        </div>
      )}

      <PremiumGateSheet
        open={gateFeature !== null}
        feature="practice"
        onClose={() => setGateFeature(null)}
      />
    </FadeTransition>
  );
}
