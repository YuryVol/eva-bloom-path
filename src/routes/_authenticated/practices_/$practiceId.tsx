import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Lock, Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AmbientBackground } from "@/components/eva/AmbientBackground";
import { GlassCard } from "@/components/eva/GlassCard";
import { GlowButton } from "@/components/eva/GlowButton";
import { useAddress } from "@/lib/use-address";
import {
  ALL_PRACTICES,
  MOOD_MAP,
  getUnlockedPractices,
  saveUnlockedPractice,
  loadDone,
  saveDone,
} from "@/lib/practices-local";
import { MILESTONES } from "@/lib/milestones";
import { getUserStats, recordPractice, purchaseShopItem } from "@/lib/journey.functions";

export const Route = createFileRoute("/_authenticated/practices_/$practiceId")({
  component: PracticeDetailScreen,
});

function PracticeDetailScreen() {
  const { practiceId } = Route.useParams();
  const navigate = useNavigate();
  const { vy } = useAddress();

  const fetchStats = useServerFn(getUserStats);
  const doRecord = useServerFn(recordPractice);
  const doUnlock = useServerFn(purchaseShopItem);

  const entry = ALL_PRACTICES[practiceId];

  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [done, setDone] = useState(false);
  const [coins, setCoins] = useState(0);
  const [unlocking, setUnlocking] = useState(false);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    const localUnlocked = getUnlockedPractices();
    const localDone = loadDone();
    setDone(localDone.has(practiceId));

    fetchStats().then(({ profile: p, history: h }) => {
      setCoins(p.coins_total ?? 0);
      const journeyCount = h.filter((j) => (j as { status: string }).status === "completed").length;
      const sStreak = p.practice_streak ?? 0;
      const xp = p.xp_total ?? 0;

      for (const m of MILESTONES) {
        if (m.rewardType !== "practice") continue;
        if (localUnlocked.has(m.id)) continue;
        const meetsJourneys = m.journeysRequired ? journeyCount >= m.journeysRequired : true;
        const meetsStreak = m.streakRequired ? sStreak >= m.streakRequired : true;
        const meetsXp = m.xpRequired ? xp >= m.xpRequired : true;
        if (meetsJourneys && meetsStreak && meetsXp) {
          saveUnlockedPractice(m.id);
        }
      }
      setUnlocked(getUnlockedPractices());
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceId]);

  if (!entry) {
    return (
      <main className="relative min-h-[100dvh] bg-[#F9F4EE] flex items-center justify-center">
        <AmbientBackground theme="safe" />
        <div className="relative z-10 text-center px-6">
          <p className="text-muted-foreground">Практика не найдена.</p>
          <Link to="/practices" className="mt-4 inline-block text-sm text-primary underline">← Практики</Link>
        </div>
      </main>
    );
  }

  const { practice, category } = entry;
  const isLocked = practice.locked && !unlocked.has(practice.id);
  const cost = practice.unlockCost ?? 0;
  const canAfford = coins >= cost;

  const desc = typeof practice.description === "string"
    ? practice.description
    : vy ? practice.description.vy : practice.description.ty;

  const mood = MOOD_MAP[practice.id];

  const handleDone = async () => {
    if (done || recording) return;
    setRecording(true);
    const next = new Set(loadDone());
    next.add(practiceId);
    saveDone(next);
    setDone(true);
    try {
      const res = await doRecord({ data: { practiceId } });
      if (res.xp) toast.success(`+${res.xp} XP · +${res.coins} монет${res.streak > 1 ? ` (стрик ${res.streak})` : ""}`);
    } catch {
      /* best-effort */
    } finally {
      setRecording(false);
    }
  };

  const handleUnlock = async () => {
    if (unlocking || !canAfford) return;
    setUnlocking(true);
    try {
      await doUnlock({ data: { item_id: practiceId, item_category: "practice", coins: cost } });
      saveUnlockedPractice(practiceId);
      setUnlocked((prev) => { const next = new Set(prev); next.add(practiceId); return next; });
      setCoins((prev) => prev - cost);
      toast.success(`Практика открыта! −${cost} монет`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось открыть");
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <main className="relative min-h-[100dvh] bg-[#F9F4EE]">
      <AmbientBackground theme="safe" />

      <div className="relative z-10 mx-auto max-w-lg px-5 py-6" style={{ paddingTop: "max(env(safe-area-inset-top), 1.5rem)" }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-5"
        >
          {/* Back link */}
          <Link
            to="/practices"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Практики
          </Link>

          {/* Category badge */}
          <p className="text-xs text-muted-foreground/70">
            {category.emoji} {category.title}
          </p>

          {/* Title & meta */}
          <div>
            <h1 className={`font-display text-3xl text-glow leading-tight ${isLocked ? "text-foreground/40" : ""}`}>
              {practice.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">{practice.duration}</span>
              {mood === "grounding" && (
                <span className="rounded-full bg-green-100/70 px-2 py-0.5 text-[10px] font-medium text-green-700/80">🌿 ежедневная</span>
              )}
              {mood === "deep" && (
                <span className="rounded-full bg-amber-100/70 px-2 py-0.5 text-[10px] font-medium text-amber-800/70">✦ глубокая</span>
              )}
              {done && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary flex items-center gap-1">
                  <Check className="size-3" strokeWidth={2.5} />
                  Выполнено сегодня
                </span>
              )}
            </div>
          </div>

          {/* Description / locked state */}
          <GlassCard className="p-5">
            {isLocked ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <Lock className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground/60">
                  Эта практика закрыта. {vy ? "Разблокируйте её" : "Разблокируй её"} за монеты, чтобы получить доступ к полному описанию.
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {vy ? "Ваш баланс:" : "Твой баланс:"} <strong className="text-foreground">{coins} 🪙</strong>
                  </span>
                  <button
                    type="button"
                    disabled={unlocking || !canAfford}
                    onClick={handleUnlock}
                    title={canAfford ? undefined : "Недостаточно монет"}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
                      canAfford
                        ? "border-amber-300/60 bg-amber-50/40 text-amber-700/80 hover:bg-amber-50/70"
                        : "border-border/40 bg-card/20 text-muted-foreground/40 cursor-not-allowed"
                    }`}
                  >
                    {unlocking ? "…" : canAfford ? `🪙 Открыть за ${cost}` : `🔒 ${cost} монет`}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-foreground/80">{desc}</p>
            )}
          </GlassCard>

          {/* Done button */}
          {!isLocked && (
            <div className="flex flex-col items-center gap-2">
              <GlowButton
                onClick={handleDone}
                disabled={done || recording}
                className="w-full"
              >
                {recording ? "Сохраняю…" : done ? "Выполнено сегодня ✓" : "Выполнено"}
              </GlowButton>
              {!done && (
                <p className="text-xs text-muted-foreground/60">+5 XP · +2 монеты за выполнение</p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
