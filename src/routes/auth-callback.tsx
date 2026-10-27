import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AmbientBackground } from "@/components/eva/AmbientBackground";

export const Route = createFileRoute("/auth-callback")({
  component: AuthCallbackPage,
  head: () => ({ meta: [{ title: "Вход — ЕВА" }] }),
});

function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      // Exchange PKCE code for session (Supabase appends ?code= to redirect_uri)
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      // After session is set, check where to send the user
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/login" });
        return;
      }

      // Redirect to root — it knows how to handle new vs returning users
      navigate({ to: "/" });
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="relative flex min-h-screen items-center justify-center">
      <AmbientBackground theme="safe" />
      <p className="text-sm text-muted-foreground animate-pulse">Входим…</p>
    </main>
  );
}
