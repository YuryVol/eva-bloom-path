import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { AmbientBackground } from "@/components/eva/AmbientBackground";
import { GlowButton } from "@/components/eva/GlowButton";
import { LegalModal } from "@/components/eva/LegalModal";
import { PrivacyPolicyContent } from "@/components/eva/legal/PrivacyPolicyContent";
import { TermsOfUseContent } from "@/components/eva/legal/TermsOfUseContent";
import { useOnboardingDraft } from "@/lib/onboarding-store";
import { upsertOnboarding } from "@/lib/onboarding.functions";

export const Route = createFileRoute("/auth-invite")({
  component: AuthInviteScreen,
  head: () => ({ meta: [{ title: "Регистрация — ЕВА" }] }),
});

const BENEFITS = [
  "сохранять свой прогресс и достижения",
  "возвращаться к своим маршрутам восстановления",
  "не проходить приветственные экраны повторно",
  "получать персональные рекомендации и новые практики",
  "продолжать путь с того места, где остановилась",
];

function RegisterIcon() {
  return (
    <div className="relative mx-auto mb-6 flex h-64 w-full items-center justify-center md:h-80">
      {/* radial halo */}
      <div
        className="pointer-events-none absolute inset-[-10%] rounded-full"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,236,170,0.55) 0%, rgba(255,214,140,0.25) 35%, rgba(255,214,140,0) 70%)",
        }}
      />
      {/* orbiting sparkles */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const rx = 170;
        const ry = 120;
        const x = Math.cos(angle) * rx;
        const y = Math.sin(angle) * ry;
        return (
          <motion.span
            key={i}
            className="absolute size-1.5 rounded-full bg-[#FFF8D6]"
            style={{
              left: "50%",
              top: "50%",
              x,
              y,
              boxShadow: "0 0 8px 2px rgba(255,243,180,0.9)",
            }}
            animate={{ opacity: [0, 1, 0], scale: [0.4, 1.3, 0.4] }}
            transition={{
              duration: 1.8 + (i % 5) * 0.3,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        );
      })}
      <img
        src="/assets/eva/register-icon.png"
        alt=""
        className="relative z-10 h-full w-auto object-contain drop-shadow-[0_10px_24px_rgba(110,70,40,0.4)]"
      />
    </div>
  );
}


function AuthInviteScreen() {
  const navigate = useNavigate();
  const draft = useOnboardingDraft();
  const save = useServerFn(upsertOnboarding);
  const [loading, setLoading] = useState(false);
  const [legalModal, setLegalModal] = useState<null | "privacy" | "terms">(null);
  const [showEmail, setShowEmail] = useState(false);
  const [emailMode, setEmailMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const persistDraft = async (auth_type: "guest" | "google") => {
    await save({
      data: {
        intro_seen: true,
        disclaimer_seen: true,
        user_name: draft.user_name.trim() || undefined,
        user_age: draft.user_age ?? undefined,
        user_roles: draft.user_roles,
        auth_type,
      },
    });
  };

  const handleGoogle = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Не удалось войти через Google");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    try {
      await persistDraft("google");
    } catch {
      // non-blocking
    }
    navigate({ to: "/welcome" });
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
      }
      await persistDraft("guest");
      navigate({ to: "/welcome" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось продолжить");
      setLoading(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (emailMode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Проверь почту — мы прислали ссылку для подтверждения.");
        setLoading(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        try {
          await persistDraft("guest");
        } catch {
          // non-blocking
        }
        navigate({ to: "/welcome" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Что-то пошло не так");
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-[100dvh] px-6 py-8">
      <AmbientBackground theme="safe" />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="mx-auto w-full max-w-md"
      >
        <RegisterIcon />

        <h1 className="text-center font-display text-2xl text-glow md:text-3xl">
          Ты можешь зарегистрироваться, чтобы:
        </h1>

        <ul className="mx-auto mt-6 max-w-sm space-y-3 text-[15px] leading-relaxed text-muted-foreground">
          {BENEFITS.map((b) => (
            <li key={b} className="flex gap-3">
              <span className="mt-2 block size-1.5 shrink-0 rounded-full bg-primary/70 shadow-[0_0_8px_rgba(255,236,170,0.7)]" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-card/60 px-6 py-3 text-sm transition hover:border-primary/50 hover:bg-card disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="size-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>
            Продолжить с Google
          </button>

          <button
            type="button"
            onClick={() => setShowEmail((v) => !v)}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-card/60 px-6 py-3 text-sm transition hover:border-primary/50 hover:bg-card disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            Регистрация по почте
          </button>

          {showEmail && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              onSubmit={handleEmail}
              className="space-y-3 overflow-hidden pt-1"
            >
              <input
                type="email"
                required
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-border bg-background/50 px-5 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none"
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full border border-border bg-background/50 px-5 py-3 text-sm placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none"
              />
              <GlowButton type="submit" disabled={loading} className="w-full">
                {emailMode === "signup" ? "Создать аккаунт" : "Войти"}
              </GlowButton>
              <button
                type="button"
                onClick={() => setEmailMode(emailMode === "signup" ? "signin" : "signup")}
                className="block w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                {emailMode === "signup" ? "У меня уже есть аккаунт" : "Создать новый аккаунт"}
              </button>
            </motion.form>
          )}

          <GlowButton variant="ghost" onClick={handleGuest} disabled={loading} className="w-full">
            Продолжить без регистрации
          </GlowButton>
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
          Продолжая, вы соглашаетесь с{" "}
          <button
            type="button"
            onClick={() => setLegalModal("privacy")}
            className="cursor-pointer underline underline-offset-2 transition hover:text-foreground"
          >
            Политикой обработки данных
          </button>{" "}
          и{" "}
          <button
            type="button"
            onClick={() => setLegalModal("terms")}
            className="cursor-pointer underline underline-offset-2 transition hover:text-foreground"
          >
            Условиями использования приложения
          </button>
          .
        </p>
      </motion.div>

      <LegalModal
        open={legalModal === "privacy"}
        onClose={() => setLegalModal(null)}
        title="Политика обработки персональных данных"
      >
        <PrivacyPolicyContent />
      </LegalModal>
      <LegalModal
        open={legalModal === "terms"}
        onClose={() => setLegalModal(null)}
        title="Условия использования сервиса EVA"
      >
        <TermsOfUseContent />
      </LegalModal>
    </main>
  );
}
