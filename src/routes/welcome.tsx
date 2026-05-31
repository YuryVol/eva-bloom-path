import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { GlowButton } from "@/components/eva/GlowButton";
import { useOnboardingDraft } from "@/lib/onboarding-store";
import { upsertOnboarding } from "@/lib/onboarding.functions";

export const Route = createFileRoute("/welcome")({
  component: WelcomeScreen,
  head: () => ({ meta: [{ title: "Привет — ЕВА" }] }),
});

function WelcomeScreen() {
  const navigate = useNavigate();
  const save = useServerFn(upsertOnboarding);
  const { user_name } = useOnboardingDraft();

  const handleNext = async () => {
    try {
      await save({ data: { completed: true } });
    } catch {
      // ignore — navigation should still proceed
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem("eva:spheres-intro", "1");
    }
    navigate({ to: "/journey/spheres" });
  };


  return (
    <main className="relative flex min-h-[100dvh] flex-col items-stretch bg-[#F9F4EE]">
      <div
        className="relative flex-1 bg-cover bg-left md:bg-center"
        style={{ backgroundImage: "url(/assets/eva/eva-platform.png)" }}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#F9F4EE] via-[#F9F4EE]/85 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative -mt-32 px-6 pb-10 text-center"
      >
        <div className="mx-auto max-w-md">
          {user_name && (
            <p className="mb-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {user_name},
            </p>
          )}
          <p className="text-base leading-relaxed text-foreground md:text-lg">
            Иногда жизнь становится слишком шумной, и в этом шуме легко потерять контакт
            с собой.
          </p>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">
            Давай попробуем начать с маленького шага и создать пространство, в котором
            станет чуть спокойнее.
          </p>
          <div className="mt-8 flex justify-center">
            <GlowButton onClick={handleNext}>Давай</GlowButton>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
