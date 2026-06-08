import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, memo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Flame, Map } from "lucide-react";
import { GlassCard } from "@/components/eva/GlassCard";
import { AmbientBackground } from "@/components/eva/AmbientBackground";
import { getUserStats } from "@/lib/journey.functions";
import { SPHERES, type SphereId } from "@/lib/journey-types";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfileScreen,
  head: () => ({ meta: [{ title: "Мой прогресс — ЕВА" }] }),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLevel(xp: number) {
  return Math.min(10, Math.floor(xp / 150) + 1);
}

function getLevelProgress(xp: number) {
  const level = getLevel(xp);
  if (level >= 10) return 100;
  const levelStart = (level - 1) * 150;
  const levelEnd = level * 150;
  return Math.round(((xp - levelStart) / (levelEnd - levelStart)) * 100);
}

function computeStreak(history: Array<{ completed_at: string | null; status: string }>) {
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
    if (uniqueDates.includes(key)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
}

const SPHERE_EMOJI: Record<SphereId, string> = {
  relationships: "💞",
  family: "🏡",
  career: "🌟",
  growth: "🌱",
  finance: "💛",
  rest: "🌙",
  people: "🤝",
  health: "🌿",
};

// ─── Journey card ─────────────────────────────────────────────────────────────

const JourneyCard = memo(function JourneyCard({
  item,
  index,
}: {
  item: {
    status: string;
    completed_at: string | null;
    state: unknown;
    started_at: string | null;
  };
  index: number;
}) {
  const s = (item.state ?? {}) as Record<string, unknown>;
  const sphereId = (s.priority_sphere as SphereId) || null;
  const sphereLabel =
    sphereId ? (SPHERES.find((x) => x.id === sphereId)?.label ?? sphereId) : "—";
  const emoji = sphereId ? (SPHERE_EMOJI[sphereId] ?? "✦") : "✦";
  const goal = typeof s.desired_goal === "string" ? s.desired_goal : null;
  const before = typeof s.resistance_score_before === "number" ? s.resistance_score_before : null;
  const after = typeof s.resistance_score_after === "number" ? s.resistance_score_after : null;
  const delta = before !== null && after !== null ? before - after : null;
  const firstStep = typeof (s as Record<string, unknown>).first_step === "string"
    ? (s as Record<string, unknown>).first_step as string
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <GlassCard className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{emoji}</span>
            <div>
              <p className="font-display text-base text-foreground">{sphereLabel}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {formatDate(item.completed_at)}
              </p>
            </div>
          </div>
          {delta !== null && delta > 0 && (
            <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
              −{delta} сопр.
            </span>
          )}
        </div>

        {goal && (
          <p className="mt-2 font-display text-sm italic text-foreground/70">
            «{goal}»
          </p>
        )}

        {firstStep && (
          <div className="mt-2 rounded-xl bg-primary/5 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Первый шаг
            </p>
            <p className="mt-0.5 text-xs text-foreground/80">{firstStep}</p>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
});

// ─── Main screen ──────────────────────────────────────────────────────────────

function ProfileScreen() {
  const navigate = useNavigate();
  const fetchStats = useServerFn(getUserStats);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    display_name: null as string | null,
    xp_total: 0,
    coins_total: 0,
  });
  const [history, setHistory] = useState<
    Array<{
      id: string;
      status: string;
      completed_at: string | null;
      started_at: string | null;
      state: unknown;
    }>
  >([]);

  useEffect(() => {
    fetchStats()
      .then(({ profile: p, history: h }) => {
        setProfile(p);
        setHistory(h);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const level = getLevel(profile.xp_total);
  const levelProgress = getLevelProgress(profile.xp_total);
  const completed = history.filter((h) => h.status === "completed");
  const streak = computeStreak(history);

  return (
    <main className="relative min-h-[100dvh] bg-[#F9F4EE]">
      <AmbientBackground theme="safe" />

      {/* Header */}
      <div
        className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/40 bg-[#F9F4EE]/80 px-4 py-3 backdrop-blur-md"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0.75rem)" }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/home" as never })}
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card/70 text-foreground transition hover:border-primary/50"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-xl text-glow leading-tight">Мой прогресс</h1>
          {profile.display_name && (
            <p className="text-xs italic text-muted-foreground">{profile.display_name}</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 pb-10 pt-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
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

        {/* Streak + count */}
        {!loading && (streak >= 1 || completed.length > 0) && (
          <div className="mt-3 flex items-center justify-center gap-5">
            {streak >= 1 && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <img src="/assets/eva/icon-streak.png" alt="" aria-hidden className="size-4 object-contain" />
                <span className="font-medium text-foreground">{streak}</span>{" "}
                {streak === 1 ? "день" : streak < 5 ? "дня" : "дней"} подряд
              </span>
            )}
            {completed.length > 0 && (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <img src="/assets/eva/icon-journeys.png" alt="" aria-hidden className="size-4 object-contain" />
                <span className="font-medium text-foreground">{completed.length}</span>{" "}
                {completed.length === 1 ? "путешествие" : completed.length < 5 ? "путешествия" : "путешествий"}
              </span>
            )}
          </div>
        )}

        {/* Journey history */}
        <div className="mt-6">
          <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            История путешествий
          </p>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted/30" />
              ))}
            </div>
          ) : completed.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <p className="font-display text-base italic text-muted-foreground">
                Пока нет завершённых путешествий.
              </p>
              <Link
                to="/journey/spheres"
                className="mt-3 inline-block text-xs uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors"
              >
                Начать первое →
              </Link>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {completed.map((item, i) => (
                <JourneyCard key={item.id} item={item} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
