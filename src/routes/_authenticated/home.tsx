import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { checkPremiumStatus } from "@/lib/premium.functions";
import { EvaWorldPremium, WorldStateChangedModal, type WorldState } from "@/components/eva-world/EvaWorldPremium";
import { BOT_USERNAME } from "@/lib/telegram";
import { generateTgToken } from "@/lib/bot.functions";
import { GlassCard } from "@/components/eva/GlassCard";
import { GlowButton } from "@/components/eva/GlowButton";
import { AmbientBackground } from "@/components/eva/AmbientBackground";
import { useJourneyStore } from "@/lib/journey-store";
import { getUserStats, dismissFirstStep, submitCheckin } from "@/lib/journey.functions";
import { SPHERES } from "@/lib/journey-types";
import { getEntryStep } from "@/lib/sphere-journeys";
import { getNextMilestone, getMilestoneProgress } from "@/lib/milestones";
import { useAddress } from "@/lib/use-address";
import { getAppConfig } from "@/lib/app-config";
import { PremiumCTA } from "@/components/premium/PremiumCTA";
import { pickPracticeOfDay, type CatalogPractice } from "@/lib/practices-catalog";
import { Slider010 } from "@/components/eva/Slider010";
import { getTodayKey } from "@/lib/practices-local";
function toGenitive(name: string): string {
  const n = name.trim();
  const l = n.toLowerCase();
  if (l.endsWith("ия")) return n.slice(0, -1) + "и";          // Мария→Марии, Юлия→Юлии
  if (l.endsWith("ья")) return n.slice(0, -1) + "и";          // Дарья→Дарьи
  if (l.endsWith("я"))  return n.slice(0, -1) + "и";          // Катя→Кати, Таня→Тани
  if (/[гкхжшчщ]а$/u.test(l)) return n.slice(0, -1) + "и";   // Ольга→Ольги, Наташа→Наташи
  if (l.endsWith("а"))  return n.slice(0, -1) + "ы";          // Анна→Анны, Светлана→Светланы
  if (l.endsWith("й"))  return n.slice(0, -1) + "я";          // Андрей→Андрея
  if (l.endsWith("ь"))  return n.slice(0, -1) + "я";          // Игорь→Игоря
  if (/[бвгджзклмнпрстфхцчшщ]$/u.test(l)) return n + "а";    // Иван→Ивана, Максим→Максима
  return n;
}

export const Route = createFileRoute("/_authenticated/home")({
  component: HomeScreen,
  head: () => ({ meta: [{ title: "Мой мир — ЕВА" }] }),
});

// ─── World state ──────────────────────────────────────────────────────────────

type WorldState = "healthy" | "wilting" | "dormant" | "winter";

function getWorldState(
  lastCompletedAt: string | null,
  lastCheckinAt: string | null = null,
): WorldState {
  const candidates = [lastCompletedAt, lastCheckinAt].filter(Boolean) as string[];
  if (!candidates.length) return "winter";
  const mostRecent = candidates.reduce((a, b) =>
    new Date(a) > new Date(b) ? a : b,
  );
  const days =
    (Date.now() - new Date(mostRecent).getTime()) / (1000 * 60 * 60 * 24);
  if (days <= 2) return "healthy";
  if (days <= 4) return "wilting";
  if (days <= 7) return "dormant";
  return "winter";
}

function getWorldMeta(vy: boolean): Record<
  WorldState,
  { emoji: string; label: string; message: string | null; bg: string; glow: string }
> {
  return {
    healthy: {
      emoji: "🌸",
      label: "Цветёт",
      message: null,
      bg: "bg-amber-50",
      glow: "oklch(0.95 0.08 85 / 0.6)",
    },
    wilting: {
      emoji: "🌿",
      label: "Держится",
      message: vy ? "Ваш мир немного скучает по вам." : "Твой мир немного скучает по тебе.",
      bg: "bg-green-50/80",
      glow: "oklch(0.92 0.07 145 / 0.5)",
    },
    dormant: {
      emoji: "🌫️",
      label: "Дремлет",
      message: "Здесь стало тише. Ева ждёт.",
      bg: "bg-slate-100",
      glow: "oklch(0.90 0.02 230 / 0.4)",
    },
    winter: {
      emoji: "❄️",
      label: "Зима",
      message: vy ? "Ева хранит ваше место. Возвращайтесь." : "Ева хранит твоё место. Возвращайся.",
      bg: "bg-blue-50/70",
      glow: "oklch(0.93 0.04 220 / 0.5)",
    },
  };
}

