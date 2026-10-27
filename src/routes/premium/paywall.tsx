import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import { activatePremiumMock } from "@/lib/premium.functions";
import { getAppConfig } from "@/lib/app-config";
import { AmbientBackground } from "@/components/eva/AmbientBackground";

export const Route = createFileRoute("/premium/paywall")({
  component: PaywallPage,
});

const PLANS = [
  {
    id: "monthly",
    label: "Месяц",
    price: "1 990 ₽",
    sub: "в месяц",
    badge: null,
  },
  {
    id: "annual",
    label: "Год",
    price: "9 990 ₽",
    sub: "832 ₽ в месяц",
    badge: "Экономия 58%",
  },
];

const PERKS = [
  { icon: "🧭", text: "Неограниченные путешествия" },
  { icon: "🧘", text: "Все практики: Релаксация и Гармонизация" },
  { icon: "📖", text: "Живой дневник Евы" },
  { icon: "🌍", text: "30 состояний Мира Евы" },
  { icon: "🔮", text: "Хранители сфер — твои проводники" },
  { icon: "⭐", text: "XP и монеты ×1.5" },
  { icon: "🤝", text: "Скидки у партнёров EVA+" },
];

function Confetti() {
  const items = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {items.map((i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: `${(i / 24) * 100}vw`, opacity: 1, scale: 1 }}
          animate={{ y: "110vh", rotate: Math.random() * 720 - 360, opacity: 0 }}
          transition={{ duration: 2.5 + Math.random() * 1.5, ease: "easeIn", delay: Math.random() * 0.5 }}
          className="absolute h-3 w-3 rounded-sm"
          style={{ background: ["#f59e0b", "#fbbf24", "#fde68a", "#a78bfa", "#fb923c"][i % 5] }}
        />
      ))}
    </div>
  );
}

function PaywallPage() {
  const navigate = useNavigate();
  const activate = useServerFn(activatePremiumMock);
  const fetchAppConfig = useServerFn(getAppConfig);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchAppConfig()
      .then((cfg) => { if (!cfg.isPremiumApp) navigate({ to: "/home" as never }); })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleActivate = async () => {
    setLoading(true);
    await activate().catch(() => {});
    setSuccess(true);
    setTimeout(() => navigate({ to: "/home" as never }), 3000);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-5 py-8">
      <AmbientBackground theme="safe" />
      {success && <Confetti />}

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-sm"
          >
            <div className="text-6xl mb-4">✨</div>
            <h2 className="font-display text-2xl font-semibold mb-3">Добро пожаловать в EVA+</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Ева рада видеть тебя здесь. Твой мир стал богаче — начни новое путешествие.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="paywall"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            {/* Header */}
            <div className="text-center mb-6">
              <span className="text-5xl">✨</span>
              <h1 className="mt-3 font-display text-2xl font-semibold">EVA+</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">Полный доступ к твоему пути</p>
            </div>

            {/* Perks */}
            <div className="mb-6 space-y-2">
              {PERKS.map((p) => (
                <div key={p.text} className="flex items-center gap-3 rounded-xl bg-card/60 px-3 py-2.5 border border-border/30">
                  <span className="text-lg">{p.icon}</span>
                  <span className="text-sm text-foreground/90">{p.text}</span>
                </div>
              ))}
            </div>

            {/* Plans */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlan(plan.id as "monthly" | "annual")}
                  className={[
                    "relative rounded-2xl border p-4 text-left transition",
                    selectedPlan === plan.id
                      ? "border-amber-400 bg-amber-50/80 shadow-md shadow-amber-200/40"
                      : "border-border/50 bg-card/60 hover:border-amber-300/60",
                  ].join(" ")}
                >
                  {plan.badge && (
                    <span className="absolute -top-2 right-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-white">
                      {plan.badge}
                    </span>
                  )}
                  <p className="font-medium text-sm">{plan.label}</p>
                  <p className="mt-1 font-display text-xl font-bold text-amber-600">{plan.price}</p>
                  <p className="text-[11px] text-muted-foreground">{plan.sub}</p>
                </button>
              ))}
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={handleActivate}
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 py-4 text-sm font-semibold text-white shadow-lg shadow-amber-400/30 transition hover:from-amber-500 hover:to-amber-600 disabled:opacity-60"
            >
              {loading ? "Активация…" : "Оформить EVA+"}
            </button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Демо-версия · Реальная оплата не производится
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/home" as never })}
              className="mt-2 w-full rounded-2xl py-2.5 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Вернуться назад
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
