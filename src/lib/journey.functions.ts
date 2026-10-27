import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { initialJourneyState, type JourneyState } from "./journey-types";
import { sendTelegramMessage, sendTelegramMessageWithKeyboard } from "./telegram";

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

const createNextSchema = z.object({
  priority_sphere: z.string(),
  selected_spheres: z.array(z.string()),
  sphere_scores: z.record(z.string(), z.number()),
  user_roles: z.array(z.string()).optional(),
  current_step: z.string().min(1).max(64),
});

export const createNextJourney = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => createNextSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const initialState = {
      ...initialJourneyState,
      priority_sphere: data.priority_sphere,
      selected_spheres: data.selected_spheres,
      sphere_scores: data.sphere_scores,
      user_roles: data.user_roles ?? [],
    };
    const { data: created, error } = await supabase
      .from("journeys")
      .insert({ user_id: userId, state: initialState as any, current_step: data.current_step, status: "active" })
      .select("id")
      .single();
    if (error) {
      console.error("[journey] createNextJourney error:", error.message);
      throw new Error(GENERIC_ERROR);
    }
    return { id: created.id as string };
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

function computeRewards(state: Record<string, unknown>, xpMultiplier = 1): { xp: number; coins: number } {
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
    // Practice completed (not skipped) during this journey
    typeof state.selected_practice_id === "string" &&
      (state.selected_practice_id as string).length > 0 &&
      state.practice_skipped !== true,
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

  // Apply premium XP multiplier, then cap.
  xp = Math.round(xp * xpMultiplier);
  return { xp: Math.min(xp, 300), coins: Math.min(coins, 50) };
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

    // Read xp_multiplier from profile for premium bonus (server-side only).
    const { data: profileForMultiplier } = await supabase
      .from("profiles")
      .select("xp_multiplier")
      .eq("id", userId)
      .maybeSingle();
    const xpMultiplier = (profileForMultiplier as { xp_multiplier?: number } | null)?.xp_multiplier ?? 1;

    // Compute rewards BEFORE applying the client-supplied final payload,
    // using only the server-persisted state from prior per-step updateJourney
    // calls. This prevents a client from fabricating milestones / resistance
    // deltas in the completeJourney payload to claim max rewards.
    const { xp: xp_awarded, coins: coins_awarded } = computeRewards(
      (journey.state ?? {}) as Record<string, unknown>,
      xpMultiplier,
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

    // Step 1: reliable XP/coins upsert — must never fail silently
    const { data: updatedProfile, error: pErr } = await supabase
      .from("profiles")
      .upsert({ id: userId, xp_total, coins_total })
      .select("telegram_chat_id")
      .maybeSingle();
    if (pErr) {
      console.error("[journey] completeJourney profile upsert error:", pErr.message);
      throw new Error(GENERIC_ERROR);
    }

    // Step 2: unlock practice on profile if practice was completed (not skipped)
    const st = data.state as Record<string, unknown>;
    const practiceKey = (st.selected_practice_key as string | undefined) ?? null;
    const practiceSkipped = st.practice_skipped === true;
    if (practiceKey && !practiceSkipped) {
      const { data: pp } = await supabase
        .from("profiles")
        .select("purchased_practices")
        .eq("id", userId)
        .maybeSingle();
      const existing = ((pp as Record<string, unknown> | null)?.purchased_practices as string[] | null) ?? [];
      if (!existing.includes(practiceKey)) {
        await supabase
          .from("profiles")
          .update({ purchased_practices: [...existing, practiceKey] })
          .eq("id", userId)
          .then(({ error }) => {
            if (error) console.warn("[journey] purchased_practices update failed (non-fatal):", error.message);
          });
      }
    }

    // Step 3: optional first-step reminder — deadline based on chosen window
    const firstStepText = st?.first_step as string | undefined;
    const firstStepWindow = st?.first_step_window as string | undefined;
    if (firstStepText) {
      const delayMs =
        firstStepWindow === "today"
          ? 8 * 60 * 60 * 1000
          : firstStepWindow === "tomorrow"
            ? 26 * 60 * 60 * 1000
            : 72 * 60 * 60 * 1000;
      await supabase
        .from("profiles")
        .update({
          first_step_text: firstStepText,
          first_step_reminder_at: new Date(Date.now() + delayMs).toISOString(),
          first_step_reminded: false,
        })
        .eq("id", userId)
        .then(({ error }) => {
          if (error) console.warn("[journey] first_step update failed (non-fatal):", error.message);
        });
    }

    // Step 3: Sphere queue management
    type QueueEntry = { sphere_id: string; score: number; position: number; status: "unlocked" | "locked" | "completed" };

    // Prefer DB state for priority_sphere (saved reliably during journey steps)
    const dbSt = (journey.state ?? {}) as Record<string, unknown>;
    const completedSphere =
      (dbSt.priority_sphere as string | undefined) ||
      (st.priority_sphere as string | undefined) || "";

    // Prefer whichever source has all 3 spheres
    const stSpheres  = Array.isArray(st.selected_spheres)   ? (st.selected_spheres   as string[]) : [];
    const dbSpheres  = Array.isArray(dbSt.selected_spheres)  ? (dbSt.selected_spheres  as string[]) : [];
    const selectedSpheres = stSpheres.length >= 3 ? stSpheres : dbSpheres;

    const stScores  = (st.sphere_scores  ?? {}) as Record<string, number>;
    const dbScores  = (dbSt.sphere_scores ?? {}) as Record<string, number>;
    const sphereScores = Object.keys(stScores).length > 0 ? stScores : dbScores;

    const { data: profileForQueue } = await supabase
      .from("profiles")
      .select("sphere_queue")
      .eq("id", userId)
      .maybeSingle();
    const existingQueue = ((profileForQueue as Record<string, unknown> | null)?.sphere_queue ?? null) as QueueEntry[] | null;

    let nextSphereId: string | null = null;
    let newQueue: QueueEntry[] | null = null;

    // Decide whether to build a fresh queue or update the existing one.
    // Build fresh when:
    //   - no queue exists yet, OR
    //   - the queue is fully exhausted (all completed, new cycle starting), OR
    //   - the completed sphere isn't in the queue at all (different cycle / stale queue)
    const queueHasSphere  = existingQueue?.some((e) => e.sphere_id === completedSphere) ?? false;
    const queueExhausted  = existingQueue?.every((e) => e.status === "completed") ?? false;
    const needsFreshQueue = !existingQueue || queueExhausted || (!queueHasSphere && selectedSpheres.length === 3);

    if (needsFreshQueue && selectedSpheres.length === 3 && completedSphere) {
      // Build a new queue sorted by score ascending (lowest = most problematic = first)
      const sorted = [...selectedSpheres].sort((a, b) => (sphereScores[a] ?? 10) - (sphereScores[b] ?? 10));
      newQueue = sorted.map((sid, i) => ({
        sphere_id: sid,
        score: sphereScores[sid] ?? 5,
        position: i + 1,
        status: i === 0 ? "completed" : i === 1 ? "unlocked" : "locked",
      } as QueueEntry));
      nextSphereId = newQueue[1].sphere_id;
    } else if (existingQueue && !needsFreshQueue) {
      // Update the existing queue: mark the current sphere completed, unlock the next locked one.
      // If completedSphere doesn't match by name (race-condition edge case), fall back to
      // marking whichever entry is currently "unlocked" as completed.
      const matchByName = existingQueue.some((e) => e.sphere_id === completedSphere);
      const updated = existingQueue.map((e) => {
        const shouldComplete = matchByName
          ? e.sphere_id === completedSphere
          : e.status === "unlocked"; // fallback
        return shouldComplete ? { ...e, status: "completed" as const } : e;
      });
      const nextLocked = updated.find((e) => e.status === "locked");
      if (nextLocked) {
        updated[updated.indexOf(nextLocked)] = { ...nextLocked, status: "unlocked" };
        nextSphereId = nextLocked.sphere_id;
      }
      // If there's already an unlocked entry that wasn't just completed, it's the next sphere
      const alreadyUnlocked = updated.find((e) => e.status === "unlocked");
      if (!nextSphereId && alreadyUnlocked) nextSphereId = alreadyUnlocked.sphere_id;
      newQueue = updated;
    }

    if (newQueue) {
      await supabase.from("profiles").update({ sphere_queue: newQueue }).eq("id", userId)
        .then(({ error }) => { if (error) console.warn("[journey] sphere_queue update failed:", error.message); });
    }

    // Send Telegram notification (non-blocking)
    // PostgREST returns bigint as string — handle both number and string.
    const tgChatIdRaw = (updatedProfile as Record<string, unknown> | null)?.telegram_chat_id;
    const tgChatId =
      typeof tgChatIdRaw === "number"
        ? tgChatIdRaw
        : typeof tgChatIdRaw === "string" && tgChatIdRaw
          ? parseInt(tgChatIdRaw, 10)
          : null;
    console.log("[journey] completeJourney tgChatIdRaw:", tgChatIdRaw, "tgChatId:", tgChatId);
    if (tgChatId && !isNaN(tgChatId)) {
      // Must await — Cloudflare Workers terminate before fire-and-forget fetches complete.
      await sendTelegramMessage(
        tgChatId,
        `Ты прошла путь 🌟\n\n+${xp_awarded} XP · +${coins_awarded} монет\nВсего: ${xp_total} XP`,
      );
    }

    return { ok: true, xp_total, coins_total, xp_awarded, coins_awarded, next_sphere_id: nextSphereId };
  });

