import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { AmbientBackground } from "@/components/eva/AmbientBackground";
import { GlowButton } from "@/components/eva/GlowButton";
import { supabase } from "@/integrations/supabase/client";
import { useOnboardingDraft } from "@/lib/onboarding-store";
import { getOnboarding, upsertOnboarding } from "@/lib/onboarding.functions";
import evaLogo from "@/assets/eva-logo.png";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ЕВА — тихий путь к себе" },
      { name: "description", content: "Иногда жизнь становится слишком шумной. ЕВА помогает услышать себя." },
    ],
  }),
});

function Index() {
  const navigate = useNavigate();
  const save = useServerFn(upsertOnboarding);
  const fetchOnboarding = useServerFn(getOnboarding);
  const draft = useOnboardingDraft();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/intro" });
        return;
      }

      // Authenticated → check whether onboarding completed in DB
      let completed = false;
      let hasRow = false;
      try {
        const { onboarding } = await fetchOnboarding();
        hasRow = !!onboarding;
        completed = !!onboarding?.completed;
      } catch {
        /* ignore */
      }

      if (completed) {
        navigate({ to: "/home" });
        return;
      }

      // Returning from OAuth (or just signed in) with a local draft → persist + welcome
      const hasDraft =
        draft.intro_seen ||
        draft.disclaimer_seen ||
        !!draft.user_name.trim() ||
        draft.user_age !== null ||
        draft.user_roles.length > 0;

      if (hasDraft || hasRow) {
        try {
          await save({
            data: {
              intro_seen: true,
              disclaimer_seen: true,
              user_name: draft.user_name.trim() || undefined,
              user_age: draft.user_age ?? undefined,
              user_roles: draft.user_roles,
            },
          });
        } catch {
          /* non-blocking */
        }
        navigate({ to: "/welcome" });
        return;
      }

      // Truly new authenticated user without any context → start onboarding
      navigate({ to: "/intro" });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <AmbientBackground theme="safe" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-12 flex items-center justify-center"
      >
        <div className="pointer-events-none absolute inset-0 -m-16 animate-breathing rounded-full bg-[radial-gradient(circle,_oklch(0.95_0.12_90/0.55)_0%,_oklch(1_0.05_95/0.35)_35%,_transparent_70%)] blur-2xl" />
        <div className="pointer-events-none absolute inset-0 -m-8 animate-pulse-glow rounded-full bg-[radial-gradient(circle,_oklch(0.98_0.08_95/0.5)_0%,_transparent_65%)] blur-xl" />
        <img
          src={evaLogo}
          alt="ЕВА — твой путь к себе"
          className="relative z-10 w-[min(80vw,420px)] h-auto select-none"
          draggable={false}
        />
      </motion.div>


      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="mt-12"
      >
        <Link to="/intro">
          <GlowButton>Начать</GlowButton>
        </Link>
      </motion.div>

      <p className="absolute bottom-8 text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60">
        cinematic wellness experience
      </p>
    </main>
  );
}
