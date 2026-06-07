/**
 * Lightweight Telegram Bot API helper.
 * Works in both Cloudflare Workers (server.ts) and TanStack Start server functions.
 */

export const BOT_USERNAME = "eva_path_bot";

export async function sendTelegramMessage(chatId: number, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[telegram] sendMessage failed ${res.status}:`, body);
    } else {
      console.log("[telegram] sendMessage ok to", chatId);
    }
  } catch (e) {
    console.error("[telegram] sendMessage error:", e);
  }
}
