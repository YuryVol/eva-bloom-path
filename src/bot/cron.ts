import type { Db } from "./supabase";
import {
  sendTelegramMessage,
  sendTelegramMessageWithKeyboard,
  sendTelegramPhoto,
  pickByDay,
} from "@/lib/telegram";
import { pickPracticeOfDay } from "@/lib/practices-catalog";
import {
  MORNING_FREE,
  RETURN_1DAY,
  RETURN_3DAY,
  RETURN_6DAY,
  addJoyToReturn,
  formatDigest,
  formatPremiumMorning,
  formatPremiumDigest,
  GUARDIAN_QUOTES,
  OATH_DONE_FREE,
} from "./templates";
import { logNotification } from "./analytics";
import { sendGuardianReminder } from "./premium";

// ─── Profile shape returned from Supabase ────────────────────────────────────

interface BotProfile {
  id: string;
  telegram_chat_id: number;
  notify_practices: boolean;
  notify_return: boolean;
  notify_diary: boolean;
  notify_world_state: boolean;
  notify_guardians: boolean;
  notify_guardian_last_sent: string | null;
  is_premium: boolean;
  notifications_paused_until: string | null;
  last_checkin_score: number | null;
  checkin_history: Array<{ s: number; t: string }> | null;
  joy_archive: string[] | null;
  first_step_text: string | null;
  first_step_reminder_at: string | null;
  first_step_reminded: boolean;
  first_step_postpone_count: number;
  coins_total: number;
  notify_hour: number;
}

function isPaused(profile: BotProfile): boolean {
  if (!profile.notifications_paused_until) return false;
  return new Date(profile.notifications_paused_until) > new Date();
}

// ─── Morning practice ─────────────────────────────────────────────────────────

export async function sendMorningPractice(db: Db, appUrl: string): Promise<void> {
  const now = new Date();
  const profiles = await db.get<BotProfile>(
    "profiles?telegram_chat_id=not.is.null&notify_practices=eq.true" +
    "&select=id,telegram_chat_id,notify_practices,is_premium,notifications_paused_until," +
    "last_checkin_score,notify_hour",
  );

  const portraitImg = `${appUrl}/assets/eva/eva-main-portrait.png`;

  for (const p of profiles) {
    if (!p.telegram_chat_id) continue;
    if (isPaused(p)) continue;
    // Respect notify_hour: send only if current UTC hour matches (notify_hour is MSK = UTC+3)
    const targetUtcHour = ((p.notify_hour ?? 10) - 3 + 24) % 24;
    if (now.getUTCHours() !== targetUtcHour) continue;

    if (p.is_premium) {
      await sendPremiumMorning(db, p, portraitImg, appUrl);
    } else {
      await sendFreeMorning(db, p, portraitImg, appUrl);
    }
  }
}

async function sendFreeMorning(db: Db, p: BotProfile, portraitImg: string, appUrl: string): Promise<void> {
  const practice = pickPracticeOfDay(p.last_checkin_score ?? null);
  const score = p.last_checkin_score ?? 5;
  const moodLabel = score <= 4 ? "На сложные моменты" : score >= 7 ? "Для глубокой работы" : "На сегодня";
  const msgFn = pickByDay(MORNING_FREE);
  const text = msgFn(moodLabel, practice.title, practice.duration, practice.descShort);
  await sendTelegramPhoto(p.telegram_chat_id, portraitImg, text, [
    [{ text: "Открыть практику →", url: `${appUrl}/practices` }],
  ]);
  await logNotification(db, p.id, "practice", null, false);
}