// ─── Streak ───────────────────────────────────────────────────────────────────

function computeStreak(
  history: Array<{ completed_at: string | null; status: string }>,
): number {
  const completedDates = history
    .filter((h) => h.status === "completed" && h.completed_at)
    .map((h) => {
      const d = new Date(h.completed_at!);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    });
  if (!completedDates.length) return 0;

  const uniqueDates = [...new Set(completedDates)];
  let streak = 0;
  const now = new Date();

  for (let i = 0; i <= 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    if (uniqueDates.includes(key)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

// ─── Level ────────────────────────────────────────────────────────────────────

function getLevel(xp: number): number {
  return Math.min(10, Math.floor(xp / 150) + 1);
}

function getLevelProgress(xp: number): number {
  const level = getLevel(xp);
  if (level >= 10) return 100;
  const levelStart = (level - 1) * 150;
  const levelEnd = level * 150;
  return Math.round(((xp - levelStart) / (levelEnd - levelStart)) * 100);
}

// ─── World visual placeholder ─────────────────────────────────────────────────

function WorldVisual({ state, sparkle = false }: { state: WorldState; sparkle?: boolean }) {
  const meta = getWorldMeta(false)[state];
  return (
    <motion.div
      key={state}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-full w-full overflow-hidden rounded-3xl border border-border/40"
      style={{ boxShadow: `0 0 50px 8px ${meta.glow}` }}
    >
      <img
        src={`/assets/eva/world-${state}.png`}
        alt="Мир Евы"
        className="h-full w-full object-cover"
      />
      {sparkle && (
        <div className="pointer-events-none absolute inset-0 animate-pulse"
          style={{ background: "radial-gradient(ellipse at 50% 60%, oklch(0.9 0.12 80 / 0.15) 0%, transparent 70%)" }}
        />
      )}
      <img
        src="/assets/eva/eva-close.png"
        alt=""
        className="pointer-events-none absolute bottom-2 right-2 w-20 opacity-80 drop-shadow-lg md:w-24"
      />
      <span className="absolute bottom-3 left-4 rounded-full bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.25em] text-white/80 backdrop-blur-sm">
        {sparkle ? `${meta.label} ✨` : meta.label}
      </span>
    </motion.div>
  );
}

// ─── Milestone progress ───────────────────────────────────────────────────────

function MilestoneProgress({
  journeyCount,
  practiceStreak,
  xp,
}: {
  journeyCount: number;
  practiceStreak: number;
  xp: number;
}) {
  const next = getNextMilestone(journeyCount, practiceStreak, xp);
  if (!next) return null;

  const { current, total, remaining, unit } = getMilestoneProgress(next, journeyCount, practiceStreak, xp);
  const pct = Math.min(100, Math.round((current / total) * 100));

  return (
    <div className="mb-2.5 rounded-2xl border border-border/40 bg-card/50 px-4 py-3">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Следующее открытие</p>
        <p className="text-[10px] text-muted-foreground/70">ещё {remaining} {unit}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1 rounded-full bg-muted/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary/50 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-[10px] text-foreground/70 shrink-0">{next.rewardIcon} {next.rewardLabel}</p>
      </div>
    </div>
  );
}

// ─── Check-in sparkline ───────────────────────────────────────────────────────

function CheckinSparkline({ history }: { history: Array<{ s: number; t: string }> }) {
  if (history.length < 3) return null;
  const pts = history.slice(-7);
  const W = 200;
  const H = 40;
  const pad = 6;
  const xs = pts.map((_, i) => pad + (i / Math.max(pts.length - 1, 1)) * (W - pad * 2));
  const ys = pts.map((p) => H - pad - ((p.s / 10) * (H - pad * 2)));

  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  const prev = pts.length >= 2 ? pts[pts.length - 2] : null;
  const trend = prev ? (last.s > prev.s ? "↑" : last.s < prev.s ? "↓" : "→") : "";
  const trendColor = trend === "↑" ? "text-green-600" : trend === "↓" ? "text-rose-400" : "text-muted-foreground";

  return (
    <div className="mb-2.5 rounded-2xl border border-border/40 bg-card/50 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Состояние · 7 дней</p>
        <span className={`text-xs font-medium ${trendColor}`}>
          {last.s}/10 {trend}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-10" preserveAspectRatio="none">
        <path d={d} fill="none" stroke="oklch(0.6 0.12 300 / 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={xs[i]} cy={ys[i]} r="2.5" fill="oklch(0.6 0.12 300 / 0.8)" />
        ))}
      </svg>
    </div>
  );
}

