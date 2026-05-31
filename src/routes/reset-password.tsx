import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AmbientBackground } from "@/components/eva/AmbientBackground";
import { GlassCard } from "@/components/eva/GlassCard";
import { GlowButton } from "@/components/eva/GlowButton";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({ meta: [{ title: "Восстановление пароля — ЕВА" }] }),
});

function ResetPasswordPage() {
  const [mode, setMode] = useState<"request" | "update">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setMode("update");
    }
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Если такой email есть — ссылка отправлена.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Пароль обновлён. Можно войти.");
      window.location.href = "/login";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6">
      <AmbientBackground theme="safe" />
      <GlassCard className="w-full max-w-md">
        <h1 className="text-center font-display text-2xl text-glow">
          {mode === "request" ? "Восстановить пароль" : "Новый пароль"}
        </h1>
        {mode === "request" ? (
          <form onSubmit={handleRequest} className="mt-6 space-y-3">
            <input
              type="email"
              required
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full border border-border bg-background/50 px-5 py-3 text-sm focus:border-primary/60 focus:outline-none"
            />
            <GlowButton type="submit" disabled={loading} className="w-full">
              Отправить ссылку
            </GlowButton>
          </form>
        ) : (
          <form onSubmit={handleUpdate} className="mt-6 space-y-3">
            <input
              type="password"
              required
              minLength={6}
              placeholder="новый пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-full border border-border bg-background/50 px-5 py-3 text-sm focus:border-primary/60 focus:outline-none"
            />
            <GlowButton type="submit" disabled={loading} className="w-full">
              Сохранить
            </GlowButton>
          </form>
        )}
      </GlassCard>
    </main>
  );
}
