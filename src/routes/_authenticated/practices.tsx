import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useAddress } from "@/lib/use-address";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, ArrowLeft, Lock, ChevronRight } from "lucide-react";
import { AmbientBackground } from "@/components/eva/AmbientBackground";
import { GlassCard } from "@/components/eva/GlassCard";
import { useServerFn } from "@tanstack/react-start";
import { getUserStats, submitCheckin } from "@/lib/journey.functions";
import { checkPremiumStatus } from "@/lib/premium.functions";
import { PremiumCTA } from "@/components/premium/PremiumCTA";
import { MILESTONES } from "@/lib/milestones";
import { CATALOG, pickPracticeOfDay, type CatalogPractice } from "@/lib/practices-catalog";
import { Slider010 } from "@/components/eva/Slider010";
import {
  CATEGORIES,
  MOOD_MAP,
  INTERACTIVE_PRACTICES,
  getUnlockedPractices,
  saveUnlockedPractice,
  getTodayKey,
  loadDone,
  computeStreak,
  type LocalPractice as Practice,
  type LocalCategory as Category,
  type InteractivePractice,
} from "@/lib/practices-local";

export const Route = createFileRoute("/_authenticated/practices")({
  component: PracticesScreen,
  head: () => ({ meta: [{ title: "Практики — ЕВА" }] }),
});

// ─── Practice card (clickable Link to detail screen) ─────────────────────────

function PracticeCard({ practice, done }: { practice: Practice; done: boolean }) {
  return (
    <Link
      to="/practices/$practiceId"
      params={{ practiceId: practice.id }}
      className={`flex items-center gap-3 overflow-hidden rounded-2xl border transition-all duration-200 px-5 py-4 backdrop-blur-sm hover:border-primary/40 active:scale-[0.99] ${
        done ? "border-primary/50 bg-primary/5" : "border-border/60 bg-card/60"
      }`}
    >
      <span
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
          done ? "border-primary bg-primary text-primary-foreground" : "border-border/60"
        }`}
      >
        {done && <Check className="size-3.5" strokeWidth={2.5} />}
      </span>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${done ? "text-foreground/60 line-through" : "text-foreground"}`}>
          {practice.title}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-[11px] text-muted-foreground">{practice.duration}</p>
          {MOOD_MAP[practice.id] === "grounding" && (
            <span className="rounded-full bg-green-100/70 px-1.5 py-px text-[9px] font-medium text-green-700/80">🌿 ежедневная</span>
          )}
          {MOOD_MAP[practice.id] === "deep" && (
            <span className="rounded-full bg-amber-100/70 px-1.5 py-px text-[9px] font-medium text-amber-800/70">✦ глубокая</span>
          )}
        </div>
      </div>

      <ChevronRight className="size-4 shrink-0 text-muted-foreground/40" />
    </Link>
  );
}

// ─── Locked practice card (also navigates to detail screen) ───────────────────

function LockedPracticeCard({ practice }: { practice: Practice & { locked: true; unlockCost: number } }) {
  return (
    <Link
      to="/practices/$practiceId"
      params={{ practiceId: practice.id }}
      className="flex items-center gap-3 overflow-hidden rounded-2xl border border-border/30 bg-card/30 px-5 py-4 backdrop-blur-sm hover:border-primary/30 active:scale-[0.99] transition-all"
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border/40 text-muted-foreground/50">
        <Lock className="size-3" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground/50">{practice.title}</p>
        <p className="text-[11px] text-muted-foreground/50">{practice.duration}</p>
      </div>
      <span className="shrink-0 rounded-full border border-amber-300/50 bg-amber-50/30 px-2.5 py-1 text-[10px] font-medium text-amber-700/70">
        🔒 {practice.unlockCost}
      </span>
    </Link>
  );
}

// ─── Interactive practice card ────────────────────────────────────────────────