// ─── First-step reminder card ─────────────────────────────────────────────────

function FirstStepCard({
  text,
  vy,
  onDone,
  onSkip,
  disabled,
}: {
  text: string;
  vy: boolean;
  onDone: () => void;
  onSkip: () => void;
  disabled: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-2.5 overflow-hidden rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3"
    >
      <p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-primary/70">
        {vy ? "Ваш первый шаг" : "Твой первый шаг"}
      </p>
      <p className="mb-3 text-sm leading-snug text-foreground/85">
        {text}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDone}
          disabled={disabled}
          className="flex-1 rounded-xl bg-primary/15 py-2 text-xs font-medium text-primary transition hover:bg-primary/25 disabled:opacity-40"
        >
          {vy ? "Сделали ✓" : "Сделала ✓"}
        </button>
        <button
          type="button"
          onClick={onSkip}
          disabled={disabled}
          className="flex-1 rounded-xl border border-border/50 bg-card/40 py-2 text-xs text-muted-foreground transition hover:bg-card/70 disabled:opacity-40"
        >
          Ещё нет
        </button>
      </div>
    </motion.div>
  );
}

// ─── Check-in bottom sheet ────────────────────────────────────────────────────

function CheckinSheet({
  open,
  score,
  onScore,
  onSave,
  onClose,
  saving,
  vy,
}: {
  open: boolean;
  score: number;
  onScore: (v: number) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  vy: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-sm rounded-t-3xl border border-border/50 bg-[#F9F4EE] px-6 pb-8 pt-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg">
                {vy ? "Как вы сейчас?" : "Как ты сейчас?"}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="flex size-7 items-center justify-center rounded-full border border-border/50 text-muted-foreground"
              >
                ✕
              </button>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              0 — очень тяжело · 10 — отлично
            </p>
            <Slider010 value={score} onChange={onScore} />
            <GlowButton
              onClick={onSave}
              className="mt-6 w-full"
              disabled={saving}
            >
              {saving ? "Сохраняю…" : "Сохранить"}
            </GlowButton>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Telegram connect button (token-based, secure) ───────────────────────────

function TelegramConnectButton() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);
  const doGenerate = useServerFn(generateTgToken);

  const handleConnect = async () => {
    setLoading(true);
    setErr(false);
    try {
      const { token } = await doGenerate();
      window.open(`https://t.me/${BOT_USERNAME}?start=${token}`, "_blank", "noopener,noreferrer");
    } catch {
      // Fallback: columns might not be migrated yet — open bot directly
      try {
        window.open(`https://t.me/${BOT_USERNAME}`, "_blank", "noopener,noreferrer");
      } catch {
        setErr(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={loading}
      className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card/60 px-4 py-2.5 text-xs text-muted-foreground backdrop-blur-sm transition hover:border-primary/40 hover:text-foreground disabled:opacity-50"
    >
      <span className="text-sm">✈️</span>
      {loading ? "Создаём ссылку..." : err ? "Ошибка, попробуй ещё раз" : "Подключить Telegram"}
    </button>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

function HomeScreen() {
  const a = useAddress();
  const navigate = useNavigate();
  const { reset } = useJourneyStore();
  const fetchStats = useServerFn(getUserStats);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    display_name: string | null;
    xp_total: number;
    coins_total: number;
    telegram_connected: boolean;
    first_step_text: string | null;
    first_step_reminded: boolean;
    last_checkin_at: string | null;
    last_checkin_score: number | null;
    checkin_history: Array<{ s: number; t: string }>;
    journey_count: number;
    practice_streak: number;
    sphere_queue: Array<{ sphere_id: string; score: number; position: number; status: string }> | null;
    community_count: number;
  }>({
    display_name: null, xp_total: 0, coins_total: 0, telegram_connected: false,
    first_step_text: null, first_step_reminded: false,
    last_checkin_at: null, last_checkin_score: null,
    checkin_history: [], journey_count: 0, practice_streak: 0,
    sphere_queue: null, community_count: 0,
  });
  const [firstStepDismissing, setFirstStepDismissing] = useState(false);
  const doDismissStep = useServerFn(dismissFirstStep);

  // App config (premium build flag)
  const fetchAppConfig = useServerFn(getAppConfig);
  const [isPremiumApp, setIsPremiumApp] = useState(false);

  // Premium world state
  const fetchPremium = useServerFn(checkPremiumStatus);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumWorldState, setPremiumWorldState] = useState<WorldState | null>(null);
  const [nextWorldState, setNextWorldState] = useState<WorldState | null>(null);
  const [unlockedWorldStates, setUnlockedWorldStates] = useState<WorldState[]>([]);
  const [activeDays, setActiveDays] = useState(0);
  const [worldStateChanged, setWorldStateChanged] = useState<WorldState | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Checkin state
  const doCheckin = useServerFn(submitCheckin);
  const [checkinScore, setCheckinScore] = useState(5);
  const [checkinSaved, setCheckinSaved] = useState(false);
  const [checkinSaving, setCheckinSaving] = useState(false);
  const [practiceOfDay, setPracticeOfDay] = useState<CatalogPractice | null>(null);
  const [history, setHistory] = useState<
    Array<{ completed_at: string | null; status: string }>
  >([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
    fetchStats()
      .then(({ profile: p, history: h }) => {
        setProfile(p);
        setHistory(h);
        // Restore checkin state if done today
        if (p.last_checkin_at) {
          const todayStr = getTodayKey();
          const d = new Date(p.last_checkin_at);
          const checkinStr = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
          if (checkinStr === todayStr) {
            setCheckinSaved(true);
            setPracticeOfDay(pickPracticeOfDay(p.last_checkin_score ?? null));
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Load app config + premium world state
    fetchAppConfig()
      .then((cfg) => {
        setIsPremiumApp(cfg.isPremiumApp);
        if (!cfg.isPremiumApp) return Promise.resolve(null);
        return fetchPremium();
      })
      .then(async (prem) => {
        if (!prem) return;
        setIsPremium(prem.isPremium);
        if (!prem.isPremium) return;
        setActiveDays(prem.activeDaysCount);

        const { data: states } = await supabase
          .from("eva_world_states")
          .select("*")
          .order("required_days", { ascending: true });

        if (!states) return;
        const all = states as WorldState[];
        const unlocked = all.filter((s) => s.required_days <= prem.activeDaysCount);
        const current = [...unlocked].reverse()[0] ?? all[0];
        const next = all.find((s) => s.required_days > prem.activeDaysCount) ?? null;

        setUnlockedWorldStates(unlocked);
        setNextWorldState(next);

        if (current.id !== prem.worldStateId && prem.worldStateId > 0) {
          setWorldStateChanged(current);
          const { data: user } = await supabase.auth.getUser();
          if (user.user) {
            await supabase.from("profiles")
              .update({ world_state_id: current.id })
              .eq("id", user.user.id);
          }
        }
        setPremiumWorldState(current);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastCompleted =
    history.find((h) => h.status === "completed")?.completed_at ?? null;
  const worldState = getWorldState(lastCompleted, profile.last_checkin_at);

  const handleFirstStep = async (completed: boolean) => {
    setFirstStepDismissing(true);
    await doDismissStep({ data: { completed } }).catch(() => {});
    setProfile((p) => ({
      ...p,
      first_step_reminded: true,
      coins_total: completed ? p.coins_total + 5 : p.coins_total,
    }));
    setFirstStepDismissing(false);
  };

  const worldMeta = getWorldMeta(a.vy)[worldState];
  const level = getLevel(profile.xp_total);
  const levelProgress = getLevelProgress(profile.xp_total);
  const hasActiveJourney = history.some((h) => h.status === "in_progress");

  const unlockedSphere = profile.sphere_queue?.find((e) => e.status === "unlocked") ?? null;
  const unlockedSphereLabel = unlockedSphere
    ? (SPHERES.find((s) => s.id === unlockedSphere.sphere_id)?.label ?? unlockedSphere.sphere_id)
    : null;


  const handleStart = () => {
    if (!hasActiveJourney) {
      reset();
      useJourneyStore.getState().patch({ user_roles: (profile as { user_roles?: string[] }).user_roles ?? [] } as never);
    }
    navigate({ to: "/journey/spheres" as never });
  };

  const handleStartQueued = () => {
    if (!unlockedSphere) return;
    const store = useJourneyStore.getState();
    store.reset();
    const scores: Record<string, number> = {};
    profile.sphere_queue?.forEach((e) => { scores[e.sphere_id] = e.score; });
    const sphereIds = profile.sphere_queue?.map((e) => e.sphere_id) ?? [];
    const patchedState = {
      priority_sphere: unlockedSphere.sphere_id as never,
      selected_spheres: sphereIds as never,
      sphere_scores: scores as never,
      user_roles: (profile as { user_roles?: string[] }).user_roles ?? [],
    };
    store.patch(patchedState);
    const entryStep = getEntryStep(
      unlockedSphere.sphere_id as never,
      { ...store.state, ...patchedState } as never,
    );
    store.pushStep(entryStep);
    navigate({ to: `/journey/${entryStep}` as never });
  };

  const handleCheckin = async () => {
    setCheckinSaving(true);
    await doCheckin({ data: { score: checkinScore } }).catch(() => {});
    setCheckinSaved(true);
    setPracticeOfDay(pickPracticeOfDay(checkinScore));
    setCheckinSaving(false);
  };

  // Блок статистики и действий (используется на мобильном и в десктопной правой колонке)
  const StatsAndActions = (
    <>
      {/* Статистика */}
      <div className="grid grid-cols-3 gap-2">
        <GlassCard className="p-3 text-center" selected={level >= 3}>
          <img src="/assets/eva/icon-level.png" alt="" aria-hidden className="mx-auto mb-1 size-6 object-contain" />
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Уровень</p>
          <p className="mt-1 font-display text-2xl text-glow text-primary leading-none">
            {loading ? "—" : level}
          </p>
          {!loading && level < 10 && (
            <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-muted/40">
              <div className="h-full rounded-full bg-primary/60 transition-all duration-700" style={{ width: `${levelProgress}%` }} />
            </div>
          )}
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <img src="/assets/eva/icon-xp.png" alt="" aria-hidden className="mx-auto mb-1 size-6 object-contain" />
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Опыт</p>
          <p className="mt-1 font-display text-2xl text-foreground leading-none">{loading ? "—" : profile.xp_total}</p>
          <p className="mt-0.5 text-[9px] text-muted-foreground/60">XP</p>
        </GlassCard>
        <GlassCard className="p-3 text-center">
          <img src="/assets/eva/icon-coins.png" alt="" aria-hidden className="mx-auto mb-1 size-6 object-contain" />
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Монеты</p>
          <p className="mt-1 font-display text-2xl text-amber-600 leading-none">{loading ? "—" : profile.coins_total}</p>
        </GlassCard>
      </div>

      {/* Milestone + Sparkline */}
      {!loading && (
        <MilestoneProgress
          journeyCount={profile.journey_count}
          practiceStreak={profile.practice_streak}
          xp={profile.xp_total}
        />
      )}
      {/* Оценка состояния / Практика дня */}
      {!loading && (
        <div className="rounded-2xl border border-border/40 bg-card/50 px-4 py-3">
          <AnimatePresence mode="wait">
            {!checkinSaved ? (
              <motion.div key="checkin-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                  {a.vy ? "Оцените своё состояние для получения практики дня" : "Оцени своё состояние для получения практики дня"}
                </p>
                <Slider010 value={checkinScore} onChange={setCheckinScore} />
                <button
                  type="button"
                  onClick={handleCheckin}
                  disabled={checkinSaving}
                  className="mt-3 w-full rounded-xl bg-primary/15 py-2 text-sm font-medium text-primary transition hover:bg-primary/25 disabled:opacity-50"
                >
                  {checkinSaving ? "Сохраняю…" : "Сохранить"}
                </button>
              </motion.div>
            ) : (
              <motion.div key="practice-day" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Практика дня</p>
                {practiceOfDay ? (
                  <Link to="/practices" className="block">
                    <p className="font-medium text-sm text-foreground">{practiceOfDay.title}</p>
                    {practiceOfDay.descShort && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{practiceOfDay.descShort}</p>
                    )}
                    <p className="mt-1 text-[10px] text-muted-foreground/60">{practiceOfDay.duration} мин · перейти →</p>
                  </Link>
                ) : (
                  <p className="text-xs text-muted-foreground">Продолжай в том же духе ✨</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Первый шаг */}
      <AnimatePresence>
        {!loading && !profile.first_step_reminded && profile.first_step_text && (
          <FirstStepCard
            text={profile.first_step_text}
            vy={a.vy}
            onDone={() => handleFirstStep(true)}
            onSkip={() => handleFirstStep(false)}
            disabled={firstStepDismissing}
          />
        )}
      </AnimatePresence>

      {/* Следующая сфера разблокирована */}
      <AnimatePresence>
        {!loading && unlockedSphere && !hasActiveJourney && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-2xl border border-primary/40 bg-primary/5 px-4 py-3"
          >
            <p className="text-[9px] uppercase tracking-[0.25em] text-primary/70">Ева открыла следующий путь</p>
            <p className="mt-1 font-display text-lg">{unlockedSphereLabel}</p>
            <button
              type="button"
              onClick={handleStartQueued}
              className="mt-2 w-full rounded-xl bg-primary/15 py-2 text-sm font-medium text-primary transition hover:bg-primary/25"
            >
              Продолжить путешествие
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Продолжить активное путешествие */}
      {!loading && hasActiveJourney && (
        <div className="relative w-full">
          <span className="absolute -right-1 -top-1 size-3 animate-pulse rounded-full bg-primary" />
          <GlowButton onClick={handleStart} className="w-full">
            Продолжить путешествие
          </GlowButton>
        </div>
      )}

      {/* Начать путешествие — нет активного и нет разблокированной сферы */}
      {!loading && !hasActiveJourney && !unlockedSphere && (
        <GlowButton onClick={handleStart} className="w-full">
          {history.length === 0 ? "Начать первое путешествие" : "Начать путешествие"}
        </GlowButton>
      )}

      {/* Вторичные действия */}
      {isPremiumApp && (
        <Link
          to="/diary"
          className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card/60 py-3 text-sm font-medium text-foreground/80 backdrop-blur-sm transition hover:border-primary/40 hover:text-foreground"
        >
          📖 Дневник
        </Link>
      )}

      {/* Telegram */}
      {!loading && (
        profile.telegram_connected ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-2.5">
            <span className="text-sm">✈️</span>
            <p className="text-xs text-primary/80">Telegram подключён</p>
          </div>
        ) : (
          <TelegramConnectButton />
        )
      )}
    </>
  );

  return (
    <main className="relative h-[100dvh] overflow-hidden bg-[#F9F4EE]">
      <AmbientBackground theme="safe" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 h-full w-full"
      >

        {/* ══════════════ МОБИЛЬНЫЙ ЛЭЙАУТ ══════════════ */}
        <div className="md:hidden h-full flex flex-col"
          style={{ paddingTop: "max(env(safe-area-inset-top), 1.25rem)" }}
        >
          {/* ① Заголовок — с кнопками навигации справа */}
          <div className="flex-none flex items-start justify-between px-5 mb-2" style={{ paddingRight: "3.5rem" }}>
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                {"Моё пространство"}
              </p>
              <h1 className="font-display text-3xl text-glow leading-tight">
                {"Мой мир"}
              </h1>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Link
                to="/practices"
                aria-label="Практики"
                title="Маленькие шаги к изменениям"
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card/60 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                </svg>
              </Link>
              <Link
                to="/help"
                aria-label="Справка"
                title="Узнать механику мира Евы"
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card/60 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/>
                </svg>
              </Link>
              <Link
                to="/profile"
                aria-label="Мой прогресс"
                title="Мой прогресс"
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card/60 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* ② Образ мира — фиксированная высота 38dvh */}
          <div className="flex-none h-[38dvh] px-4 overflow-hidden">
            {loading ? (
              <div className="flex h-full items-center justify-center rounded-3xl border border-border/30 bg-card/40">
                <span className="text-muted-foreground/40 text-sm">…</span>
              </div>
            ) : isPremium && premiumWorldState ? (
              <EvaWorldPremium
                currentState={premiumWorldState}
                activeDays={activeDays}
                nextState={nextWorldState}
                unlockedStates={unlockedWorldStates}
              />
            ) : (
              <WorldVisual state={worldState} sparkle={profile.practice_streak > 0} />
            )}
          </div>

          {/* Premium CTA под Миром Евы */}
          {!loading && !isPremium && (
            <div className="mt-2 text-center">
              <PremiumCTA format="a" context="home" />
            </div>
          )}

          {/* ③ Сообщение Евы */}
          <AnimatePresence>
            {!loading && worldMeta.message && (
              <motion.p
                key={worldState}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="flex-none px-5 mt-1.5 text-center font-display text-xs italic text-foreground/60 overflow-hidden"
              >
                {worldMeta.message}
              </motion.p>
            )}
          </AnimatePresence>

          {/* ③б Счётчик сообщества */}
          {!loading && profile.community_count >= 10 && (
            <p className="flex-none text-center text-[10px] text-muted-foreground/40 mt-1 tracking-wide">
              Сегодня {profile.community_count}+ человек сделали шаг вместе с Евой
            </p>
          )}

          {/* ④ Статистика и действия — скроллятся если не влезают */}
          <div
            className="flex-1 overflow-y-auto px-5 pt-3 pb-safe-or-4 flex flex-col gap-2.5"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1rem)" }}
          >
            {StatsAndActions}
          </div>
        </div>

        {/* ══════════════ ДЕСКТОПНЫЙ ЛЭЙАУТ ══════════════ */}
        <div className="hidden md:flex h-full flex-row">
          {/* Левая колонка — образ мира */}
          <div className="flex-none w-[58%] h-full p-6 flex flex-col">
            <div className="relative flex-1 min-h-0">
              {loading ? (
                <div className="flex h-full items-center justify-center rounded-3xl border border-border/30 bg-card/40">
                  <span className="text-muted-foreground/40 text-sm">…</span>
                </div>
              ) : isPremium && premiumWorldState ? (
                <EvaWorldPremium
                  currentState={premiumWorldState}
                  activeDays={activeDays}
                  nextState={nextWorldState}
                  unlockedStates={unlockedWorldStates}
                />
              ) : (
                <WorldVisual state={worldState} sparkle={profile.practice_streak > 0} />
              )}
            </div>
            {!loading && !isPremium && (
              <div className="mt-2 text-center">
                <PremiumCTA format="a" context="home" />
              </div>
            )}
            {!loading && worldMeta.message && (
              <p className="mt-3 text-center font-display text-sm italic text-foreground/60">
                {worldMeta.message}
              </p>
            )}
            {!loading && profile.community_count >= 10 && (
              <p className="mt-2 text-center text-[10px] text-muted-foreground/40 tracking-wide">
                Сегодня {profile.community_count}+ человек сделали шаг вместе с Евой
              </p>
            )}
          </div>

          {/* Правая колонка — заголовок + статистика + действия */}
          <div
            className="flex-none w-[42%] h-full overflow-y-auto px-8 py-8 flex flex-col gap-3"
            style={{ paddingTop: "max(env(safe-area-inset-top), 2rem)" }}
          >
            {/* Заголовок десктоп — с кнопкой профиля */}
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                  {"Моё пространство"}
                </p>
                <h1 className="font-display text-4xl text-glow leading-tight">
                  {"Мой мир"}
                </h1>
              </div>
              {/* Кнопки в правом верхнем углу — слева направо: ?, 💼, 👤 */}
              <div className="flex items-center gap-2">
                {/* Справка */}
                <Link
                  to="/help"
                  title="Узнать механику мира Евы"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card/60 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
                  </svg>
                </Link>
                {/* Возможности */}
                <Link
                  to="/opportunities"
                  title="Практики, психологи, курсы, партнёрские предложения"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card/60 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                    <line x1="12" y1="12" x2="12" y2="12.01"/>
                    <path d="M2 12h20"/>
                  </svg>
                </Link>
                {/* Практики */}
                <Link
                  to="/practices"
                  aria-label="Практики"
                  title="Маленькие шаги к изменениям"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card/60 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                  </svg>
                </Link>
                {/* Дневник — только в premium app */}
                {isPremiumApp && (
                  <Link
                    to="/diary"
                    aria-label="Дневник Евы"
                    title="Дневник Евы"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card/60 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                  </Link>
                )}
                {/* Прогресс */}
                <Link
                  to="/profile"
                  aria-label="Мой прогресс"
                  title="Мой прогресс"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card/60 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                  </svg>
                </Link>
              </div>
            </div>

            {!loading && worldMeta.message && (
              <p className="font-display text-sm italic text-foreground/60">{worldMeta.message}</p>
            )}

            {StatsAndActions}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {worldStateChanged && (
          <WorldStateChangedModal
            newState={worldStateChanged}
            onClose={() => setWorldStateChanged(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
