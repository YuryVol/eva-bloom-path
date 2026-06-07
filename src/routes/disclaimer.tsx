import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, AlertCircle, Phone, X } from "lucide-react";
import { GlowButton } from "@/components/eva/GlowButton";
import { useOnboardingDraft } from "@/lib/onboarding-store";

export const Route = createFileRoute("/disclaimer")({
  component: DisclaimerScreen,
  head: () => ({ meta: [{ title: "О ЕВЕ — важное" }] }),
});

const EMERGENCY_LINES = [
  {
    category: "Единый экстренный номер",
    items: [{ name: "Скорая, пожарные, полиция", number: "112" }],
  },
  {
    category: "Психологическая помощь",
    items: [
      { name: "Телефон доверия (бесплатно, круглосуточно)", number: "8-800-2000-122" },
      { name: "Кризисная линия психологической помощи", number: "8-800-100-49-94" },
      { name: "Московская служба психологической помощи", number: "051" },
    ],
  },
  {
    category: "Медицинская и социальная помощь",
    items: [
      { name: "Скорая медицинская помощь", number: "103" },
      { name: "Полиция", number: "102" },
      { name: "Социальная служба экстренной помощи", number: "8-800-444-22-00" },
    ],
  },
  {
    category: "Помощь в кризисных ситуациях",
    items: [
      { name: "Помощь при насилии (Национальный центр)", number: "8-800-7000-600" },
      { name: "Телефон доверия для детей и подростков", number: "8-800-2000-122" },
    ],
  },
];

function EmergencyModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 mx-4 mb-4 w-full max-w-md rounded-3xl bg-[#F9F4EE] p-6 shadow-2xl sm:mb-0"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-foreground">Экстренная помощь</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          Все номера бесплатны и работают круглосуточно, если не указано иное.
        </p>
        <div className="flex max-h-[60dvh] flex-col gap-5 overflow-y-auto pr-1">
          {EMERGENCY_LINES.map((section) => (
            <div key={section.category}>
              <p className="mb-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                {section.category}
              </p>
              <div className="flex flex-col gap-2">
                {section.items.map((item) => (
                  <div
                    key={item.number}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/80 px-4 py-3"
                  >
                    <p className="text-xs leading-snug text-foreground/80">{item.name}</p>
                    <a
                      href={`tel:${item.number.replace(/\D/g, "")}`}
                      className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 font-display text-sm text-primary transition hover:bg-primary/20"
                    >
                      <Phone className="size-3" strokeWidth={2} />
                      {item.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground/70">
          Если вам плохо — вы не одна. Помощь есть, и вы заслуживаете её.
        </p>
      </motion.div>
    </motion.div>
  );
}

function DisclaimerScreen() {
  const navigate = useNavigate();
  const { set } = useOnboardingDraft();
  const [ready, setReady] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const handleNext = () => {
    set({ disclaimer_seen: true });
    navigate({ to: "/about-you" });
  };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#F9F4EE]">
      {/* Background scene */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
        style={{ backgroundImage: "url(/assets/eva/disclaimer-bg.png)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#F9F4EE]/40 via-[#F9F4EE]/10 to-[#F9F4EE]/95"
      />

      {/* Sparkle lights around title */}
      <Sparkles />

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-end px-6 pb-10 pt-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <h1 className="font-display text-6xl tracking-[0.18em] text-glow md:text-7xl">
            ЕВА
          </h1>
          <p className="mt-3 font-display text-lg leading-snug text-foreground/85 md:text-xl">
            Пространство
            <br />
            бережной эмоциональной поддержки
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-8 flex w-full max-w-md flex-col gap-4"
        >
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card/70 px-5 py-4 backdrop-blur-sm">
            <div className="flex size-10 items-center justify-center rounded-full bg-[#C5D8E8]/60">
              <Heart className="size-5 text-[#5a7a9a]" strokeWidth={1.6} />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Приложение не заменяет помощь психолога, психотерапевта, врача
              или экстренную помощь и не ставит диагнозы.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card/70 px-5 py-4 backdrop-blur-sm">
            <div className="flex size-10 items-center justify-center rounded-full bg-[#E8A07A]/30">
              <AlertCircle className="size-5 text-[#c47a52]" strokeWidth={1.8} />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Если вам нужна срочная помощь или вы чувствуете, что не
              справляетесь с состоянием — важно обратиться к живому специалисту
              или в{" "}
              <button
                type="button"
                onClick={() => setShowEmergency(true)}
                className="font-medium text-foreground underline underline-offset-2 transition hover:text-primary"
              >
                экстренные службы
              </button>
              .
            </p>
          </div>
        </motion.div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <GlowButton onClick={handleNext} disabled={!ready}>
            {ready ? "Продолжить" : "…"}
          </GlowButton>
        </div>
      </div>

      <AnimatePresence>
        {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} />}
      </AnimatePresence>
    </main>
  );
}

function Sparkles() {
  const dots = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[5]">
      {dots.map((i) => {
        const left = (i * 53) % 100;
        const top = 5 + ((i * 37) % 55);
        const delay = (i % 9) * 0.4;
        const duration = 2.4 + (i % 5) * 0.6;
        const size = 2 + (i % 3);
        return (
          <motion.span
            key={i}
            className="absolute rounded-full bg-[#FFF8D6]"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              boxShadow: "0 0 10px 3px rgba(255,243,180,0.85)",
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.6] }}
            transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
          />
        );
      })}
    </div>
  );
}