function InteractivePracticeCard({ id, emoji, title, duration, done }: {
  id: string; emoji: string; title: string; duration: string; done: boolean;
}) {
  return (
    <Link
      to="/practices/run/$componentKey"
      params={{ componentKey: id }}
      className={`flex items-center gap-3 overflow-hidden rounded-2xl border transition-all duration-200 px-5 py-4 backdrop-blur-sm hover:border-primary/40 active:scale-[0.99] ${
        done ? "border-primary/50 bg-primary/5" : "border-border/60 bg-card/60"
      }`}
    >
      <span className="text-xl shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug ${done ? "text-foreground/60" : "text-foreground"}`}>
          {title}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{duration}</p>
      </div>
      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary/70 mr-1">
        интерактивная
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground/40" />
    </Link>
  );
}

// ─── Interactive practices accordion ─────────────────────────────────────────

function InteractivePracticesSection({
  practices,
  done,
}: {
  practices: InteractivePractice[];
  done: Set<string>;
}) {
  const [open, setOpen] = useState(true);
  const completedCount = practices.filter((p) => done.has(p.id)).length;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 px-1 py-2 text-left"
      >
        <span className="text-xl">✨</span>
        <span className="flex-1 font-display text-base text-foreground">Интерактивные</span>
        {completedCount > 0 && (
          <span className="text-xs text-primary font-medium">
            {completedCount}/{practices.length}
          </span>
        )}
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="interactive-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 pb-2">
              {practices.map((p) => (
                <InteractivePracticeCard
                  key={p.id}
                  id={p.id}
                  emoji={p.emoji}
                  title={p.title}
                  duration={p.duration}
                  done={done.has(p.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Category accordion ───────────────────────────────────────────────────────

function CategorySection({
  category,
  done,
  defaultOpen,
  unlocked,
}: {
  category: Category;
  done: Set<string>;
  defaultOpen: boolean;
  unlocked: Set<string>;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const unlockedPractices = category.practices.filter((p) => !p.locked || unlocked.has(p.id));
  const completedCount = unlockedPractices.filter((p) => done.has(p.id)).length;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 px-1 py-2 text-left"
      >
        <span className="text-xl">{category.emoji}</span>
        <span className="flex-1 font-display text-base text-foreground">
          {category.title}
        </span>
        {completedCount > 0 && (
          <span className="text-xs text-primary font-medium">
            {completedCount}/{unlockedPractices.length}
          </span>
        )}
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="cat-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 pb-2">
              {category.practices.map((p) =>
                p.locked && !unlocked.has(p.id) ? (
                  <LockedPracticeCard
                    key={p.id}
                    practice={p as Practice & { locked: true; unlockCost: number }}
                  />
                ) : (
                  <PracticeCard key={p.id} practice={p} done={done.has(p.id)} />
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sphere → category mapping for recommendations ───────────────────────────

const SPHERE_CATEGORIES: Record<string, string[]> = {
  relationships: ["relations"],
  health: ["body", "health"],
  career: ["mind"],
  growth: ["mind", "discharge"],
  family: ["relations"],
  finance: ["mind"],
  rest: ["presence", "discharge"],
  people: ["relations"],
};

const SPHERE_LABELS: Record<string, string> = {
  relationships: "Отношения", health: "Здоровье", career: "Карьера",
  growth: "Развитие", family: "Семья", finance: "Финансы", rest: "Отдых", people: "Окружение",
};

function RecommendedSection({
  sphere,
  done,
  unlocked,
}: {
  sphere: string;
  done: Set<string>;
  unlocked: Set<string>;
}) {
  const catIds = SPHERE_CATEGORIES[sphere] ?? [];
  const candidates = CATEGORIES
    .filter((c) => catIds.includes(c.id))
    .flatMap((c) => c.practices)
    .filter((p) => !p.locked || unlocked.has(p.id))
    .slice(0, 3);

  if (!candidates.length) return null;

  return (
    <div className="mb-4">
      <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        Для тебя · {SPHERE_LABELS[sphere] ?? sphere}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {candidates.map((p) => (
          <Link
            key={p.id}
            to="/practices/$practiceId"
            params={{ practiceId: p.id }}
            className={`flex-none w-44 rounded-2xl border px-3 py-3 backdrop-blur-sm transition-all hover:border-primary/40 active:scale-[0.98] ${
              done.has(p.id)
                ? "border-primary/50 bg-primary/5"
                : "border-border/60 bg-card/60"
            }`}
          >
            <p className={`text-xs font-medium leading-snug line-clamp-2 ${done.has(p.id) ? "text-foreground/60 line-through" : "text-foreground"}`}>
              {p.title}
            </p>
            <p className="mt-1.5 text-[10px] text-muted-foreground">{p.duration}</p>
            <p className="mt-0.5 text-[9px] text-muted-foreground/40">Практикуют {12 + (p.id.charCodeAt(0) % 40)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

function PracticesScreen() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [newUnlocks, setNewUnlocks] = useState<string[]>([]);
  const [serverStreak, setServerStreak] = useState(0);
  const [checkinScore, setCheckinScore] = useState(5);
  const [checkinSaved, setCheckinSaved] = useState(false);
  const [checkinSaving, setCheckinSaving] = useState(false);
  const [practiceOfDay, setPracticeOfDay] = useState<CatalogPractice | null>(null);
  // Interactive practices unlocked via journey completion or shop purchase
  const [interactiveUnlocked, setInteractiveUnlocked] = useState<Set<string>>(new Set());
  const [lastCompletedSphere, setLastCompletedSphere] = useState<string | null>(null);
  const fetchStats = useServerFn(getUserStats);
  const doCheckin = useServerFn(submitCheckin);
  const fetchPremium = useServerFn(checkPremiumStatus);
  const [isPremium, setIsPremium] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPremium().then(({ isPremium: p }) => setIsPremium(p)).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const currentDone = loadDone();
    const currentStreak = computeStreak();
    const currentUnlocked = getUnlockedPractices();
    setDone(currentDone);
    setStreak(currentStreak);
    setUnlocked(currentUnlocked);

    fetchStats().then(({ profile: p, history: h }) => {
      // Extract last completed sphere from queue
      const queue = p.sphere_queue ?? [];
      const lastCompleted = [...queue].reverse().find((e) => e.status === "completed");
      if (lastCompleted) setLastCompletedSphere(lastCompleted.sphere_id);
      const journeyCount = h.filter((j) => (j as { status: string }).status === "completed").length;
      const sStreak = p.practice_streak ?? 0;
      setServerStreak(sStreak);

      // Interactive practices unlocked = those stored in purchased_practices
      // (written by completeJourney when user completes a practice in a journey)
      const available = new Set<string>(p.purchased_practices as string[] ?? []);
      setInteractiveUnlocked(available);

      if (p.last_checkin_at) {
        const todayStr = getTodayKey();
        const checkinDate = new Date(p.last_checkin_at);
        const checkinStr = `${checkinDate.getFullYear()}-${checkinDate.getMonth() + 1}-${checkinDate.getDate()}`;
        if (checkinStr === todayStr) {
          setCheckinSaved(true);
          setPracticeOfDay(pickPracticeOfDay(p.last_checkin_score ?? null));
        }
      }

      const freshUnlocks: string[] = [];
      for (const m of MILESTONES) {
        if (m.rewardType !== "practice") continue;
        if (currentUnlocked.has(m.id)) continue;
        const effectiveStreak = Math.max(currentStreak, sStreak);
        const meetsJourneys = m.journeysRequired ? journeyCount >= m.journeysRequired : true;
        const meetsStreak = m.streakRequired ? effectiveStreak >= m.streakRequired : true;
        const meetsXp = m.xpRequired ? (p.xp_total ?? 0) >= m.xpRequired : true;
        if (meetsJourneys && meetsStreak && meetsXp) {
          saveUnlockedPractice(m.id);
          freshUnlocks.push(m.rewardLabel);
        }
      }

      if (freshUnlocks.length > 0) {
        setUnlocked(getUnlockedPractices());
        setNewUnlocks(freshUnlocks);
      }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheckin = async () => {
    setCheckinSaving(true);
    try {
      await doCheckin({ data: { score: checkinScore } });
      setCheckinSaved(true);
      setPracticeOfDay(pickPracticeOfDay(checkinScore));
    } catch {
      /* non-blocking */
    } finally {
      setCheckinSaving(false);
    }
  };

  const totalDone = done.size;
  const totalPractices = CATEGORIES.reduce(
    (s, c) => s + c.practices.filter((p) => !p.locked || unlocked.has(p.id)).length,
    0,
  );

  const { vy } = useAddress();
  const effectiveStreak = Math.max(streak, serverStreak);

  const filteredCategories = searchQuery.trim()
    ? CATEGORIES.map((cat) => ({
        ...cat,
        practices: cat.practices.filter((p) => {
          const q = searchQuery.toLowerCase();
          return p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || cat.title.toLowerCase().includes(q);
        }),
      })).filter((cat) => cat.practices.length > 0)
    : CATEGORIES;

  const LeftPanel = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="flex flex-col gap-4"
    >
      <Link
        to="/home"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Мой мир
      </Link>

      <div>
        <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Каждый день
        </p>
        <h1 className="font-display text-2xl md:text-3xl text-glow mt-0.5">
          {vy ? "Ваши практики" : "Твои практики"}
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Маленькие действия, которые поддерживают работу между путешествиями.
        </p>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Спроси у Евы..."
          className="mt-3 w-full rounded-xl border border-border/40 bg-card/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
        />
      </div>

      {/* Premium CTA strip */}
      {!isPremium && (
        <div className="text-center">
          <PremiumCTA format="a" context="practices" />
        </div>
      )}

      {/* Progress strip */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}>
        <GlassCard className="p-4">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-muted-foreground">Сегодня выполнено</span>
            <span className="font-display text-lg text-foreground leading-none">
              {totalDone} / {totalPractices}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${totalPractices > 0 ? (totalDone / totalPractices) * 100 : 0}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          {effectiveStreak >= 2 && (
            <p className="mt-3 text-xs text-muted-foreground">
              🔥 {effectiveStreak} {effectiveStreak < 5 ? "дня" : "дней"} подряд — так держать!
            </p>
          )}
          {totalDone === totalPractices && totalPractices > 0 && (
            <p className="mt-3 text-xs font-medium text-primary">
              ✨ Все практики дня выполнены · +{totalDone * 5} XP заработано
            </p>
          )}
        </GlassCard>
      </motion.div>

      {/* Чек-ин состояния */}
      <AnimatePresence mode="wait">
        {!checkinSaved ? (
          <motion.div
            key="checkin-form"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-border/40 bg-card/50 px-4 py-3"
          >
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-1">
              {vy ? "Как вы сейчас?" : "Как ты сейчас?"}
            </p>
            <p className="text-xs text-muted-foreground/70 mb-3">0 — очень тяжело · 10 — отлично</p>
            <Slider010 value={checkinScore} onChange={setCheckinScore} />
            <button
              type="button"
              onClick={handleCheckin}
              disabled={checkinSaving}
              className="mt-3 w-full rounded-xl bg-primary/15 py-2 text-xs font-medium text-primary transition hover:bg-primary/25 disabled:opacity-40"
            >
              {checkinSaving ? "Сохраняю…" : "Сохранить"}
            </button>
          </motion.div>
        ) : practiceOfDay ? (
          <motion.div
            key="practice-of-day"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3"
          >
            <p className="text-[9px] uppercase tracking-[0.25em] text-primary/70 mb-1">Практика дня</p>
            <p className="font-display text-base">{practiceOfDay.title}</p>
            <p className="text-xs text-muted-foreground/70 mt-1 leading-relaxed">{practiceOfDay.descShort}</p>
            <p className="mt-1.5 text-[10px] text-muted-foreground/50">{practiceOfDay.duration}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Milestone unlock banner */}
      <AnimatePresence>
        {newUnlocks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl border border-primary/40 bg-primary/5 px-4 py-3"
          >
            <p className="text-xs font-medium text-primary">🔓 Разблокировано за достижения:</p>
            {newUnlocks.map((label) => (
              <p key={label} className="mt-1 text-xs text-foreground/80">• {label}</p>
            ))}
            <button type="button" onClick={() => setNewUnlocks([])} className="mt-2 text-[10px] text-muted-foreground underline">
              закрыть
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop: streak calendar hint */}
      {effectiveStreak > 0 && (
        <div className="hidden md:block rounded-2xl border border-border/40 bg-card/50 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Стрик практик</p>
          <div className="flex gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => {
              const filled = i < Math.min(effectiveStreak, 7);
              return (
                <div
                  key={i}
                  className={`h-4 flex-1 rounded-sm transition-all ${filled ? "bg-primary/70" : "bg-muted/30"}`}
                />
              );
            })}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground/60">
            {effectiveStreak} из 7 дней этой недели
          </p>
        </div>
      )}
    </motion.div>
  );

  return (
    <main className="relative bg-[#F9F4EE]">
      <AmbientBackground theme="safe" />

      {/* ══ MOBILE ══ */}
      <div className="relative z-10 md:hidden h-[100dvh] overflow-hidden flex flex-col">
        <div className="px-5 pt-5 pb-3 flex-none">
          {LeftPanel}
        </div>
        <div className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="px-5 pb-8 pt-2 flex flex-col gap-1 divide-y divide-border/30"
          >
            {lastCompletedSphere && (
              <div className="pt-1 pb-2">
                <RecommendedSection sphere={lastCompletedSphere} done={done} unlocked={unlocked} />
              </div>
            )}
            {interactiveUnlocked.size > 0 && (
              <div className="pt-1">
                <InteractivePracticesSection
                  practices={INTERACTIVE_PRACTICES.filter((p) => interactiveUnlocked.has(p.id))}
                  done={done}
                />
              </div>
            )}
            {filteredCategories.map((cat, i) => (
              <div key={cat.id} className="pt-1">
                <CategorySection
                  category={cat}
                  done={done}
                  defaultOpen={i === 0}
                  unlocked={unlocked}
                />
              </div>
            ))}
            <p className="pt-6 text-center text-[11px] leading-relaxed text-muted-foreground/60">
              Практики обновляются каждый день.<br />Выполненные сегодня засчитываются в streak.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ══ DESKTOP ══ */}
      <div className="hidden md:grid md:grid-cols-[2fr_3fr] h-[100dvh] relative z-10">
        <div
          className="h-full overflow-y-auto border-r border-border/30 px-10 py-10"
          style={{ paddingTop: "max(env(safe-area-inset-top), 2.5rem)" }}
        >
          {LeftPanel}
        </div>
        <div
          className="h-full overflow-y-auto px-10 py-10"
          style={{ paddingTop: "max(env(safe-area-inset-top), 2.5rem)" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="flex flex-col gap-1 divide-y divide-border/30 pb-10"
          >
            {lastCompletedSphere && (
              <div className="pt-1 pb-2">
                <RecommendedSection sphere={lastCompletedSphere} done={done} unlocked={unlocked} />
              </div>
            )}
            {interactiveUnlocked.size > 0 && (
              <div className="pt-1">
                <InteractivePracticesSection
                  practices={INTERACTIVE_PRACTICES.filter((p) => interactiveUnlocked.has(p.id))}
                  done={done}
                />
              </div>
            )}
            {filteredCategories.map((cat, i) => (
              <div key={cat.id} className="pt-1">
                <CategorySection
                  category={cat}
                  done={done}
                  defaultOpen={i <= 1}
                  unlocked={unlocked}
                />
              </div>
            ))}
            <p className="pt-6 text-center text-[11px] leading-relaxed text-muted-foreground/60">
              Практики обновляются каждый день.<br />Выполненные сегодня засчитываются в streak.
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
