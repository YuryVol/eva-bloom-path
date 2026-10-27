import type { Db } from "./supabase";
import {
  sendTelegramMessage,
  sendTelegramMessageWithKeyboard,
  sendTelegramPhoto,
  answerCallbackQuery,
} from "@/lib/telegram";
import { startOnboarding, handleOnboardingCallback } from "./onboarding";
import { logNotification, markClicked } from "./analytics";
import { WELCOME_MESSAGE, PAUSE_CONFIRMED, PAUSE_RESUMED, OATH_DONE_FREE, formatOathDonePremium } from "./templates";
import { pickPracticeOfDay } from "@/lib/practices-catalog";

export function menuKeyboard(appUrl: string) {
  return [
    [
      { text: "🌸 Приложение", url: `${appUrl}/home` },
      { text: "✨ Практика дня", callback_data: "cmd:practice" },
    ],
    [
      { text: "⏸ Пауза на неделю", callback_data: "cmd:pause" },
      { text: "🔕 Отписаться", callback_data: "cmd:stop" },
    ],
  ];
}

interface Profile {
  id: string;
  is_premium?: boolean;
  first_step_text?: string | null;
  first_step_postpone_count?: number;
  coins_total?: number;
  notifications_paused_until?: string | null;
}

export async function handleStart(
  db: Db,
  chatId: number,
  token: string | undefined,
  appUrl: string,
): Promise<void> {
  // No token: prompt to connect via app
  if (!token) {
    await sendTelegramMessageWithKeyboard(
      chatId,
      "Привет! Открой ЕВА в браузере и подключи Telegram через профиль 🌿",
      menuKeyboard(appUrl),
    );
    return;
  }

  // Look up profile by token
  const profile = await db.getOne<{ id: string; is_premium: boolean }>(
    `profiles?tg_link_token=eq.${encodeURIComponent(token)}&tg_link_token_expires_at=gt.${encodeURIComponent(new Date().toISOString())}&select=id,is_premium&limit=1`,
  );

  if (!profile) {
    await sendTelegramMessage(
      chatId,
      "Ссылка устарела или недействительна 🌿\n\nВернись в приложение и нажми «Подключить Telegram» снова.",
    );
    return;
  }

  // Link account
  await db.patch("profiles", `id=eq.${profile.id}`, {
    telegram_chat_id: chatId,
    notify_practices: true,
    notify_return: true,
    tg_link_token: null,
    tg_link_token_expires_at: null,
    tg_onboarding_step: 1,
  });

  await sendTelegramMessage(chatId, WELCOME_MESSAGE);

  // Start 2-step onboarding
  await startOnboarding(chatId, profile.is_premium ?? false);
}

export async function handleStop(db: Db, chatId: number): Promise<void> {
  const profile = await db.getOne<{ id: string }>(
    `profiles?telegram_chat_id=eq.${chatId}&select=id&limit=1`,
  );
  if (profile) {
    await db.patch("profiles", `id=eq.${profile.id}`, {
      notify_practices: false,
      notify_return: false,
    });
  }
  await sendTelegramMessage(
    chatId,
    "Уведомления отключены 🌿\n\nЕва всё равно ждёт тебя в приложении. Чтобы снова подключиться — открой ЕВА и нажми «Подключить Telegram».",
  );
}

export async function handlePause(db: Db, chatId: number, daysStr: string): Promise<void> {
  const days = Math.min(30, Math.max(1, parseInt(daysStr || "7", 10) || 7));
  const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  const profile = await db.getOne<{ id: string }>(
    `profiles?telegram_chat_id=eq.${chatId}&select=id&limit=1`,
  );
  if (profile) {
    await db.patch("profiles", `id=eq.${profile.id}`, {
      notifications_paused_until: until,
    });
  }
  await sendTelegramMessage(chatId, PAUSE_CONFIRMED(days));
}

export async function handlePracticeCommand(chatId: number, appUrl: string): Promise<void> {
  const practice = pickPracticeOfDay(null);
  await sendTelegramPhoto(
    chatId,
    `${appUrl}/assets/eva/eva-main-portrait.png`,
    `✨ Практика дня\n\n*${practice.title}* · ${practice.duration}\n${practice.descShort}`,
    [[{ text: "Открыть практику →", url: `${appUrl}/practices` }]],
  );
}

