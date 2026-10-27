import type { Db } from "./supabase";

export type NotificationType =
  | "practice"
  | "return"
  | "digest"
  | "diary"
  | "world_state"
  | "guardian"
  | "milestone"
  | "oath";

export async function logNotification(
  db: Db,
  userId: string,
  type: NotificationType,
  variant: number | null,
  isPremium: boolean,
): Promise<string | null> {
  return db.insertGetId("notification_log", {
    user_id: userId,
    type,
    variant,
    is_premium: isPremium,
    sent_at: new Date().toISOString(),
  });
}

export async function markClicked(db: Db, logId: string): Promise<void> {
  await db.patch("notification_log", `id=eq.${logId}`, {
    clicked_at: new Date().toISOString(),
  });
}
