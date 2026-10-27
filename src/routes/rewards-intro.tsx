import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { GlowButton } from "@/components/eva/GlowButton";
import { useAddress } from "@/lib/use-address";

export const Route = createFileRoute("/rewards-intro")({
  component: RewardsIntroScreen,
  head: () => ({ meta: [{ title: "Как устроен мир ЕВА" }] }),
});

const COINS_ITEMS = [
  { icon: "🔓", label: "Особые практики", desc: "Дополнительные техники для глубокой работы" },
  { icon: "🎨", label: "Тема интерфейса", desc: "Альтернативный стиль оформления" },
];

const XP_ITEMS: Array<{ icon: string; label: string; desc: string | { ty: string; vy: string } }> = [
  { icon: "🏆", label: "Рейтинг среди игроков", desc: { ty: "Твоё место в общем пространстве", vy: "Ваше место в общем пространстве" } },
  { icon: "🗺️", label: "Новые уровни", desc: "Открываются территории и возможности" },
];

function RewardsIntroScreen() {
  const a = useAddress();
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#F9F4EE] px-6 py-10">
      {/* Soft ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 20%, oklch(0.93 0.06 80 / 0.5), transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <p className="text-center text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Как устроен мир ЕВА
        </p>
        <h1 className="mt-3 text-center font-display text-3xl text-glow md:text-4xl">
          {a.vy ? "Ваш путь приносит награды" : "Твой путь приносит награды"}
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-center text-sm leading-relaxed text-muted-foreground">
          {a.vy ? "За каждый шаг вы получаете монеты и очки опыта — вот на что они нужны." : "За каждый шаг ты получаешь монеты и очки опыта — вот на что они нужны."}
        </p>

        {/* Two-column scheme */}
        <div className="mt-8 grid grid-cols-2 gap-4">
          {/* Coins */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="flex flex-col gap-3 rounded-2xl border border-amber-300/40 bg-amber-50/60 px-4 py-5 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪙</span>
              <p className="font-display text-lg text-foreground">Монеты</p>
            </div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Трать на:
            </p>
            <div className="flex flex-col gap-2">
              {COINS_ITEMS.map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <span className="mt-0.5 text-base leading-none">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground/90">{item.label}</p>
                    <p className="text-[11px] leading-snug text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* XP */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="flex flex-col gap-3 rounded-2xl border border-violet-300/40 bg-violet-50/60 px-4 py-5 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <p className="font-display text-lg text-foreground">Опыт (XP)</p>
            </div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              Открывает:
            </p>
            <div className="flex flex-col gap-2">
              {XP_ITEMS.map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <span className="mt-0.5 text-base leading-none">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground/90">{item.label}</p>
                    <p className="text-[11px] leading-snug text-muted-foreground">
                      {typeof item.desc === "string" ? item.desc : a.vy ? item.desc.vy : item.desc.ty}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Flow hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.7 }}
          className="mt-5 rounded-2xl border border-border/50 bg-card/60 px-5 py-4 text-center backdrop-blur-sm"
        >
          <p className="text-xs leading-relaxed text-muted-foreground">
            {a.vy
              ? "Чем честнее и глубже вы работаете — тем больше получаете. Свои слова всегда ценятся выше подсказок."
              : "Чем честнее и глубже ты работаешь — тем больше получаешь. Свои слова всегда ценятся выше подсказок."
            }
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-8 flex justify-center"
        >
          <GlowButton
            onClick={() => {
              if (typeof window !== "undefined") {
                sessionStorage.setItem("eva:spheres-intro", "1");
              }
              navigate({ to: "/journey/spheres" });
            }}
          >
            Давай попробуем
          </GlowButton>
        </motion.div>
      </motion.div>
    </main>
  );
}