export async function handleCallbacks(
  db: Db,
  callbackQueryId: string,
  chatId: number,
  messageId: number,
  data: string,
  fromUserId: number,
  appUrl: string,
): Promise<void> {
  await answerCallbackQuery(callbackQueryId);

  // ── Onboarding callbacks ─────────────────────────────────────────────────
  const profile = await db.getOne<Profile & { is_premium: boolean }>(
    `profiles?telegram_chat_id=eq.${chatId}&select=id,is_premium,first_step_text,first_step_postpone_count,coins_total,notifications_paused_until&limit=1`,
  );

  if (data.startsWith("ob1:") || data.startsWith("ob2:")) {
    if (!profile) return;
    const handled = await handleOnboardingCallback(
      db,
      chatId,
      profile.id,
      data,
      messageId,
      profile.is_premium ?? false,
      appUrl,
    );
    if (handled) return;
  }

  // ── Menu quick-actions ───────────────────────────────────────────────────
  if (data === "cmd:practice") {
    await handlePracticeCommand(chatId, appUrl);
    return;
  }

  if (data === "cmd:stop") {
    await handleStop(db, chatId);
    return;
  }

  if (data === "cmd:pause") {
    await handlePause(db, chatId, "7");
    return;
  }

  // ── Oath (first step follow-up) ──────────────────────────────────────────
  if (!profile) return;

  if (data.startsWith("step_done:")) {
    const userId = data.slice("step_done:".length);
    const newCoins = (profile.coins_total ?? 0) + 15;
    await db.patch("profiles", `id=eq.${userId}`, {
      first_step_reminded: true,
      coins_total: newCoins,
    });
    const text = profile.is_premium
      ? formatOathDonePremium(getSphereFromStep(profile.first_step_text))
      : OATH_DONE_FREE;
    await sendTelegramMessage(chatId, text);

    const logId = await logNotification(db, userId, "oath", null, profile.is_premium ?? false);
    if (logId) await markClicked(db, logId);
    return;
  }

  if (data.startsWith("step_snooze:")) {
    const userId = data.slice("step_snooze:".length);
    const postponeCount = (profile.first_step_postpone_count ?? 0) + 1;

    if (postponeCount >= 3) {
      await db.patch("profiles", `id=eq.${userId}`, {
        first_step_postpone_count: postponeCount,
      });
      await sendTelegramMessageWithKeyboard(
        chatId,
        "Этот шаг, возможно, ждёт другого момента. Хочешь выбрать новый?",
        [
          [
            { text: "Выбрать новый шаг →", url: `${appUrl}/home` },
            { text: "Я обязательно сделаю", callback_data: `step_snooze_final:${userId}` },
          ],
        ],
      );
    } else {
      const newReminder = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await db.patch("profiles", `id=eq.${userId}`, {
        first_step_reminder_at: newReminder,
        first_step_postpone_count: postponeCount,
      });
      await sendTelegramMessage(chatId, "Хорошо, напомню завтра в это же время 🌿");
    }
    return;
  }

  if (data.startsWith("step_snooze_final:")) {
    const userId = data.slice("step_snooze_final:".length);
    const newReminder = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await db.patch("profiles", `id=eq.${userId}`, {
      first_step_reminder_at: newReminder,
    });
    await sendTelegramMessage(chatId, "Она ждёт тебя 🌿");
    return;
  }

  // ── Analytics: mark click on any notification with log_id ───────────────
  if (data.startsWith("log:")) {
    const logId = data.slice(4);
    await markClicked(db, logId);
    return;
  }
}

function getSphereFromStep(stepText: string | null | undefined): string {
  if (!stepText) return "growth";
  const lower = stepText.toLowerCase();
  if (lower.includes("семь") || lower.includes("близк")) return "family";
  if (lower.includes("отнош") || lower.includes("парт")) return "relationships";
  if (lower.includes("призван") || lower.includes("работ") || lower.includes("карьер")) return "career";
  if (lower.includes("финанс") || lower.includes("деньг")) return "finance";
  if (lower.includes("отдых") || lower.includes("отдохн")) return "rest";
  if (lower.includes("окруж") || lower.includes("друз")) return "people";
  if (lower.includes("здоров") || lower.includes("тело")) return "health";
  return "growth";
}
