import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Guard: only admin role can call these
async function requireAdmin(supabase: ReturnType<typeof import("@supabase/supabase-js").createClient>, userId: string) {
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if ((data as { role?: string } | null)?.role !== "admin") throw new Error("Forbidden");
}

// ── Check if current user is admin ───────────────────────────────────────────
export const checkAdminRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
    return { isAdmin: (data as { role?: string } | null)?.role === "admin" };
  });

// ── Overview KPIs ─────────────────────────────────────────────────────────────
export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);

    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const ago7 = new Date(now.getTime() - 7 * 864e5).toISOString();
    const ago30 = new Date(now.getTime() - 30 * 864e5).toISOString();
    const ago14 = new Date(now.getTime() - 14 * 864e5).toISOString();

    const [
      { data: dauRows },
      { data: mauRows },
      { count: newWeek },
      { count: completedToday },
      { data: dauHistory },
      { data: sphereRows },
      { data: streakRows },
      { data: hourRows },
      { data: retentionD1Rows },
      { data: retentionD7Rows },
      { data: retentionD30Rows },
    ] = await Promise.all([
      // DAU today
      supabase.from("user_sessions").select("user_id").gte("started_at", today).then(({ data }) => ({
        data: data ? [...new Set((data as { user_id: string }[]).map((r) => r.user_id))] : [],
      })),
      // MAU
      supabase.from("user_sessions").select("user_id").gte("started_at", ago30).then(({ data }) => ({
        data: data ? [...new Set((data as { user_id: string }[]).map((r) => r.user_id))] : [],
      })),
      // New this week
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", ago7),
      // Journeys completed today
      supabase.from("journeys").select("id", { count: "exact", head: true })
        .eq("status", "completed").gte("completed_at", today),
      // DAU history 30 days
      supabase.from("user_sessions").select("user_id, started_at").gte("started_at", ago30),
      // Top spheres
      supabase.from("journeys").select("state"),
      // Streak distribution
      supabase.from("profiles").select("practice_streak"),
      // Activity by hour
      supabase.from("user_sessions").select("started_at").gte("started_at", ago30),
      // Retention D1: users who had a session on day 1 after registration
      supabase.from("profiles").select("id, created_at").lt("created_at", ago7),
      supabase.from("profiles").select("id, created_at").lt("created_at", ago14),
      supabase.from("profiles").select("id, created_at").lt("created_at", ago30),
    ]);

    // DAU history grouped by date
    const dauByDate: Record<string, Set<string>> = {};
    for (const row of (dauHistory ?? []) as { user_id: string; started_at: string }[]) {
      const d = row.started_at.split("T")[0];
      if (!dauByDate[d]) dauByDate[d] = new Set();
      dauByDate[d].add(row.user_id);
    }
    const dauChart = Object.entries(dauByDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, users]) => ({ date, dau: users.size }));

    // Top spheres from journey state
    const sphereCounts: Record<string, number> = {};
    for (const row of (sphereRows ?? []) as { state: Record<string, unknown> }[]) {
      const s = (row.state?.priority_sphere ?? row.state?.selected_spheres?.[0]) as string | undefined;
      if (s) sphereCounts[s] = (sphereCounts[s] ?? 0) + 1;
    }
    const topSpheres = Object.entries(sphereCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([sphere, count]) => ({ sphere, count }));

    // Streak distribution
    const streakBuckets: Record<string, number> = { "0": 0, "1–3": 0, "4–7": 0, "8–14": 0, "15–30": 0, "30+": 0 };
    for (const row of (streakRows ?? []) as { practice_streak: number }[]) {
      const s = row.practice_streak ?? 0;
      if (s === 0) streakBuckets["0"]++;
      else if (s <= 3) streakBuckets["1–3"]++;
      else if (s <= 7) streakBuckets["4–7"]++;
      else if (s <= 14) streakBuckets["8–14"]++;
      else if (s <= 30) streakBuckets["15–30"]++;
      else streakBuckets["30+"]++;
    }
    const streakChart = Object.entries(streakBuckets).map(([bucket, count]) => ({ bucket, count }));

    // Activity by hour
    const hourCounts: number[] = new Array(24).fill(0);
    for (const row of (hourRows ?? []) as { started_at: string }[]) {
      const h = new Date(row.started_at).getHours();
      hourCounts[h]++;
    }
    const hourChart = hourCounts.map((count, hour) => ({ hour, count }));

    // Simple retention: % of cohort who returned on day N (±1 day window)
    const calcRetention = async (cohort: { id: string; created_at: string }[], days: number) => {
      if (!cohort.length) return 0;
      const ids = cohort.map((u) => u.id);
      // Use the widest window across the cohort to cover all per-user day-N windows
      const times = cohort.map((u) => new Date(u.created_at).getTime());
      const from = new Date(Math.min(...times) + (days - 1) * 864e5).toISOString();
      const to   = new Date(Math.max(...times) + (days + 1) * 864e5).toISOString();
      const { data: rows } = await (supabase as never).from("user_sessions")
        .select("user_id")
        .in("user_id", ids)
        .gte("started_at", from)
        .lt("started_at", to);
      const returned = new Set(((rows ?? []) as { user_id: string }[]).map((r) => r.user_id)).size;
      return Math.round((returned / cohort.length) * 100);
    };

    const [d1, d7, d30] = await Promise.all([
      calcRetention((retentionD1Rows ?? []) as { id: string; created_at: string }[], 1),
      calcRetention((retentionD7Rows ?? []) as { id: string; created_at: string }[], 7),
      calcRetention((retentionD30Rows ?? []) as { id: string; created_at: string }[], 30),
    ]);

    return {
      kpi: {
        dau: (dauRows as string[]).length,
        mau: (mauRows as string[]).length,
        newWeek: newWeek ?? 0,
        completedToday: completedToday ?? 0,
        d1Retention: d1,
        d7Retention: d7,
        d30Retention: d30,
      },
      dauChart,
      topSpheres,
      streakChart,
      hourChart,
    };
  });