export const getUserStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const [{ data: profile }, { data: history }, { data: onb }, { data: shopPurchases }, { count: activeCount }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("journeys")
        .select("id, current_step, status, started_at, completed_at, state")
        .eq("user_id", userId)
        .order("started_at", { ascending: false })
        .limit(20),
      supabase.from("onboarding_progress").select("user_roles").eq("user_id", userId).maybeSingle(),
      supabase.from("shop_purchases").select("item_id, created_at").eq("user_id", userId).eq("item_category", "practice"),
      supabase.from("profiles").select("id", { count: "exact", head: true }).gt("last_checkin_at", since24h),
    ]);
    const p = profile as Record<string, unknown> | null;
    const h = history ?? [];
    const shopPurchaseMap = Object.fromEntries(
      (shopPurchases ?? []).map((r: Record<string, unknown>) => [r.item_id as string, r.created_at as string])
    );
    // Round down to nearest 10, minimum 10, for community counter privacy
    const communityCount = Math.max(10, Math.floor(((activeCount ?? 0) + 1) / 10) * 10);
    return {
      profile: p
        ? {
            display_name: p.display_name as string | null,
            xp_total: (p.xp_total as number) ?? 0,
            coins_total: (p.coins_total as number) ?? 0,
            telegram_connected: !!p.telegram_chat_id,
            first_step_text: (p.first_step_text as string | null) ?? null,
            first_step_reminded: (p.first_step_reminded as boolean) ?? false,
            last_checkin_at: (p.last_checkin_at as string | null) ?? null,
            last_checkin_score: (p.last_checkin_score as number | null) ?? null,
            checkin_history: (p.checkin_history as Array<{ s: number; t: string }> | null) ?? [],
            journey_count: h.filter((j) => (j as { status: string }).status === "completed").length,
            practice_streak: (p.practice_streak as number) ?? 0,
            practice_last_at: (p.practice_last_at as string | null) ?? null,
            sphere_queue: (p.sphere_queue as Array<{ sphere_id: string; score: number; position: number; status: string }> | null) ?? null,
            purchased_practices: (p.purchased_practices as string[] | null) ?? [],
            shop_purchase_map: shopPurchaseMap as Record<string, string>,
            user_roles: (onb?.user_roles as string[] | null) ?? [],
            community_count: communityCount,
          }
        : {
            display_name: null,
            xp_total: 0,
            coins_total: 0,
            telegram_connected: false,
            first_step_text: null,
            first_step_reminded: false,
            last_checkin_at: null,
            last_checkin_score: null,
            checkin_history: [],
            journey_count: 0,
            practice_streak: 0,
            practice_last_at: null,
            sphere_queue: null,
            purchased_practices: [],
            shop_purchase_map: {} as Record<string, string>,
            user_roles: [],
            community_count: communityCount,
          },
      history: h,
    };
  });

