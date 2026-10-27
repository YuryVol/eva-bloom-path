import { db as makeDb } from "./supabase";
import { handleStart, handleStop, handlePause, handlePracticeCommand, handleCallbacks } from "./commands";
import {
  sendMorningPractice,
  sendReturnReminder,
  sendWeeklyDigest,
  sendOathFollowup,
  sendGuardianReminders,
  sendPendingDiaryNotifications,
  resumePausedNotifications,
} from "./cron";
import { setTelegramBotCommands } from "@/lib/telegram";

// ─── Telegram update types ────────────────────────────────────────────────────

interface TgMessage {
  text?: string;
  chat: { id: number };
  message_id: number;
}

interface TgCallbackQuery {
  id: string;
  from: { id: number };
  data?: string;
  message?: TgMessage;
}

interface TgUpdate {
  message?: TgMessage;
  callback_query?: TgCallbackQuery;
}

// ─── Webhook handler ──────────────────────────────────────────────────────────

export async function handleWebhook(request: Request): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const appUrl = process.env.APP_URL ?? "https://eva-app-dev.workers.dev";

  if (!supabaseUrl || !serviceKey) return new Response("misconfigured", { status: 500 });

  let update: TgUpdate;
  try {
    update = (await request.json()) as TgUpdate;
  } catch {
    return new Response("bad json", { status: 400 });
  }

  const db = makeDb(supabaseUrl, serviceKey);

  // ── Callbacks ───────────────────────────────────────────────────────────────
  if (update.callback_query) {
    const cq = update.callback_query;
    const chatId = cq.message?.chat.id;
    const messageId = cq.message?.message_id;
    const data = cq.data ?? "";
    if (chatId && messageId) {
      await handleCallbacks(db, cq.id, chatId, messageId, data, cq.from.id, appUrl);
    }
    return new Response("ok");
  }

  // ── Messages ────────────────────────────────────────────────────────────────
  const msg = update.message;
  if (!msg?.text) return new Response("ok");

  const chatId = msg.chat.id;
  const text = msg.text.trim();

  if (text.startsWith("/start")) {
    const token = text.split(" ")[1];
    await handleStart(db, chatId, token, appUrl);
    return new Response("ok");
  }

  if (text === "/stop") {
    await handleStop(db, chatId);
    return new Response("ok");
  }

  if (text.startsWith("/pause")) {
    const daysStr = text.split(" ")[1] ?? "7";
    await handlePause(db, chatId, daysStr);
    return new Response("ok");
  }

  if (text === "/practice") {
    await handlePracticeCommand(chatId, appUrl);
    return new Response("ok");
  }

  if (text === "/app") {
    const { sendTelegramMessageWithKeyboard } = await import("@/lib/telegram");
    const { menuKeyboard } = await import("./commands");
    await sendTelegramMessageWithKeyboard(chatId, "Открываю ЕВА 🌸", menuKeyboard(appUrl));
    return new Response("ok");
  }

  // Default: show menu
  const { sendTelegramMessageWithKeyboard } = await import("@/lib/telegram");
  const { menuKeyboard } = await import("./commands");
  await sendTelegramMessageWithKeyboard(chatId, "Используй кнопки для быстрого доступа 🌿", menuKeyboard(appUrl));
  return new Response("ok");
}

// ─── Scheduled handler ────────────────────────────────────────────────────────

export async function handleScheduled(cron: string): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const appUrl = process.env.APP_URL ?? "https://eva-app-dev.workers.dev";

  if (!supabaseUrl || !serviceKey || !process.env.TELEGRAM_BOT_TOKEN) return;

  const db = makeDb(supabaseUrl, serviceKey);

  const utcHour = new Date().getUTCHours();
  const utcDay = new Date().getUTCDay(); // 0=Sun

  // 07:00 UTC = 10:00 MSK — morning practice + register commands
  if (utcHour === 7) {
    await setTelegramBotCommands([
      { command: "app",      description: "🌸 Открыть приложение" },
      { command: "practice", description: "✨ Практика дня" },
      { command: "stop",     description: "🔕 Отписаться от уведомлений" },
      { command: "pause",    description: "⏸ Пауза N дней (по умолчанию 7)" },
    ]);
    await sendMorningPractice(db, appUrl);
  }

  // 08:00 UTC — return reminders
  if (utcHour === 8) {
    await sendReturnReminder(db, appUrl);
  }

  // 09:00 UTC — oath follow-up + diary notifications + guardian reminders + resume paused
  if (utcHour === 9) {
    await sendOathFollowup(db, appUrl);
    await sendPendingDiaryNotifications(db, appUrl);
    await sendGuardianReminders(db, appUrl);
    await resumePausedNotifications(db);
  }

  // 16:00 UTC Sunday — weekly digest
  if (utcHour === 16 && utcDay === 0) {
    await sendWeeklyDigest(db, appUrl);
  }
}