// ── Funnel ────────────────────────────────────────────────────────────────────
export const getAdminFunnel = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);

    const STEPS = ["intro", "about-you", "auth-invite", "welcome", "spheres", "assess", "first-journey"];

    const stepCounts: Record<string, number> = {};
    for (const step of STEPS) {
      const { count } = await supabase
        .from("onboarding_events")
        .select("id", { count: "exact", head: true })
        .eq("step", step)
        .eq("action", "completed");
      stepCounts[step] = count ?? 0;
    }
    const funnelSteps = STEPS.map((step) => ({ step, count: stepCounts[step] }));

    // Journey step dropout
    const { data: jSteps } = await supabase
      .from("journey_steps")
      .select("step_name, action");
    const dropoutMap: Record<string, { entered: number; abandoned: number }> = {};
    for (const row of (jSteps ?? []) as { step_name: string; action: string }[]) {
      if (!dropoutMap[row.step_name]) dropoutMap[row.step_name] = { entered: 0, abandoned: 0 };
      if (row.action === "entered") dropoutMap[row.step_name].entered++;
      if (row.action === "abandoned") dropoutMap[row.step_name].abandoned++;
    }
    const dropoutChart = Object.entries(dropoutMap).map(([step, { entered, abandoned }]) => ({
      step,
      entered,
      abandoned,
      rate: entered > 0 ? Math.round((abandoned / entered) * 100) : 0,
    }));

    // Conversion metrics
    const { count: totalUsers } = await supabase.from("profiles").select("id", { count: "exact", head: true });
    const { count: startedJourney } = await supabase
      .from("journeys").select("id", { count: "exact", head: true });
    const { count: completedJourney } = await supabase
      .from("journeys").select("id", { count: "exact", head: true }).eq("status", "completed");

    return {
      funnelSteps,
      dropoutChart,
      conversion: {
        totalUsers: totalUsers ?? 0,
        startedJourney: startedJourney ?? 0,
        completedJourney: completedJourney ?? 0,
        regToStart: totalUsers ? Math.round(((startedJourney ?? 0) / totalUsers) * 100) : 0,
        startToComplete: startedJourney ? Math.round(((completedJourney ?? 0) / (startedJourney ?? 1)) * 100) : 0,
      },
    };
  });

// ── Users list ────────────────────────────────────────────────────────────────
export const getAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    page: z.number().default(0),
    filter: z.enum(["all", "high_risk", "medium_risk", "new", "active_today"]).default("all"),
    search: z.string().default(""),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);

    const PAGE_SIZE = 50;
    const now = new Date();
    const ago7 = new Date(now.getTime() - 7 * 864e5).toISOString();
    const ago14 = new Date(now.getTime() - 14 * 864e5).toISOString();
    const today = now.toISOString().split("T")[0];

    let query = supabase.from("profiles").select(
      "id, display_name, xp_total, coins_total, practice_streak, created_at, last_checkin_at, telegram_chat_id",
      { count: "exact" }
    );

    if (data.search) {
      query = query.ilike("display_name", `%${data.search}%`);
    }
    if (data.filter === "high_risk") query = query.lt("last_checkin_at", ago14);
    if (data.filter === "medium_risk") {
      query = query.gte("last_checkin_at", ago14).lt("last_checkin_at", ago7);
    }
    if (data.filter === "new") query = query.gte("created_at", ago7);
    if (data.filter === "active_today") query = query.gte("last_checkin_at", today);

    const { data: users, count } = await query
      .order("created_at", { ascending: false })
      .range(data.page * PAGE_SIZE, (data.page + 1) * PAGE_SIZE - 1);

    const result = ((users ?? []) as Record<string, unknown>[]).map((u) => {
      const lastActive = u.last_checkin_at as string | null;
      let churnRisk: "low" | "medium" | "high" = "low";
      if (!lastActive || lastActive < ago14) churnRisk = "high";
      else if (lastActive < ago7) churnRisk = "medium";
      return {
        id: u.id as string,
        displayName: (u.display_name as string | null) ?? "—",
        xpTotal: (u.xp_total as number) ?? 0,
        practiceStreak: (u.practice_streak as number) ?? 0,
        createdAt: u.created_at as string,
        lastActiveAt: lastActive,
        telegramConnected: !!u.telegram_chat_id,
        churnRisk,
      };
    });

    return { users: result, total: count ?? 0, pageSize: PAGE_SIZE };
  });