export const saveMicroAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ text: z.string().min(1).max(500) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const due = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from("profiles")
      .update({ first_step_text: data.text, first_step_reminder_at: due, first_step_reminded: false })
      .eq("id", userId)
      .then(({ error }) => { if (error) console.warn("[micro] saveMicroAction failed:", error.message); });

    const { data: prof } = await supabase
      .from("profiles")
      .select("telegram_chat_id")
      .eq("id", userId)
      .maybeSingle();
    const rawId = (prof as Record<string, unknown> | null)?.telegram_chat_id;
    const tgChatId = typeof rawId === "number" ? rawId : typeof rawId === "string" && rawId ? parseInt(rawId, 10) : null;
    const appUrl = process.env.APP_URL ?? "https://eva-app-dev.volyur.workers.dev";
    if (tgChatId && !isNaN(tgChatId)) {
      await sendTelegramMessageWithKeyboard(
        tgChatId,
        `✨ Твой шаг на 24 часа:\n\n«${data.text}»\n\nЕва запомнила. Завтра мягко спросит — как прошло?`,
        [[{ text: "🌸 Мой мир", url: `${appUrl}/home` }]],
      );
    }
    return { ok: true };
  });

export const dismissFirstStep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ completed: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const updates: Record<string, unknown> = { first_step_reminded: true };
    if (data.completed) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("coins_total")
        .eq("id", userId)
        .maybeSingle();
      if (profile) {
        updates.coins_total = ((profile as Record<string, unknown>).coins_total as number ?? 0) + 5;
      }
    }
    await supabase.from("profiles").update(updates).eq("id", userId);
    return { ok: true };
  });

