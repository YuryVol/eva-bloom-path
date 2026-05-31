import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, AlertCircle } from "lucide-react";
import { GlowButton } from "@/components/eva/GlowButton";
import { useOnboardingDraft } from "@/lib/onboarding-store";

export const Route = createFileRoute("/disclaimer")({
  component: DisclaimerScreen,
  head: () => ({ meta: [{ title: "О ЕВЕ — важное" }] }),
});

function DisclaimerScreen() {
  const navigate = useNavigate();
  const { set } = useOnboardingDraft();
  const [ready, setReady] = useState(false);

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
              или в экстренные службы.
            </p>
          </div>
        </motion.div>

        <div className="mt-10 flex flex-col items-center gap-4">
          <GlowButton onClick={handleNext} disabled={!ready}>
            {ready ? "Продолжить" : "…"}
          </GlowButton>
        </div>
      </div>
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