async function sendPremiumMorning(db: Db, p: BotProfile, portraitImg: string, appUrl: string): Promise<void> {
  // Find active sphere
  const journey = await db.getOne<{ sphere_id: string }>(
    `journeys?user_id=eq.${p.id}&status=eq.active&select=sphere_id&order=created_at.desc&limit=1`,
  );
  let sphereId = journey?.sphere_id;

  if (!sphereId) {
    // Use sphere with min score_after
    const scored = await db.getOne<{ sphere_id: string }>(
      `journeys?user_id=eq.${p.id}&status=eq.completed&select=sphere_id&order=score_after.asc&limit=1`,
    );
    sphereId = scored?.sphere_id ?? "growth";
  }

  // Practice type by day of week (MSK = UTC+3)
  const mskDay = (new Date().getUTCDay() + (new Date().getUTCHours() >= 21 ? 1 : 0)) % 7;
  const practiceType =
    [1, 3, 5].includes(mskDay) ? "stabilization" :
    [2, 4].includes(mskDay) ? "relaxation" :
    "harmonization";

  // Get guardian for sphere
  const guardian = await db.getOne<{ name: string }>(
    `sphere_guardians?user_id=eq.${p.id}&sphere_id=eq.${sphereId}&select=name&limit=1`,
  );

  // Map practice type to mood for catalog
  const moodMap: Record<string, "grounding" | "standard" | "deep"> = {
    stabilization: "grounding",
    relaxation: "standard",
    harmonization: "deep",
  };
  const practice = pickPracticeOfDay(moodMap[practiceType] === "grounding" ? 3 : moodMap[practiceType] === "standard" ? 5 : 8);

  const text = formatPremiumMorning(
    practiceType as "stabilization" | "relaxation" | "harmonization",
    sphereId,
    guardian?.name ?? null,
    practice.title,
    practice.duration,
    practice.descShort,
  );

  await sendTelegramPhoto(p.telegram_chat_id, portraitImg, text, [
    [{ text: "Открыть практику →", url: `${appUrl}/practices` }],
  ]);
  await logNotification(db, p.id, "practice", null, true);
}

// ─── Return reminders ─────────────────────────────────────────────────────────

export async function sendReturnReminder(db: Db, appUrl: string): Promise<void> {
  const profiles = await db.get<BotProfile>(
    "profiles?telegram_chat_id=not.is.null&notify_return=eq.true" +
    "&select=id,telegram_chat_id,notifications_paused_until,is_premium,joy_archive",
  );

  const now = Date.now();
  const worldImgs: Record<string, string> = {
    wilting: `${appUrl}/assets/eva/world-wilting.png`,
    dormant: `${appUrl}/assets/eva/world-dormant.png`,
    winter:  `${appUrl}/assets/eva/world-winter.png`,
    healthy: `${appUrl}/assets/eva/world-healthy.png`,
  };

  for (const p of profiles) {
    if (!p.telegram_chat_id) continue;
    if (isPaused(p)) continue;

    const journey = await db.getOne<{ completed_at: string | null }>(
      `journeys?user_id=eq.${p.id}&status=eq.completed&order=completed_at.desc&limit=1&select=completed_at`,
    );

    if (!journey) {
      // Never completed — encourage first journey
      await sendTelegramPhoto(
        p.telegram_chat_id,
        worldImgs.healthy,
        "Твой первый путь ждёт тебя 🌸\n\nЕва готова идти рядом.",
        [[{ text: "Начать путешествие →", url: `${appUrl}/home` }]],
      );
      continue;
    }

    if (!journey.completed_at) continue;
    const daysSince = (now - new Date(journey.completed_at).getTime()) / (1000 * 60 * 60 * 24);
    const openBtn = [{ text: "Открыть ЕВА →", url: `${appUrl}/home` }];

    let baseText: string | null = null;
    let img: string | null = null;
    let joyDays: 3 | 6 | null = null;

    if (daysSince >= 0.9 && daysSince < 1.5) {
      baseText = pickByDay(RETURN_1DAY);
      img = worldImgs.wilting;
    } else if (daysSince >= 2.9 && daysSince < 3.5) {
      baseText = pickByDay(RETURN_3DAY);
      img = worldImgs.dormant;
      joyDays = 3;
    } else if (daysSince >= 5.9 && daysSince < 6.5) {
      baseText = pickByDay(RETURN_6DAY);
      img = worldImgs.winter;
      joyDays = 6;
    }

    if (!baseText || !img) continue;

    // Add joy_archive item for 3/6 day reminders
    if (joyDays && p.joy_archive && p.joy_archive.length > 0) {
      const joy = p.joy_archive[Math.floor(Math.random() * p.joy_archive.length)];
      baseText = addJoyToReturn(baseText, joyDays, joy);
    }

    await sendTelegramPhoto(p.telegram_chat_id, img, baseText, [[...openBtn]]);
    const variant = joyDays ?? 1;
    await logNotification(db, p.id, "return", variant, p.is_premium ?? false);
  }
}

