import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback, memo } from "react";
import { getGuardians } from "@/lib/guardian.functions";
import type { Guardian } from "@/lib/guardian.functions";
import { GuardianCard, CreateGuardianPrompt } from "@/components/guardian/GuardianCard";
import { checkPremiumStatus } from "@/lib/premium.functions";
import { getAppConfig } from "@/lib/app-config";
import { PremiumCTA } from "@/components/premium/PremiumCTA";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Download, Share2, ShoppingBag, Lock, CheckCircle2, ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/eva/GlassCard";
import { AmbientBackground } from "@/components/eva/AmbientBackground";
import { getUserStats, purchaseShopItem } from "@/lib/journey.functions";
import { SPHERES, type SphereId } from "@/lib/journey-types";
import {
  SHOP_ITEMS,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  type ShopCategory,
  type ShopItem,
} from "@/lib/shop-catalog";
// ShopSection and ShopItemCard are kept here for potential reuse
import { MILESTONES as MILESTONE_DEFS, getMilestoneProgress, isUnlocked } from "@/lib/milestones";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfileScreen,
  head: () => ({ meta: [{ title: "Мой путь — ЕВА" }] }),
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
        {(typeof s.selected_practice_name === "string" || typeof s.resistance_shape === "string") && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {typeof s.resistance_shape === "string" && (
              <span className="rounded-full bg-muted/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                {s.resistance_shape === "stone" ? "камень" : s.resistance_shape === "knot" ? "узел" : s.resistance_shape === "wall" ? "стена" : s.resistance_shape === "fog" ? "туман" : s.resistance_shape === "ice" ? "лёд" : s.resistance_shape === "thorn" ? "шипы" : s.resistance_shape === "void" ? "пустота" : s.resistance_shape === "shadow" ? "тень" : String(s.resistance_shape)}
              </span>
            )}
            {typeof s.selected_practice_name === "string" && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                {s.selected_practice_name as string}
              </span>
            )}
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
});

// ─── Achievements ─────────────────────────────────────────────────────────────

interface BadgeDef {
  id: string;
  icon: string;
  label: string;
  desc: string;
  check: (p: {
    journey_count: number;
    practice_streak: number;
    xp_total: number;
    first_step_reminded: boolean;
    checkin_history: Array<{ s: number; t: string }>;
    completed: Array<{ completed_at: string | null }>;
  }) => { earned: boolean; date: string | null };
}

const BADGE_DEFS: BadgeDef[] = [
  {
    id: "first_journey",
    icon: "🌸",
    label: "Первый путь",
    desc: "Завершено первое путешествие",
    check: ({ journey_count, completed }) => ({
      earned: journey_count >= 1,
      date: completed[0]?.completed_at ?? null,
    }),
  },
  {
    id: "first_step",
    icon: "👣",
    label: "Первый шаг",
    desc: "Закрыт первый маленький шаг",
    check: ({ first_step_reminded }) => ({
      earned: first_step_reminded,
      date: null,
    }),
  },
  {
    id: "three_journeys",
    icon: "🗺️",
    label: "Три пути",
    desc: "Завершено 3 путешествия",
    check: ({ journey_count, completed }) => ({
      earned: journey_count >= 3,
      date: completed[2]?.completed_at ?? null,
    }),
  },
  {
    id: "five_journeys",
    icon: "🌟",
    label: "Пять путей",
    desc: "Завершено 5 путешествий",
    check: ({ journey_count, completed }) => ({
      earned: journey_count >= 5,
      date: completed[4]?.completed_at ?? null,
    }),
  },
  {
    id: "seven_journeys",
    icon: "✨",
    label: "Семь путей",
    desc: "Завершено 7 путешествий",
    check: ({ journey_count, completed }) => ({
      earned: journey_count >= 7,
      date: completed[6]?.completed_at ?? null,
    }),
  },
  {
    id: "streak_3",
    icon: "🔥",
    label: "Три дня подряд",
    desc: "Практики 3 дня подряд",
    check: ({ practice_streak }) => ({
      earned: practice_streak >= 3,
      date: null,
    }),
  },
  {
    id: "streak_7",
    icon: "💫",
    label: "Неделя практик",
    desc: "Практики 7 дней подряд",
    check: ({ practice_streak }) => ({
      earned: practice_streak >= 7,
      date: null,
    }),
  },
  {
    id: "checkin_5",
    icon: "🌿",
    label: "Честный взгляд",
    desc: "5 отметок состояния",
    check: ({ checkin_history }) => ({
      earned: checkin_history.length >= 5,
      date: checkin_history[4]?.t ?? null,
    }),
  },
  {
    id: "level_3",
    icon: "🏆",
    label: "Уровень 3",
    desc: "Накоплено 450 XP",
    check: ({ xp_total }) => ({
      earned: xp_total >= 450,
      date: null,
    }),
  },
];

