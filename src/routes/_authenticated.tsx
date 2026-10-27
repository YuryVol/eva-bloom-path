import { createFileRoute, Navigate, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { AmbientBackground } from "@/components/eva/AmbientBackground";
import { getOnboarding } from "@/lib/onboarding.functions";
import { startSession, endSession } from "@/lib/analytics";
import { AppConfigProvider } from "@/lib/app-config-context";

export const Route = createFileRoute("/_authenticated")({
  component: AuthGate,
});

function LoadingScreen() {
  return (
    <main className="relative flex min-h-screen items-center justify-center">
      <AmbientBackground theme="safe" />
      <div className="size-16 animate-breathing rounded-full bg-primary/60" />
    </main>
  );
}

function AuthGate() {
  const { session, loading } = useAuth();
  const location = useLocation();
  const fetchOnboarding = useServerFn(getOnboarding);
  const [status, setStatus] = useState<"checking" | "ok" | "redirect">("checking");
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    startSession().then((id) => { sessionIdRef.current = id; });
    return () => { endSession(sessionIdRef.current); };
  }, []);

  useEffect(() => {
    if (loading || !session) return;
    let cancelled = false;
    setStatus("checking");
    fetchOnboarding()
      .then(({ onboarding }) => {
        if (cancelled) return;
        setStatus(onboarding?.completed ? "ok" : "redirect");
      })
      .catch(() => {
        // If the onboarding check fails (network/DB error), let the user through
        // rather than looping them back to intro.
        if (!cancelled) setStatus("ok");
      });
    return () => {
      cancelled = true;
    };
  }, [loading, session, fetchOnboarding]);

  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/intro" />;
  if (status === "checking") return <LoadingScreen />;
  if (status === "redirect" && !location.pathname.startsWith("/intro")) {
    return <Navigate to="/intro" />;
  }
  return <AppConfigProvider><Outlet /></AppConfigProvider>;
}