// ─── Weekly digest ────────────────────────────────────────────────────────────

export async function sendWeeklyDigest(db: Db, appUrl: string): Promise<void> {
  const profiles = await db.get<BotProfile>(
    "profiles?telegram_chat_id=not.is.null" +
    "&select=id,telegram_chat_id,notifications_paused_until,is_premium,checkin_history",
  );

  for (const p of profiles) {
    if (!p.telegram_chat_id) continue;
    if (isPaused(p)) continue;

    const history = p.checkin_history ?? [];
    if (history.length < 3) continue;

    const week = history.slice(-7);
    const avg = week.reduce((s, e) => s + e.s, 0) / week.length;
    const prevWeek = history.slice(-14, -7);
    const prevAvg = prevWeek.length > 0
      ? prevWeek.reduce((s, e) => s + e.s, 0) / prevWeek.length
      : null;
    const trend = prevAvg !== null
      ? avg > prevAvg + 0.3 ? " (+↑ к прошлой неделе)"
      : avg < prevAvg - 0.3 ? " (↓ к прошлой неделе)"
      : " (→ стабильно)"
      : "";

    // Sphere of week
    const growthJourney = await db.getOne<{ sphere_id: string }>(
      `journeys?user_id=eq.${p.id}&created_at=gt.${encodeURIComponent(new Date(Date.now() - 7 * 864e5).toISOString())}` +
      `&select=sphere_id,score_before,score_after&order=score_after.desc&limit=1`,
    );
    const growthSphere = growthJourney?.sphere_id;

    let text: string;

    if (p.is_premium) {
      // Sphere needing attention (lowest score_after)
      const weakJourney = await db.getOne<{ sphere_id: string }>(
        `journeys?user_id=eq.${p.id}&status=eq.completed&select=sphere_id,score_after&order=score_after.asc&limit=1`,
      );
      const attentionSphere = weakJourney?.sphere_id;

      let guardianName: string | undefined;
      if (attentionSphere) {
        const guardian = await db.getOne<{ name: string }>(
          `sphere_guardians?user_id=eq.${p.id}&sphere_id=eq.${attentionSphere}&select=name&limit=1`,
        );
        if (guardian?.name && attentionSphere) {
          const quoteTpl = GUARDIAN_QUOTES[attentionSphere];
          guardianName = quoteTpl ? guardian.name : undefined;
        }
      }

      const { formatPremiumDigest } = await import("./templates");
      text = formatPremiumDigest(avg, trend, growthSphere, attentionSphere, guardianName);
    } else {
      text = formatDigest(avg, trend, growthSphere);
    }

    await sendTelegramMessage(p.telegram_chat_id, text);
    await logNotification(db, p.id, "digest", null, p.is_premium ?? false);
  }
}

// ─── Oath follow-up ───────────────────────────────────────────────────────────

export async function sendOathFollowup(db: Db, appUrl: string): Promise<void> {
  const now = Date.now();
  const profiles = await db.get<BotProfile>(
    "profiles?telegram_chat_id=not.is.null&first_step_reminded=eq.false" +
    "&first_step_text=not.is.null&first_step_reminder_at=not.is.null" +
    "&select=id,telegram_chat_id,notifications_paused_until,first_step_text,first_step_reminder_at,first_step_postpone_count",
  );

  for (const p of profiles) {
    if (!p.telegram_chat_id) continue;
    if (isPaused(p)) continue;
    if (!p.first_step_reminder_at) continue;
    if (new Date(p.first_step_reminder_at).getTime() > now) continue;

    const stepText = (p.first_step_text ?? "").replace(/ · (Сегодня|Завтра|На этой неделе)$/, "");
    await sendTelegramMessageWithKeyboard(
      p.telegram_chat_id,
      `Ты себе пообещала:\n«${stepText}»\n\nУдалось сделать? 🌱`,
      [
        [
          { text: "✅ Сделала", callback_data: `step_done:${p.id}` },
          { text: "⏳ Перенести на завтра", callback_data: `step_snooze:${p.id}` },
        ],
      ],
    );
    // Advance reminder 25h so it doesn't fire again today
    await db.patch("profiles", `id=eq.${p.id}`, {
      first_step_reminder_at: new Date(now + 25 * 60 * 60 * 1000).toISOString(),
    });
  }
}