export const submitCheckin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ score: z.number().int().min(0).max(10) }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const now = new Date().toISOString();

    // Append to checkin_history (last 14 entries). Column must exist:
    // ALTER TABLE profiles ADD COLUMN IF NOT EXISTS checkin_history jsonb DEFAULT '[]';
    const { data: profile } = await supabase
      .from("profiles")
      .select("checkin_history")
      .eq("id", userId)
      .maybeSingle();

    const existing: Array<{ s: number; t: string }> =
      (profile as Record<string, unknown> | null)?.checkin_history as Array<{ s: number; t: string }> ?? [];
    const updated = [...existing, { s: data.score, t: now }].slice(-14);

    await supabase
      .from("profiles")
      .update({
        last_checkin_score: data.score,
        last_checkin_at: now,
        checkin_history: updated,
      })
      .eq("id", userId);
    return { ok: true };
  });

export const recordPractice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ practiceId: z.string() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Fetch current practice_streak and practice_last_at
    const { data: profile } = await supabase
      .from("profiles")
      .select("practice_streak, practice_last_at")
      .eq("id", userId)
      .maybeSingle();

    const p = profile as Record<string, unknown> | null;
    const lastAt = p?.practice_last_at as string | null;
    const streak = (p?.practice_streak as number) ?? 0;

    const today = new Date().toISOString().slice(0, 10);
    const lastDay = lastAt ? lastAt.slice(0, 10) : null;

    // Already recorded today — idempotent
    if (lastDay === today) return { ok: true, streak, xp: 0, coins: 0 };

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = lastDay === yesterday ? streak + 1 : 1;

    const streakBonus = Math.min(newStreak - 1, 10);
    const xpAwarded = 5 + streakBonus;
    const coinsAwarded = 2 + Math.floor(streakBonus / 2);

    // Fetch current totals to increment
    const { data: totalsRow } = await supabase
      .from("profiles")
      .select("xp_total, coins_total")
      .eq("id", userId)
      .maybeSingle();
    const t = totalsRow as Record<string, unknown> | null;
    const xpTotal = ((t?.xp_total as number) ?? 0) + xpAwarded;
    const coinsTotal = ((t?.coins_total as number) ?? 0) + coinsAwarded;

    await supabase
      .from("profiles")
      .update({
        practice_streak: newStreak,
        practice_last_at: new Date().toISOString(),
        xp_total: xpTotal,
        coins_total: coinsTotal,
      })
      .eq("id", userId);

    return { ok: true, streak: newStreak, xp: xpAwarded, coins: coinsAwarded };
  });

export const purchaseShopItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      item_id: z.string(),
      item_category: z.enum(["practice", "psychologist", "course"]),
      coins: z.number().int().positive(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("coins_total, purchased_practices")
      .eq("id", userId)
      .maybeSingle();

    const p = profile as Record<string, unknown> | null;
    const currentCoins = (p?.coins_total as number) ?? 0;
    const purchased: string[] = (p?.purchased_practices as string[] | null) ?? [];

    if (currentCoins < data.coins) throw new Error("Недостаточно монет");
    if (data.item_category === "practice" && purchased.includes(data.item_id)) {
      throw new Error("Уже куплено");
    }

    const updates: Record<string, unknown> = { coins_total: currentCoins - data.coins };
    if (data.item_category === "practice") {
      updates.purchased_practices = [...purchased, data.item_id];
    }

    const [{ error: profileErr }, { error: logErr }] = await Promise.all([
      supabase.from("profiles").update(updates).eq("id", userId),
      supabase.from("shop_purchases").insert({
        user_id: userId,
        item_id: data.item_id,
        item_category: data.item_category,
        coins_spent: data.coins,
      }),
    ]);

    if (profileErr) throw new Error(GENERIC_ERROR);
    if (logErr) console.warn("[shop] shop_purchases insert failed:", logErr.message);

    return { ok: true, coins_total: currentCoins - data.coins };
  });

export const getUserCoins = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("profiles")
      .select("coins_total")
      .eq("id", userId)
      .maybeSingle();
    return { coins: (data as { coins_total?: number } | null)?.coins_total ?? 0 };
  });

export const unlockPracticeWithCoins = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ cost: z.number().int().nonnegative() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase
      .from("profiles")
      .select("coins_total")
      .eq("id", userId)
      .maybeSingle();
    const current = (profile as { coins_total?: number } | null)?.coins_total ?? 0;
    if (current < data.cost) throw new Error("Недостаточно монет");
    await supabase.from("profiles").update({ coins_total: current - data.cost }).eq("id", userId);
    return { coins: current - data.cost };
  });
