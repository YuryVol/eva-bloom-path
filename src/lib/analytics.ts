/**
 * Fire-and-forget analytics helpers — never block the UI.
 * All functions swallow errors silently.
 */
import { supabase } from "@/integrations/supabase/client";

// ── Session tracking ──────────────────────────────────────────────────────────

export async function startSession(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.is_anonymous) return null;
    const { data } = await supabase
      .from("user_sessions")
      .insert({ user_id: user.id })
      .select("id")
      .single();
    return (data as { id: string } | null)?.id ?? null;
  } catch { return null; }
}

export async function endSession(sessionId: string | null): Promise<void> {
  if (!sessionId) return;
  try {
    const { data: sess } = await supabase
      .from("user_sessions")
      .select("started_at")
      .eq("id", sessionId)
      .single();
    const started = sess ? new Date((sess as { started_at: string }).started_at).getTime() : Date.now();
    const duration = Math.round((Date.now() - started) / 1000);
    await supabase
      .from("user_sessions")
      .update({ ended_at: new Date().toISOString(), duration_seconds: duration })
      .eq("id", sessionId);
  } catch { /* silent */ }
}

// ── Onboarding events ─────────────────────────────────────────────────────────

export function trackOnboarding(step: string, action: "entered" | "completed" | "skipped"): void {
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user || user.is_anonymous) return;
    supabase.from("onboarding_events").insert({ user_id: user.id, step, action }).then(() => {});
  });
}

// ── Journey step events ───────────────────────────────────────────────────────

export function trackJourneyStep(
  journeyId: string,
  stepName: string,
  action: "entered" | "completed" | "skipped" | "abandoned",
): void {
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user || user.is_anonymous) return;
    supabase.from("journey_steps").insert({
      user_id: user.id,
      journey_id: journeyId,
      step_name: stepName,
      action,
    }).then(() => {});
  });
}