// ─── Guardian reminders (Premium, every 3 days) ───────────────────────────────

export async function sendGuardianReminders(db: Db, appUrl: string): Promise<void> {
  const threeDaysAgo = new Date(Date.now() - 3 * 864e5).toISOString();
  const profiles = await db.get<BotProfile>(
    `profiles?telegram_chat_id=not.is.null&is_premium=eq.true&notify_guardians=eq.true` +
    `&or=(notify_guardian_last_sent.is.null,notify_guardian_last_sent.lt.${encodeURIComponent(threeDaysAgo)})` +
    `&select=id,telegram_chat_id,notifications_paused_until,notify_guardian_last_sent`,
  );

  const ALL_SPHERES = ["family", "relationships", "career", "growth", "finance", "rest", "people", "health"];

  for (const p of profiles) {
    if (!p.telegram_chat_id) continue;
    if (isPaused(p)) continue;

    const guardians = await db.get<{ sphere_id: string }>(
      `sphere_guardians?user_id=eq.${p.id}&select=sphere_id`,
    );
    const filledSpheres = new Set(guardians.map((g) => g.sphere_id));
    const emptySpheres = ALL_SPHERES.filter((s) => !filledSpheres.has(s));

    if (emptySpheres.length === 0) continue;

    await sendGuardianReminder(
      db,
      p.id,
      p.telegram_chat_id,
      emptySpheres.length,
      emptySpheres[0],
      appUrl,
    );
  }
}

// ─── Diary pending notifications (every 5 min) ───────────────────────────────

export async function sendPendingDiaryNotifications(db: Db, appUrl: string): Promise<void> {
  const now = new Date().toISOString();
  // pending_diary_notify_at is set by the app 5 min after journey completion
  const rows = await db.get<{
    id: string;
    user_id: string;
    entry_text: string;
  }>(
    `eva_diary?pending_notify=eq.true&notify_at=lte.${encodeURIComponent(now)}&select=id,user_id,entry_text&limit=20`,
  );

  if (!rows.length) return;

  for (const row of rows) {
    const profile = await db.getOne<{
      telegram_chat_id: number | null;
      is_premium: boolean;
      notify_diary: boolean;
      notifications_paused_until: string | null;
    }>(
      `profiles?id=eq.${row.user_id}&select=telegram_chat_id,is_premium,notify_diary,notifications_paused_until&limit=1`,
    );

    if (!profile?.telegram_chat_id) continue;
    if (!profile.is_premium || !profile.notify_diary) continue;
    if (profile.notifications_paused_until && new Date(profile.notifications_paused_until) > new Date()) continue;

    const { sendDiaryNotification } = await import("./premium");
    await sendDiaryNotification(db, row.user_id, profile.telegram_chat_id, row.entry_text, appUrl);

    // Mark as sent
    await db.patch("eva_diary", `id=eq.${row.id}`, { pending_notify: false });
  }
}

// ─── Resume paused notifications ─────────────────────────────────────────────

export async function resumePausedNotifications(db: Db): Promise<void> {
  const now = new Date().toISOString();
  // Find profiles whose pause just expired (paused_until < now, not yet cleared)
  const profiles = await db.get<{ id: string; telegram_chat_id: number }>(
    `profiles?notifications_paused_until=lt.${encodeURIComponent(now)}&telegram_chat_id=not.is.null` +
    `&select=id,telegram_chat_id&limit=50`,
  );
  for (const p of profiles) {
    await db.patch("profiles", `id=eq.${p.id}`, { notifications_paused_until: null });
    const { PAUSE_RESUMED } = await import("./templates");
    await sendTelegramMessage(p.telegram_chat_id, PAUSE_RESUMED);
  }
}