function drawBadgeCard(
  icon: string,
  label: string,
  desc: string,
  date: string | null,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    const W = 600;
    const H = 400;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return resolve(null);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#fdf6ef");
    grad.addColorStop(1, "#f5e6d3");
    ctx.fillStyle = grad;
    ctx.roundRect(0, 0, W, H, 32);
    ctx.fill();

    // Subtle border
    ctx.strokeStyle = "rgba(180,130,80,0.25)";
    ctx.lineWidth = 1.5;
    ctx.roundRect(2, 2, W - 4, H - 4, 30);
    ctx.stroke();

    // Glow circle behind icon
    const glowGrad = ctx.createRadialGradient(W / 2, 160, 0, W / 2, 160, 90);
    glowGrad.addColorStop(0, "rgba(210,140,60,0.18)");
    glowGrad.addColorStop(1, "rgba(210,140,60,0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(W / 2, 160, 90, 0, Math.PI * 2);
    ctx.fill();

    // Icon
    ctx.font = "88px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(icon, W / 2, 155);

    // Label
    ctx.font = "bold 36px Georgia, serif";
    ctx.fillStyle = "#3a2a1a";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(label, W / 2, 268);

    // Desc
    ctx.font = "22px system-ui, sans-serif";
    ctx.fillStyle = "rgba(80,55,30,0.65)";
    ctx.fillText(desc, W / 2, 308);

    // Date
    if (date) {
      const d = new Date(date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
      ctx.font = "18px system-ui, sans-serif";
      ctx.fillStyle = "rgba(120,90,50,0.5)";
      ctx.fillText(d, W / 2, 342);
    }

    // App name
    ctx.font = "italic 18px Georgia, serif";
    ctx.fillStyle = "rgba(140,100,60,0.45)";
    ctx.fillText("ЕВА · путь к себе", W / 2, H - 24);

    canvas.toBlob(resolve, "image/png");
  });
}

async function shareBadge(icon: string, label: string, desc: string, date: string | null) {
  const blob = await drawBadgeCard(icon, label, desc, date);
  if (!blob) return;
  const file = new File([blob], `eva-badge-${label}.png`, { type: "image/png" });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `ЕВА — ${label}`, text: `${icon} ${desc}` });
      return;
    } catch {
      // fall through to download
    }
  }
  // Fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `eva-badge-${label}.png`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Badge card component ──────────────────────────────────────────────────────

