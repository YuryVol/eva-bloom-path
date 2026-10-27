/**
 * Lightweight Telegram Bot API helper.
 * Works in both Cloudflare Workers (server.ts) and TanStack Start server functions.
 */

export const BOT_USERNAME = "eva_path_bot";

type InlineKeyboardButton =
  | { text: string; callback_data: string }
  | { text: string; url: string };
type InlineKeyboard = InlineKeyboardButton[][];

async function tgPost(token: string, method: string, body: unknown): Promise<{ ok: boolean; result?: { message_id: number } }> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`[telegram] ${method} failed ${res.status}:`, text);
      return { ok: false };
    }
    console.log(`[telegram] ${method} ok`);
    return res.json() as Promise<{ ok: boolean; result?: { message_id: number } }>;
  } catch (e) {
    console.error(`[telegram] ${method} error:`, e);
    return { ok: false };
  }
}

/** Pick a pseudorandom item from an array, seeded by day so all users get the same variant per day. */
export function pickByDay<T>(arr: T[]): T {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return arr[day % arr.length];
}

export async function sendTelegramMessage(chatId: number, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return;
  await tgPost(token, "sendMessage", { chat_id: chatId, text, parse_mode: "Markdown" });
}

/** Send message and return its message_id (for later editing). */
export async function sendTelegramMessageGetId(
  chatId: number,
  text: string,
  keyboard?: InlineKeyboard,
): Promise<number | null> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return null;
  const res = await tgPost(token, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}),
  });
  return res.result?.message_id ?? null;
}

/** Edit a previously sent message text and keyboard. */
export async function editTelegramMessage(
  chatId: number,
  messageId: number,
  text: string,
  keyboard?: InlineKeyboard,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId || !messageId) return;
  await tgPost(token, "editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "Markdown",
    ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}),
  });
}

export async function sendTelegramMessageWithKeyboard(
  chatId: number,
  text: string,
  keyboard: InlineKeyboard,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return;
  await tgPost(token, "sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyboard },
  });
}

/**
 * Send a photo with an optional caption and inline keyboard.
 * photoUrl must be a publicly accessible URL.
 */
export async function sendTelegramPhoto(
  chatId: number,
  photoUrl: string,
  caption: string,
  keyboard?: InlineKeyboard,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return;
  await tgPost(token, "sendPhoto", {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}),
  });
}

/**
 * Register bot commands so they appear in the "/" menu in Telegram.
 * Call once after deploy or when commands change.
 */
export async function setTelegramBotCommands(commands: { command: string; description: string }[]): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await tgPost(token, "setMyCommands", { commands });
}

export async function answerCallbackQuery(callbackQueryId: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await tgPost(token, "answerCallbackQuery", { callback_query_id: callbackQueryId });
}

