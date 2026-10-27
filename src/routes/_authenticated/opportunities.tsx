import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, CheckCircle2, ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/eva/GlassCard";
import { AmbientBackground } from "@/components/eva/AmbientBackground";
import { getUserStats, purchaseShopItem } from "@/lib/journey.functions";
import { checkPremiumStatus } from "@/lib/premium.functions";
import { PremiumCTA } from "@/components/premium/PremiumCTA";
import {
  SHOP_ITEMS,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  type ShopCategory,
  type ShopItem,
} from "@/lib/shop-catalog";

export const Route = createFileRoute("/_authenticated/opportunities")({
  component: OpportunitiesScreen,
  head: () => ({ meta: [{ title: "Возможности — ЕВА" }] }),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLevel(xp: number) {
  return Math.min(10, Math.floor(xp / 150) + 1);
}

// ─── Shop item card ───────────────────────────────────────────────────────────

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
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
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

function OpportunitiesScreen() {
  const navigate = useNavigate();
  const fetchStats = useServerFn(getUserStats);
  const fetchPremium = useServerFn(checkPremiumStatus);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    fetchPremium().then(({ isPremium: p }) => setIsPremium(p)).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    xp_total: 0,
    coins_total: 0,
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
        setProfile({
          xp_total: (p as typeof profile).xp_total,
          coins_total: (p as typeof profile).coins_total,
          purchased_practices: (p as typeof profile).purchased_practices ?? [],
          shop_purchase_map: (p as typeof profile).shop_purchase_map ?? {},
        });
        setHistory(h);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const level = getLevel(profile.xp_total);

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
          <h1 className="font-display text-xl text-glow leading-tight">Возможности</h1>
        </div>
        {!loading && (
          <span className="flex items-center gap-1 rounded-full border border-amber-200/60 bg-amber-50/60 px-3 py-1 text-sm font-medium text-amber-700">
            🪙 {profile.coins_total}
          </span>
        )}
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 pb-12 pt-5">

        {loading && (
          <div className="mt-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted/30" />
            ))}
          </div>
        )}

        {!loading && (
          <div className="space-y-8">

            {/* Premium CTA */}
            {!isPremium && (
              <PremiumCTA format="b" context="opportunities" />
            )}

            {/* Возможности / ShopSection */}
            <ShopSection
              coins={profile.coins_total}
              level={level}
              purchased={profile.purchased_practices}
              onPurchase={(itemId, newCoins) =>
                setProfile((p) => ({
                  ...p,
                  coins_total: newCoins,
                  purchased_practices: [...p.purchased_practices, itemId],
                }))
              }
            />

            {/* История покупок */}
            {profile.purchased_practices.length > 0 && (
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  История покупок
                </p>
                <div className="space-y-2">
                  {profile.purchased_practices.map((id) => {
                    const item = SHOP_ITEMS.find((s) => s.id === id);
                    if (!item) return null;
                    const boughtAt = profile.shop_purchase_map[id] ?? null;
                    const isShopPurchase = Boolean(boughtAt);
                    const journeyDate = !isShopPurchase
                      ? history.find(
                          (j) =>
                            j.status === "completed" &&
                            (j.state as Record<string, unknown>)?.selected_practice_key === id
                        )?.completed_at ?? null
                      : null;
                    const dateStr = (boughtAt ?? journeyDate)
                      ? new Date(boughtAt ?? journeyDate!).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
                      : null;
                    const openItem = () => {
                      if (item.url) { window.open(item.url, "_blank", "noopener,noreferrer"); return; }
                      if (item.practiceRoute) { navigate({ to: item.practiceRoute as never }); }
                    };
                    const isNavigable = Boolean(item.url || item.practiceRoute);
                    return (
                      <GlassCard
                        key={id}
                        className={`flex items-center gap-3 px-4 py-3 transition-all ${isNavigable ? "cursor-pointer hover:bg-card/80 hover:shadow-sm active:scale-[0.99]" : ""}`}
                        onClick={isNavigable ? openItem : undefined}
                      >
                        <span className="text-xl leading-none">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-display leading-tight">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground/60">{CATEGORY_LABELS[item.category]}</p>
                        </div>
                        {isShopPurchase ? (
                          <span className="shrink-0 text-xs text-amber-600">🪙 {item.coins}</span>
                        ) : (
                          <span className="shrink-0 text-xs text-muted-foreground/60">
                            Получено{dateStr ? ` ${dateStr}` : ""}
                          </span>
                        )}
                        {isNavigable && (
                          <span className="shrink-0 text-xs text-muted-foreground/40">→</span>
                        )}
                      </GlassCard>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </main>
  );
}
