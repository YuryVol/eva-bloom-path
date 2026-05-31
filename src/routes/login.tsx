import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { AmbientBackground } from "@/components/eva/AmbientBackground";
import { GlassCard } from "@/components/eva/GlassCard";
import { GlowButton } from "@/components/eva/GlowButton";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Вход — ЕВА" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/journey/spheres" });
    });
  }, [navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Проверь почту — мы прислали ссылку для подтверждения.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/journey/spheres" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Что-то пошло не так");
    } finally {
      setLoading(false);
    }
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
    navigate({ to: "/journey/spheres" });
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6">
      <AmbientBackground theme="safe" />
      <GlassCard className="w-full max-w-md">
        <div className="text-center">
          <h1 className="font-display text-3xl text-glow">
            {mode === "signin" ? "С возвращением" : "Создай свой путь"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin" ? "Войди, чтобы продолжить" : "Зарегистрируйся, чтобы начать"}
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-border bg-card/60 px-6 py-3 text-sm transition hover:border-primary/50 hover:bg-card disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" className="size-5">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
          </svg>
          Продолжить с Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          или
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
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
            {mode === "signin" ? "Войти" : "Создать аккаунт"}
          </GlowButton>
        </form>

        <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="hover:text-foreground"
          >
            {mode === "signin" ? "Создать аккаунт" : "У меня уже есть аккаунт"}
          </button>
          <Link to="/reset-password" className="hover:text-foreground">
            Забыли пароль?
          </Link>
        </div>

        <button
          type="button"
          onClick={async () => {
            setLoading(true);
            const { error } = await supabase.auth.signInAnonymously();
            if (error) {
              toast.error("Не удалось войти анонимно");
              setLoading(false);
              return;
            }
            navigate({ to: "/journey/spheres" });
          }}
          disabled={loading}
          className="mt-6 w-full text-center text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
        >
          Зайти без регистрации — посмотреть, как устроена ЕВА
        </button>
      </GlassCard>
    </main>
  );
}
