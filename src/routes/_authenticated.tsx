import { createFileRoute, Navigate, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { AmbientBackground } from "@/components/eva/AmbientBackground";
import { getOnboarding } from "@/lib/onboarding.functions";

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
        if (!cancelled) setStatus("redirect");
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
  return <Outlet />;
}