const BadgeCard = memo(function BadgeCard({
  icon,
  label,
  desc,
  date,
  earned,
  index,
}: {
  icon: string;
  label: string;
  desc: string;
  date: string | null;
  earned: boolean;
  index: number;
}) {
  const [sharing, setSharing] = useState(false);

  const handleShare = useCallback(async () => {
    if (!earned || sharing) return;
    setSharing(true);
    await shareBadge(icon, label, desc, date);
    setSharing(false);
  }, [earned, sharing, icon, label, desc, date]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <GlassCard
        className={`relative flex flex-col items-center p-4 text-center transition-all ${
          earned ? "" : "opacity-40 grayscale"
        }`}
      >
        <span className="text-4xl leading-none mb-2">{icon}</span>
        <p className={`font-display text-sm leading-tight ${earned ? "text-foreground" : "text-muted-foreground"}`}>
          {label}
        </p>
        <p className="mt-0.5 text-[10px] text-muted-foreground/70 leading-snug">{desc}</p>
        {date && earned && (
          <p className="mt-1 text-[9px] text-muted-foreground/50">
            {new Date(date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
          </p>
        )}
        {earned && (
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            title="Сохранить / поделиться"
            className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full text-muted-foreground/40 transition hover:text-primary/70 disabled:opacity-30"
          >
            {sharing ? (
              <span className="text-[10px]">…</span>
            ) : navigator.share !== undefined ? (
              <Share2 className="size-3.5" />
            ) : (
              <Download className="size-3.5" />
            )}
          </button>
        )}
      </GlassCard>
    </motion.div>
  );
});

// ─── Shop ─────────────────────────────────────────────────────────────────────

const CATEGORIES: ShopCategory[] = ["practice", "psychologist", "course"];

function ShopItemCard({
  item,
  coins,
  level,
  purchased,
  onBuy,
}: {
  item: ShopItem;
  coins: number;
  level: number;
  purchased: string[];
  onBuy: (item: ShopItem) => Promise<void>;
}) {
  const navigate = useNavigate();
  const [buying, setBuying] = useState(false);
  const [done, setDone] = useState(false);
  const isPurchased = purchased.includes(item.id) || item.coins === 0;
  const locked = level < item.level_required;
  const canAfford = coins >= item.coins;
  const isFree = item.coins === 0;

  const openPractice = () => {
    if (item.url) { window.open(item.url, "_blank", "noopener,noreferrer"); return; }
    if (item.practiceRoute) { navigate({ to: item.practiceRoute as never }); return; }
  };

  const handleAction = async () => {
    if (locked) return;
    if (isFree || item.url) { openPractice(); return; }
    if (isPurchased) { openPractice(); return; }
    if (!canAfford || buying) return;
    setBuying(true);
    await onBuy(item);
    setDone(true);
    setBuying(false);
  };

  return (
    <GlassCard className={`flex items-center gap-3 p-4 transition-all ${locked ? "opacity-40" : ""}`}>
      <span className="shrink-0 text-2xl leading-none">{item.icon}</span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-display text-sm leading-tight">{item.title}</p>
          {item.level_required > 1 && locked && (
            <span className="text-[9px] uppercase tracking-wide text-muted-foreground/50">
              ур.{item.level_required}+
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs leading-snug text-muted-foreground line-clamp-2">{item.desc}</p>
        <p className="mt-1 text-xs font-medium text-amber-600">
          {isFree ? "бесплатно" : `🪙 ${item.coins}`}
        </p>
      </div>

      <div className="shrink-0">
        {locked ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground/50">
            <Lock className="size-3" />
          </span>
        ) : isFree ? (
          <button
            type="button"
            onClick={openPractice}
            className="flex items-center gap-1 rounded-full border border-primary/60 bg-primary/10 px-2.5 py-1 text-xs text-primary transition hover:bg-primary/20"
          >
            Открыть →
          </button>
        ) : isPurchased || done ? (
          <button
            type="button"
            onClick={openPractice}
            className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary transition hover:bg-primary/20"
          >
            <CheckCircle2 className="size-3" />
            Открыть →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAction}
            disabled={buying || (!canAfford && !item.url)}
            className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-all ${
              canAfford || item.url
                ? "border-primary/60 bg-primary/10 text-foreground hover:bg-primary/20 disabled:opacity-50"
                : "border-border/40 text-muted-foreground/40 cursor-not-allowed"
            }`}
          >
            {buying ? "…" : item.url ? <><ExternalLink className="size-3" /> Открыть</> : canAfford ? "Купить" : "Мало"}
          </button>
        )}
      </div>
    </GlassCard>
  );
}

function ShopSection({
  coins,
  level,
  purchased,
  onPurchase,
}: {
  coins: number;
  level: number;
  purchased: string[];
  onPurchase: (itemId: string, newCoins: number) => void;
}) {
  const [activeTab, setActiveTab] = useState<ShopCategory | null>(null);
  const buy = useServerFn(purchaseShopItem);

  const items = activeTab
    ? SHOP_ITEMS.filter(
        (i) => i.category === activeTab && !(i.category === "practice" && i.coins > 0 && purchased.includes(i.id))
      )
    : [];

  const handleBuy = async (item: ShopItem) => {
    const result = await buy({
      data: { item_id: item.id, item_category: item.category, coins: item.coins },
    });
    onPurchase(item.id, result.coins_total);
  };

  const handleTab = (cat: ShopCategory) => {
    setActiveTab((prev) => (prev === cat ? null : cat));
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <ShoppingBag className="size-4 text-muted-foreground" />
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Возможности</p>
        <span className="ml-auto text-xs text-muted-foreground/60">🪙 {coins}</span>
      </div>

      {/* Tabs — клик открывает/закрывает */}
      <div className="flex gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => handleTab(cat)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all ${
              activeTab === cat
                ? "border-primary/60 bg-primary/10 text-foreground"
                : "border-border/50 text-muted-foreground hover:border-primary/30"
            }`}
          >
            {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeTab && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  coins={coins}
                  level={level}
                  purchased={purchased}
                  onBuy={handleBuy}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

function ProfileScreen() {
  const navigate = useNavigate();
  const fetchStats = useServerFn(getUserStats);

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    display_name: null as string | null,
    xp_total: 0,
    coins_total: 0,
    journey_count: 0,
    practice_streak: 0,
    first_step_reminded: false,
    checkin_history: [] as Array<{ s: number; t: string }>,
    purchased_practices: [] as string[],
    shop_purchase_map: {} as Record<string, string>,
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
        setProfile(p as typeof profile);
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

  const badges = BADGE_DEFS.map((def) => ({
    ...def,
    ...def.check({
      journey_count: profile.journey_count,
      practice_streak: profile.practice_streak,
      xp_total: profile.xp_total,
      first_step_reminded: profile.first_step_reminded,
      checkin_history: profile.checkin_history,
      completed: completed.map((c) => ({ completed_at: c.completed_at })),
    }),
  }));

  const jc = profile.journey_count;
  const ps = profile.practice_streak;
  const xp = profile.xp_total;
  const MILESTONES = MILESTONE_DEFS.map((m) => {
    const done = isUnlocked(m, jc, ps, xp);
    const { current, total } = getMilestoneProgress(m, jc, ps, xp);
    const desc = m.journeysRequired
      ? `${m.journeysRequired} завершённых путешествий`
      : m.streakRequired
      ? `Стрик практик ${m.streakRequired} ${m.streakRequired < 5 ? "дня" : "дней"}`
      : `${m.xpRequired} XP`;
    return { id: m.id, rewardType: m.rewardType, label: m.rewardLabel, icon: m.rewardIcon, desc, done, progress: current, total };
  });

  const [historyExpanded, setHistoryExpanded] = useState(false);
  const visibleHistory = historyExpanded ? completed : completed.slice(0, 2);

  // Guardians (premium app only)
  const fetchGuardians = useServerFn(getGuardians);
  const fetchPremium = useServerFn(checkPremiumStatus);
  const fetchAppConfig = useServerFn(getAppConfig);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [isPremiumApp, setIsPremiumApp] = useState(false);

  useEffect(() => {
    fetchAppConfig().then((cfg) => {
      setIsPremiumApp(cfg.isPremiumApp);
      if (!cfg.isPremiumApp) return;
      fetchPremium().then((r) => setIsPremium(r.isPremium)).catch(() => {});
      fetchGuardians().then(setGuardians).catch(() => {});
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Spheres without a guardian yet (for premium users)
  const guardianSphereIds = new Set(guardians.map((g) => g.sphere_id));
  const spheresWithoutGuardian = SPHERES.filter((s) => !guardianSphereIds.has(s.id));

  return (
    <main className="relative min-h-[100dvh] bg-[#F9F4EE]">
      <AmbientBackground theme="safe" />

      {/* ── Header ── */}
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
          <h1 className="font-display text-xl text-glow leading-tight">Мой путь</h1>
          {profile.display_name && (
            <p className="text-xs italic text-muted-foreground">{profile.display_name}</p>
          )}
        </div>
        {!loading && isPremium && (
          <span className="flex items-center gap-1 rounded-full border border-amber-300/60 bg-gradient-to-r from-amber-50 to-amber-100/80 px-3 py-1 text-xs font-medium text-amber-700">
            ✦ EVA+
          </span>
        )}
        {!loading && (
          <span className="flex items-center gap-1 rounded-full border border-amber-200/60 bg-amber-50/60 px-3 py-1 text-sm font-medium text-amber-700">
            🪙 {profile.coins_total}
          </span>
        )}
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 pb-12 pt-5 md:max-w-5xl md:px-8">

        {/* ── Статистика — полная ширина ── */}
        <div className="grid grid-cols-3 gap-3">
          <GlassCard className="p-4 text-center" selected={level >= 3}>
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Уровень</p>
            <p className="mt-1 font-display text-3xl text-glow text-primary leading-none">
              {loading ? "—" : level}
            </p>
            {!loading && level < 10 && (
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted/40">
                <div className="h-full rounded-full bg-primary/60 transition-all duration-700" style={{ width: `${levelProgress}%` }} />
              </div>
            )}
            {!loading && (
              <p className="mt-1 text-[9px] text-muted-foreground/60">
                {profile.xp_total % 150}/{150} XP
              </p>
            )}
          </GlassCard>

          <GlassCard className="p-4 text-center">
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Опыт</p>
            <p className="mt-1 font-display text-3xl text-foreground leading-none">
              {loading ? "—" : profile.xp_total}
            </p>
            <p className="mt-1 text-[9px] text-muted-foreground/60">XP всего</p>
          </GlassCard>

          <GlassCard className="p-4 text-center">
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Стрик</p>
            <p className="mt-1 font-display text-3xl text-foreground leading-none">
              {loading ? "—" : streak}
            </p>
            <p className="mt-1 text-[9px] text-muted-foreground/60">
              {!loading && `${completed.length} ${completed.length === 1 ? "путь" : completed.length < 5 ? "пути" : "путей"}`}
            </p>
          </GlassCard>
        </div>

        {/* ── Две колонки ── */}
        {!loading && (
          <div className="mt-8 grid gap-8 md:grid-cols-2 md:items-start">

            {/* ── ЛЕВАЯ КОЛОНКА ── */}
            <div className="space-y-8">

              {/* Достижения */}
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Достижения
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {badges.map((b, i) => (
                    <BadgeCard
                      key={b.id}
                      icon={b.icon}
                      label={b.label}
                      desc={b.desc}
                      date={b.date}
                      earned={b.earned}
                      index={i}
                    />
                  ))}
                </div>
              </div>

              {/* История путешествий */}
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  История путешествий
                </p>
                {completed.length === 0 ? (
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
                  <>
                    <div className="space-y-3">
                      {visibleHistory.map((item, i) => (
                        <JourneyCard key={item.id} item={item} index={i} />
                      ))}
                    </div>
                    {completed.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setHistoryExpanded((v) => !v)}
                        className="mt-3 w-full py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground/60 transition hover:text-muted-foreground"
                      >
                        {historyExpanded ? "Скрыть" : `Показать ещё ${completed.length - 2}`}
                      </button>
                    )}
                    {!isPremium && completed.length >= 3 && (
                      <PremiumCTA format="b" context="history" className="mt-3" />
                    )}
                  </>
                )}
              </div>

            </div>

            {/* ── ПРАВАЯ КОЛОНКА ── */}
            <div className="space-y-8">

              {/* Вехи прогресса */}
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Вехи прогресса
                </p>
                <div className="space-y-2">
                  {MILESTONES.map((m) => (
                    <GlassCard
                      key={m.label}
                      className={`flex items-center gap-3 px-4 py-3 transition-all ${m.done ? "cursor-pointer hover:border-primary/50 hover:shadow-sm active:scale-[0.99]" : ""}`}
                      onClick={m.done ? () => {
                          if (m.rewardType === "practice") {
                            navigate({ to: "/practices/$practiceId" as never, params: { practiceId: m.id } as never });
                          } else {
                            navigate({ to: "/practices" as never });
                          }
                        } : undefined}
                    >
                      <span className="text-base">{m.done ? "✅" : m.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-display leading-tight ${m.done ? "text-foreground" : "text-muted-foreground"}`}>
                          {m.label}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60">{m.desc}</p>
                        {!m.done && (
                          <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-muted/40">
                            <div
                              className="h-full rounded-full bg-primary/50 transition-all duration-700"
                              style={{ width: `${Math.round((m.progress / m.total) * 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                      {m.done ? (
                        <span className="shrink-0 flex items-center gap-1 rounded-full border border-primary/50 bg-primary/10 px-2.5 py-1 text-[10px] uppercase tracking-widest text-primary">
                          Открыть →
                        </span>
                      ) : (
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground/60">{m.progress}/{m.total}</span>
                      )}
                    </GlassCard>
                  ))}
                </div>
              </div>

            {/* ── Хранители сфер (только в premium app) ── */}
            {isPremiumApp && isPremium && (
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  Хранители сфер
                </p>
                <div className="space-y-3">
                  {guardians.map((g) => (
                    <GuardianCard key={g.id} guardian={g} />
                  ))}
                  {spheresWithoutGuardian.slice(0, 3).map((s) => (
                    <CreateGuardianPrompt key={s.id} sphereId={s.id} sphereLabel={s.label} />
                  ))}
                </div>
              </div>
            )}

            {/* ── Guardians CTA для не-премиум пользователей — ведёт на paywall ── */}
            {isPremiumApp && !isPremium && (
              <button
                type="button"
                onClick={() => navigate({ to: "/premium/paywall" as never })}
                className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-amber-300/50 bg-amber-50/30 px-4 py-3 text-left transition hover:bg-amber-50/60"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100/60 text-amber-600">
                  ✨
                </div>
                <p className="text-sm text-foreground/70">Создай хранителя своей сферы</p>
              </button>
            )}

            </div>
          </div>
        )}

        {/* Skeleton при загрузке */}
        {loading && (
          <div className="mt-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted/30" />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
