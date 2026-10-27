import type { Db } from "./supabase";
import {
  sendTelegramMessageWithKeyboard,
  sendTelegramPhoto,
} from "@/lib/telegram";
import {
  formatDiaryNotification,
  formatWorldStateNotification,
  formatGuardianReminder,
  MILESTONE_TEXTS,
} from "./templates";
import { logNotification } from "./analytics";

export async function sendDiaryNotification(
  db: Db,
  userId: string,
  chatId: number,
  entryText: string,
  appUrl: string,
): Promise<void> {
  const text = formatDiaryNotification(entryText);
  await sendTelegramMessageWithKeyboard(chatId, text, [
    [{ text: "📖 Читать в дневнике →", url: `${appUrl}/diary` }],
  ]);
  await logNotification(db, userId, "diary", null, true);
}

export async function sendWorldStateNotification(
  db: Db,
  userId: string,
  chatId: number,
  stateId: number,
  name: string,
  description: string,
  imageUrl: string,
  appUrl: string,
): Promise<void> {
  const text = formatWorldStateNotification(stateId, name, description);
  await sendTelegramPhoto(chatId, imageUrl, text, [
    [{ text: "🌍 Посмотреть мир →", url: `${appUrl}/home` }],
  ]);
  await logNotification(db, userId, "world_state", stateId, true);
}

export async function sendGuardianReminder(
  db: Db,
  userId: string,
  chatId: number,
  emptySlots: number,
  firstEmptySphere: string,
  appUrl: string,
): Promise<void> {
  const text = formatGuardianReminder(emptySlots);
  await sendTelegramMessageWithKeyboard(chatId, text, [
    [
      {
        text: "✨ Создать хранителя →",
        url: `${appUrl}/premium/guardian-creator?sphere=${firstEmptySphere}`,
      },
    ],
  ]);
  await db.patch("profiles", `id=eq.${userId}`, {
    notify_guardian_last_sent: new Date().toISOString(),
  });
  await logNotification(db, userId, "guardian", emptySlots, true);
}

export async function sendMilestoneDiary(
  db: Db,
  userId: string,
  chatId: number,
  count: number,
  appUrl: string,
): Promise<void> {
  const text = MILESTONE_TEXTS[count];
  if (!text) return;
  await sendTelegramMessageWithKeyboard(chatId, text, [
    [{ text: "📖 Открыть дневник →", url: `${appUrl}/diary` }],
  ]);
  await logNotification(db, userId, "milestone", count, true);
}