// ── User profile detail ───────────────────────────────────────────────────────
export const getAdminUserProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ targetUserId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);

    const [{ data: profile }, { data: journeys }, { data: partnerEvents }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", data.targetUserId).maybeSingle(),
      supabase.from("journeys").select("*").eq("user_id", data.targetUserId)
        .order("started_at", { ascending: false }).limit(10),
      supabase.from("partner_events").select("*").eq("user_id", data.targetUserId)
        .order("created_at", { ascending: false }).limit(20),
    ]);

    // Build sphere radar from journey states
    const sphereScores: Record<string, number> = {};
    for (const j of (journeys ?? []) as { state: Record<string, unknown>; status: string }[]) {
      if (j.status !== "completed") continue;
      const sphere = j.state?.priority_sphere as string | undefined;
      const after = j.state?.resistance_score_after as number | undefined;
      if (sphere && after !== undefined) sphereScores[sphere] = after;
    }

    return {
      profile: profile as Record<string, unknown> | null,
      journeys: (journeys ?? []) as Record<string, unknown>[],
      partnerEvents: (partnerEvents ?? []) as Record<string, unknown>[],
      sphereScores,
    };
  });

// ── Partners analytics ────────────────────────────────────────────────────────
export const getAdminPartners = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    period: z.enum(["today", "7d", "30d", "all"]).default("7d"),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);

    const now = new Date();
    let since: string | null = null;
    if (data.period === "today") since = now.toISOString().split("T")[0];
    else if (data.period === "7d") since = new Date(now.getTime() - 7 * 864e5).toISOString();
    else if (data.period === "30d") since = new Date(now.getTime() - 30 * 864e5).toISOString();

    let query = supabase.from("partner_events").select("partner_slug, event_type, sphere_id, created_at");
    if (since) query = query.gte("created_at", since);
    const { data: events } = await query;

    const slugs = ["skillbox", "voltabot", "balansity", "psychologist"];
    const partnerStats: Record<string, { shown: number; clicked: number; dismissed: number }> = {};
    const sphereCtr: Record<string, Record<string, { shown: number; clicked: number }>> = {};
    const dailyMap: Record<string, { shown: number; clicked: number }> = {};

    for (const e of (events ?? []) as { partner_slug: string; event_type: string; sphere_id: string; created_at: string }[]) {
      const slug = e.partner_slug;
      if (!partnerStats[slug]) partnerStats[slug] = { shown: 0, clicked: 0, dismissed: 0 };
      if (e.event_type === "shown") partnerStats[slug].shown++;
      if (e.event_type === "clicked") partnerStats[slug].clicked++;
      if (e.event_type === "dismissed") partnerStats[slug].dismissed++;

      // Sphere CTR
      if (!sphereCtr[slug]) sphereCtr[slug] = {};
      if (!sphereCtr[slug][e.sphere_id]) sphereCtr[slug][e.sphere_id] = { shown: 0, clicked: 0 };
      if (e.event_type === "shown") sphereCtr[slug][e.sphere_id].shown++;
      if (e.event_type === "clicked") sphereCtr[slug][e.sphere_id].clicked++;

      // Daily
      const day = e.created_at.split("T")[0];
      if (!dailyMap[day]) dailyMap[day] = { shown: 0, clicked: 0 };
      if (e.event_type === "shown") dailyMap[day].shown++;
      if (e.event_type === "clicked") dailyMap[day].clicked++;
    }

    const partnerCards = slugs.map((slug) => {
      const s = partnerStats[slug] ?? { shown: 0, clicked: 0, dismissed: 0 };
      return {
        slug,
        shown: s.shown,
        clicked: s.clicked,
        dismissed: s.dismissed,
        ctr: s.shown > 0 ? +((s.clicked / s.shown) * 100).toFixed(1) : 0,
      };
    });

    const dailyChart = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { shown, clicked }]) => ({ date, shown, clicked }));

    return { partnerCards, sphereCtr, dailyChart };
  });

// ── CTA analytics ─────────────────────────────────────────────────────────────
export const getCTAStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await requireAdmin(supabase, userId);

    const { data } = await supabase
      .from("premium_cta_events")
      .select("context, format, event_type")
      .order("created_at", { ascending: false })
      .limit(10000);

    const rows = (data ?? []) as Array<{ context: string; format: string; event_type: string }>;

    const map: Record<string, { shown: number; clicked: number }> = {};
    for (const row of rows) {
      if (!map[row.context]) map[row.context] = { shown: 0, clicked: 0 };
      if (row.event_type === "shown") map[row.context].shown++;
      if (row.event_type === "clicked") map[row.context].clicked++;
    }

    return Object.entries(map).map(([context, { shown, clicked }]) => ({
      context,
      shown,
      clicked,
      ctr: shown > 0 ? Math.round((clicked / shown) * 1000) / 10 : 0,
    })).sort((a, b) => b.shown - a.shown);
  });
