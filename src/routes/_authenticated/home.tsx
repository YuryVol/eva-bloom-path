import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BOT_USERNAME } from "@/lib/telegram";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/eva/GlassCard";
import { GlowButton } from "@/components/eva/GlowButton";
import { AmbientBackground } from "@/components/eva/AmbientBackground";
import { useJourneyStore } from "@/lib/journey-store";
import { getUserStats } from "@/lib/journey.functions";

export const Route = createFileRoute("/_authenticated/home")({
  component: HomeScreen,
  head: () => ({ meta: [{ title: "Мир Евы" }] }),
});

// ─── World state ──────────────────────────────────────────────────────────────

type WorldState = "healthy" | "wilting" | "dormant" | "winter";

function getWorldState(lastCompletedAt: string | null): WorldState {
  if (!lastCompletedAt) return "winter";
  const days =
    (Date.now() - new Date(lastCompletedAt).getTime()) /
    (1000 * 60 * 60 * 24);
  if (days <= 2) return "healthy";
  if (days <= 4) return "wilting";
  if (days <= 7) return "dormant";
  return "winter";
}

const WORLD_META: Record<
  WorldState,
  { emoji: string; label: string; message: string | null; bg: string; glow: string }
> = {
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
    message: "Твой мир немного скучает по тебе.",
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
    message: "Ева хранит твоё место. Возвращайся.",
    bg: "bg-blue-50/70",
    glow: "oklch(0.93 0.04 220 / 0.5)",
  },
};

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

function WorldVisual({ state }: { state: WorldState }) {
  const meta = WORLD_META[state];
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 85%, ${meta.glow}, transparent)`,
        }}
      />
      <span className="absolute bottom-3 right-4 rounded-full bg-black/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.25em] text-white/80 backdrop-blur-sm">
        {meta.label}
      </span>
    </motion.div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

function HomeScreen() {
  const navigate = useNavigate();
  const { reset } = useJourneyStore();
  const fetchStats = useServerFn(getUserStats);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    display_name: string | null;
    xp_total: number;
    coins_total: number;
    telegram_connected: boolean;
  }>({ display_name: null, xp_total: 0, coins_total: 0, telegram_connected: false });
  const [userId, setUserId] = useState<string | null>(null);
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
      })
      .catch(() => {
        /* non-blocking */
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastCompleted =
    history.find((h) => h.status === "completed")?.completed_at ?? null;
  const worldState = getWorldState(lastCompleted);
  const worldMeta = WORLD_META[worldState];
  const level = getLevel(profile.xp_total);
  const levelProgress = getLevelProgress(profile.xp_total);
  const journeyCount = history.filter((h) => h.status === "completed").length;
  const streak = computeStreak(history);

  const handleStart = () => {
    reset();
    navigate({ to: "/journey/spheres" as never });
  };

  return (
    <main className="relative h-[100dvh] overflow-hidden bg-[#F9F4EE]">
      <AmbientBackground theme="safe" />

      {/* Вся высота — флекс-колонка, равномерно распределяем пространство */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto flex h-full w-full max-w-sm flex-col px-5 py-safe-or-5"
        style={{ paddingTop: "max(env(safe-area-inset-top), 1.25rem)", paddingBottom: "max(env(safe-area-inset-bottom), 1.25rem)" }}
      >
        {/* ① Заголовок — фиксированная высота */}
        <div className="mb-3 text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            Твоё пространство
          </p>
          <h1 className="font-display text-3xl text-glow leading-tight">
            Мир Евы
          </h1>
          {profile.display_name && (
            <p className="mt-0.5 font-display text-sm italic text-foreground/50">
              {profile.display_name}
            </p>
          )}
        </div>

        {/* ② Картинка — занимает всё свободное место */}
        <div className="relative min-h-0 flex-1 mb-3">
          {loading ? (
            <div className="flex h-full items-center justify-center rounded-3xl border border-border/30 bg-card/40">
              <span className="text-muted-foreground/40 text-sm">…</span>
            </div>
          ) : (
            <WorldVisual state={worldState} />
          )}
        </div>

        {/* ③ Сообщение Евы — только если есть (не сдвигает остальное) */}
        <AnimatePresence>
          {!loading && worldMeta.message && (
            <motion.p
              key={worldState}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-3 text-center font-display text-xs italic text-foreground/60 overflow-hidden"
            >
              {worldMeta.message}
            </motion.p>
          )}
        </AnimatePresence>

        {/* ④ Статистика — 3 колонки */}
        <div className="mb-2.5 grid grid-cols-3 gap-2">
          <GlassCard className="p-3 text-center" selected={level >= 3}>
            <img src="/assets/eva/icon-level.png" alt="" aria-hidden className="mx-auto mb-1 size-6 object-contain" />
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Уровень</p>
            <p className="mt-1 font-display text-2xl text-glow text-primary leading-none">
              {loading ? "—" : level}
            </p>
            {!loading && level < 10 && (
              <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full bg-primary/60 transition-all duration-700"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-3 text-center">
            <img src="/assets/eva/icon-xp.png" alt="" aria-hidden className="mx-auto mb-1 size-6 object-contain" />
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Опыт</p>
            <p className="mt-1 font-display text-2xl text-foreground leading-none">
              {loading ? "—" : profile.xp_total}
            </p>
            <p className="mt-0.5 text-[9px] text-muted-foreground/60">XP</p>
          </GlassCard>

          <GlassCard className="p-3 text-center">
            <img src="/assets/eva/icon-coins.png" alt="" aria-hidden className="mx-auto mb-1 size-6 object-contain" />
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Монеты</p>
            <p className="mt-1 font-display text-2xl text-amber-600 leading-none">
              {loading ? "—" : profile.coins_total}
            </p>
          </GlassCard>
        </div>

        {/* ⑤ Стрик / кол-во путешествий */}
        {!loading && (streak >= 2 || journeyCount > 0) && (
          <div className="mb-2.5 flex items-center justify-center gap-4">
            {streak >= 2 && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <img src="/assets/eva/icon-streak.png" alt="" aria-hidden className="size-4 object-contain" />
                <span className="font-medium">{streak}</span>{" "}
                {streak < 5 ? "дня" : "дней"} подряд
              </span>
            )}
            {journeyCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <img src="/assets/eva/icon-journeys.png" alt="" aria-hidden className="size-4 object-contain" />
                <span className="font-medium">{journeyCount}</span>{" "}
                {journeyCount === 1
                  ? "путешествие"
                  : journeyCount < 5
                    ? "путешествия"
                    : "путешествий"}
              </span>
            )}
          </div>
        )}

        {/* ⑥ Действия */}
        <div className="flex flex-col items-center gap-2 mb-2.5">
          <GlowButton onClick={handleStart} className="w-full">
            Начать путешествие
          </GlowButton>
          <Link
            to="/practices"
            className="text-xs text-muted-foreground transition hover:text-foreground"
          >
            🕯️ Ежедневные практики
          </Link>
        </div>

        {/* ⑦ Telegram */}
        {!loading && (
          profile.telegram_connected ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-2.5">
              <span className="text-sm">✈️</span>
              <p className="text-xs text-primary/80">Telegram подключён</p>
            </div>
          ) : (
            <a
              href={userId ? `https://t.me/${BOT_USERNAME}?start=${userId}` : `https://t.me/${BOT_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card/60 px-4 py-2.5 text-xs text-muted-foreground backdrop-blur-sm transition hover:border-primary/40 hover:text-foreground"
            >
              <span className="text-sm">✈️</span>
              Подключить Telegram
            </a>
          )
        )}
      </motion.div>
    </main>
  );
}
