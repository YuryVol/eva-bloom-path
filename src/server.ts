import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { sendTelegramMessage } from "./lib/telegram";

// ─── Types ────────────────────────────────────────────────────────────────────

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

interface TelegramMessage {
  text?: string;
  chat: { id: number };
}

interface TelegramUpdate {
  message?: TelegramMessage;
}

interface SupabaseProfile {
  id: string;
  telegram_chat_id: number | null;
  notify_return: boolean;
  notify_practices: boolean;
  first_step_text: string | null;
  first_step_reminder_at: string | null;
  first_step_reminded: boolean;
}

interface SupabaseJourney {
  completed_at: string | null;
}

// ─── Webhook handler ──────────────────────────────────────────────────────────

async function handleTelegramWebhook(request: Request): Promise<Response> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return new Response("bad json", { status: 400 });
  }

  const message = update.message;
  if (!message?.text) return new Response("ok");

  const chatId = message.chat.id;
  const text = message.text.trim();

  if (text.startsWith("/start")) {
    const parts = text.split(" ");
    const userId = parts[1];

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      userId ?? "",
    );

    if (isUuid && supabaseUrl && serviceKey) {
      // Upsert telegram_chat_id — creates profile if missing, updates if exists
      await fetch(`${supabaseUrl}/rest/v1/profiles`, {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({ id: userId, telegram_chat_id: chatId }),
      });

      await sendTelegramMessage(
        chatId,
        "Ева теперь будет писать тебе сюда 🌸\n\nТы получишь мягкое напоминание, если давно не заходила, и уведомление после каждого путешествия.",
      );
    } else {
      await sendTelegramMessage(
        chatId,
        "Привет! Открой ЕВА в браузере и подключи Telegram через раздел «Мир Евы» 🌿",
      );
    }
  }

  return new Response("ok");
}

// ─── Cron / scheduled handler ─────────────────────────────────────────────────

async function handleScheduled(): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey || !process.env.TELEGRAM_BOT_TOKEN) return;

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
  };

  // Fetch all users with telegram connected
  const profilesRes = await fetch(
    `${supabaseUrl}/rest/v1/profiles?telegram_chat_id=not.is.null&select=id,telegram_chat_id,notify_return,notify_practices,first_step_text,first_step_reminder_at,first_step_reminded`,
    { headers },
  );
  if (!profilesRes.ok) return;
  const profiles = (await profilesRes.json()) as SupabaseProfile[];

  const now = Date.now();

  for (const profile of profiles) {
    if (!profile.telegram_chat_id) continue;

    // ── Return reminder ──────────────────────────────────────────────────────
    if (profile.notify_return) {
      const jRes = await fetch(
        `${supabaseUrl}/rest/v1/journeys?user_id=eq.${profile.id}&status=eq.completed&order=completed_at.desc&limit=1&select=completed_at`,
        { headers },
      );
      if (jRes.ok) {
        const journeys = (await jRes.json()) as SupabaseJourney[];
        if (journeys.length > 0 && journeys[0].completed_at) {
          const daysSince =
            (now - new Date(journeys[0].completed_at).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSince >= 2.9 && daysSince < 3.5) {
            await sendTelegramMessage(
              profile.telegram_chat_id,
              "Твой мир немного скучает по тебе 🌿\n\nХочешь заглянуть?",
            );
          } else if (daysSince >= 5.9 && daysSince < 6.5) {
            await sendTelegramMessage(
              profile.telegram_chat_id,
              "Ева хранит твоё место. Приходи, когда будешь готова ❄️",
            );
          }
        } else if (journeys.length === 0) {
          // Never completed — remind to start
          await sendTelegramMessage(
            profile.telegram_chat_id,
            "Твой первый путь ждёт тебя 🌸\n\nЕва готова идти рядом.",
          );
        }
      }
    }

    // ── Daily practice reminder ──────────────────────────────────────────────
    if (profile.notify_practices) {
      await sendTelegramMessage(
        profile.telegram_chat_id,
        "Доброе утро 🕯️\n\nТвои практики ждут — 5 минут для себя сегодня.",
      );
    }

    // ── First step follow-up (3 days after journey completion) ───────────────
    if (
      !profile.first_step_reminded &&
      profile.first_step_text &&
      profile.first_step_reminder_at &&
      new Date(profile.first_step_reminder_at).getTime() <= now
    ) {
      await sendTelegramMessage(
        profile.telegram_chat_id,
        `Помнишь шаг, который ты себе пообещала:\n«${profile.first_step_text}»\n\nКак он? 🌱`,
      );
      // Mark as reminded so we don't send again
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${profile.id}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ first_step_reminded: true }),
      });
    }
  }
}

// ─── SSR error handling (unchanged) ─────────────────────────────────────────

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }
  if (!payload || Array.isArray(payload) || typeof payload !== "object") return false;
  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) return false;
  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;
  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) return response;
  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

// ─── Cloudflare Worker export ─────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    // Intercept Telegram webhook before TanStack Start
    if (url.pathname === "/api/telegram/webhook" && request.method === "POST") {
      return handleTelegramWebhook(request);
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },

  // Cloudflare Cron Trigger — runs daily at 07:00 UTC (10:00 MSK)
  async scheduled(_event: unknown, _env: unknown, _ctx: unknown) {
    await handleScheduled();
  },
};
