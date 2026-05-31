import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { initialJourneyState, type JourneyState } from "./journey-types";

const GENERIC_ERROR = "An unexpected error occurred. Please try again.";

export const getActiveJourney = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: existing, error } = await supabase
      .from("journeys")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[journey] getActiveJourney select error:", error.message);
      throw new Error(GENERIC_ERROR);
    }
    if (existing) {
      return {
        id: existing.id,
        state: existing.state as unknown as JourneyState,
        current_step: existing.current_step,
        status: existing.status,
      };
    }

    const { data: created, error: insErr } = await supabase
      .from("journeys")
      .insert({
        user_id: userId,
        state: initialJourneyState as any,
        current_step: "spheres",
        status: "active",
      })
      .select("*")
      .single();

    if (insErr) {
      console.error("[journey] getActiveJourney insert error:", insErr.message);
      throw new Error(GENERIC_ERROR);
    }
    return {
      id: created.id,
      state: created.state as unknown as JourneyState,
      current_step: created.current_step,
      status: created.status,
    };
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  state: z.record(z.string(), z.unknown()),
  current_step: z.string().min(1).max(64),
});

export const updateJourney = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("journeys")
      .update({ state: data.state as any, current_step: data.current_step })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) {
      console.error("[journey] updateJourney error:", error.message);
      throw new Error(GENERIC_ERROR);
    }
    return { ok: true };
  });

// Server controls the entire reward economy — clients cannot influence XP/coins.
const completeSchema = z.object({
  id: z.string().uuid(),
  state: z.record(z.string(), z.unknown()),
});

function computeRewards(state: Record<string, unknown>): { xp: number; coins: number } {
  // Base reward for finishing a journey.
  let xp = 50;
  let coins = 10;

  // Milestone-based rewards: count meaningful completed steps in journey state.
  const milestones: Array<boolean> = [
    Array.isArray(state.selected_spheres) && (state.selected_spheres as unknown[]).length >= 3,
    typeof state.priority_sphere === "string" && (state.priority_sphere as string).length > 0,
    typeof state.desired_goal === "string" && (state.desired_goal as string).trim().length > 0,
    typeof state.desired_state === "string" && (state.desired_state as string).trim().length > 0,
    typeof state.resistance_shape === "string" && (state.resistance_shape as string).length > 0,
    typeof state.emdr_cycles === "number" && (state.emdr_cycles as number) > 0,
    typeof state.resistance_score_after === "number",
  ];
  const completed = milestones.filter(Boolean).length;
  xp += completed * 10;
  coins += completed * 3;

  // Bonus for resistance reduction (before - after, capped).
  const before = typeof state.resistance_score_before === "number" ? (state.resistance_score_before as number) : 0;
  const after = typeof state.resistance_score_after === "number" ? (state.resistance_score_after as number) : 0;
  const delta = Math.max(0, Math.min(10, before - after));
  xp += delta * 5;
  coins += delta * 1;

  // Hard caps to bound the economy.
  return { xp: Math.min(xp, 200), coins: Math.min(coins, 50) };
}

export const completeJourney = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => completeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Re-read the journey from DB to ensure it exists, belongs to the user,
    // and is not already completed (prevents replaying for rewards).
    const { data: journey, error: readErr } = await supabase
      .from("journeys")
      .select("id, status, state")
      .eq("id", data.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (readErr) {
      console.error("[journey] completeJourney read error:", readErr.message);
      throw new Error(GENERIC_ERROR);
    }
    if (!journey) {
      throw new Error("Journey not found.");
    }
    if (journey.status === "completed") {
      // Idempotent: do not award again. Return current totals.
      const { data: profile } = await supabase
        .from("profiles")
        .select("xp_total, coins_total")
        .eq("id", userId)
        .maybeSingle();
      return {
        ok: true,
        xp_total: profile?.xp_total ?? 0,
        coins_total: profile?.coins_total ?? 0,
        xp_awarded: 0,
        coins_awarded: 0,
      };
    }

    // Compute rewards BEFORE applying the client-supplied final payload,
    // using only the server-persisted state from prior per-step updateJourney
    // calls. This prevents a client from fabricating milestones / resistance
    // deltas in the completeJourney payload to claim max rewards.
    const { xp: xp_awarded, coins: coins_awarded } = computeRewards(
      (journey.state ?? {}) as Record<string, unknown>,
    );

    const { error } = await supabase
      .from("journeys")
      .update({
        state: data.state as any,
        current_step: "summary",
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", data.id)
      .eq("user_id", userId);
    if (error) {
      console.error("[journey] completeJourney update error:", error.message);
      throw new Error(GENERIC_ERROR);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("xp_total, coins_total")
      .eq("id", userId)
      .maybeSingle();

    const xp_total = (profile?.xp_total ?? 0) + xp_awarded;
    const coins_total = (profile?.coins_total ?? 0) + coins_awarded;

    const { error: pErr } = await supabase
      .from("profiles")
      .upsert({ id: userId, xp_total, coins_total });
    if (pErr) {
      console.error("[journey] completeJourney profile upsert error:", pErr.message);
      throw new Error(GENERIC_ERROR);
    }

    return { ok: true, xp_total, coins_total, xp_awarded, coins_awarded };
  });

export const getUserStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: history }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("journeys")
        .select("id, current_step, status, started_at, completed_at, state")
        .eq("user_id", userId)
        .order("started_at", { ascending: false })
        .limit(20),
    ]);
    return {
      profile: profile
        ? {
            display_name: profile.display_name,
            xp_total: profile.xp_total,
            coins_total: profile.coins_total,
          }
        : { display_name: null, xp_total: 0, coins_total: 0 },
      history: history ?? [],
    };
  });
