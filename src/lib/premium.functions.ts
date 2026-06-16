import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const activatePremiumMock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await supabase.from("profiles").update({
      is_premium: true,
      premium_since: new Date().toISOString(),
      xp_multiplier: 1.5,
    }).eq("id", userId);
    await supabase.from("premium_purchases").insert({
      user_id: userId,
      plan: "monthly",
      status: "mock",
    });
    return { ok: true };
  });

export const deactivatePremiumMock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await supabase.from("profiles").update({
      is_premium: false,
      premium_since: null,
      xp_multiplier: 1.0,
    }).eq("id", userId);
    return { ok: true };
  });

export const checkPremiumStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("profiles")
      .select("is_premium, premium_since, xp_multiplier, world_state_id, active_days_count")
      .eq("id", userId)
      .maybeSingle();
    const p = data as Record<string, unknown> | null;
    return {
      isPremium: (p?.is_premium as boolean) ?? false,
      premiumSince: (p?.premium_since as string | null) ?? null,
      xpMultiplier: (p?.xp_multiplier as number) ?? 1.0,
      worldStateId: (p?.world_state_id as number) ?? 1,
      activeDaysCount: (p?.active_days_count as number) ?? 0,
    };
  });

export const checkJourneyLimit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const today = new Date().toISOString().split("T")[0];

    const [{ data: profile }, { data: limits }] = await Promise.all([
      supabase.from("profiles").select("is_premium").eq("id", userId).maybeSingle(),
      supabase.from("journey_limits").select("sphere_id, last_journey_date").eq("user_id", userId),
    ]);

    const isPremium = (profile as { is_premium?: boolean } | null)?.is_premium ?? false;
    const limitMap: Record<string, boolean> = {};

    if (!isPremium) {
      for (const row of (limits ?? []) as { sphere_id: string; last_journey_date: string }[]) {
        if (row.last_journey_date >= today) {
          limitMap[row.sphere_id] = true; // reached limit today
        }
      }
    }

    return { isPremium, limitMap, today };
  });

export const recordJourneyStart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    // Increment active_days_count if this is first journey today
    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase
      .from("journey_limits")
      .select("last_journey_date")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    const isNewDay = !existing || (existing as { last_journey_date: string }).last_journey_date < today;
    if (isNewDay) {
      await supabase.rpc("increment_active_days", { p_user_id: userId }).catch(() => {
        // rpc might not exist yet — fallback
        supabase.from("profiles")
          .update({ active_days_count: supabase.rpc("coalesce_increment" as never) })
          .eq("id", userId);
      });
    }

    return { ok: true };
  });
