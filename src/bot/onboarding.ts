import type { Db } from "./supabase";
import {
  sendTelegramMessageGetId,
  editTelegramMessage,
  sendTelegramMessageWithKeyboard,
} from "@/lib/telegram";

// Encode notification prefs as a 3-char string "p", "r", "d" present = enabled
// e.g. "prd" = all on, "pr" = practices + return, "" = none

function buildStep1Keyboard(flags: string, isPremium: boolean) {
  const p = flags.includes("p");
  const r = flags.includes("r");
  const d = flags.includes("d");

  const rows = [
    [{ text: `${p ? "✅" : "☐"} Утреннюю практику`, callback_data: `ob1:toggle:p:${flags}` }],
    [{ text: `${r ? "✅" : "☐"} Напоминание о возвращении`, callback_data: `ob1:toggle:r:${flags}` }],
    [{ text: `${d ? "✅" : "☐"} Еженедельный дайджест`, callback_data: `ob1:toggle:d:${flags}` }],
    [{ text: "Сохранить →", callback_data: `ob1:save:${flags}` }],
  ];

  if (isPremium) {
    rows.splice(3, 0, [
      { text: "✅ Уведомления дневника Евы", callback_data: `ob1:noop` },
    ]);
  }

  return rows;
}

function toggleFlag(flags: string, char: string): string {
  return flags.includes(char)
    ? flags.replace(char, "")
    : flags + char;
}

export async function startOnboarding(
  chatId: number,
  isPremium: boolean,
): Promise<void> {
  const flags = "prd"; // all enabled by default
  const msgId = await sendTelegramMessageGetId(
    chatId,
    "Что тебе присылать? 🌸",
    buildStep1Keyboard(flags, isPremium),
  );
  // Store msg_id not needed — editing handled by callback
  void msgId;
}

export async function handleOnboardingCallback(
  db: Db,
  chatId: number,
  userId: string,
  data: string,
  messageId: number,
  isPremium: boolean,
  appUrl: string,
): Promise<boolean> {
  // ob1:toggle:p:prd  — toggle flag, edit message
  if (data.startsWith("ob1:toggle:")) {
    const parts = data.split(":");
    const char = parts[2];
    const currentFlags = parts[3] ?? "prd";
    const newFlags = toggleFlag(currentFlags, char);
    await editTelegramMessage(
      chatId,
      messageId,
      "Что тебе присылать? 🌸",
      buildStep1Keyboard(newFlags, isPremium),
    );
    return true;
  }

  // ob1:noop — checkbox for premium (non-interactive display)
  if (data === "ob1:noop") return true;

  // ob1:save:prd — save step 1, show step 2
  if (data.startsWith("ob1:save:")) {
    const flags = data.slice("ob1:save:".length);
    await db.patch("profiles", `id=eq.${userId}`, {
      notify_practices: flags.includes("p"),
      notify_return: flags.includes("r"),
      // notify_weekly not a column — we use it implicitly
    });
    // Step 2: choose time
    await editTelegramMessage(
      chatId,
      messageId,
      "В котором часу удобнее получать сообщения? ☀️\n\n(Московское время)",
      [
        [
          { text: "7:00", callback_data: "ob2:7" },
          { text: "8:00", callback_data: "ob2:8" },
          { text: "9:00", callback_data: "ob2:9" },
        ],
        [
          { text: "10:00", callback_data: "ob2:10" },
          { text: "11:00", callback_data: "ob2:11" },
        ],
      ],
    );
    return true;
  }

  // ob2:10 — save hour, complete onboarding
  if (data.startsWith("ob2:")) {
    const hour = parseInt(data.slice(4), 10);
    await db.patch("profiles", `id=eq.${userId}`, {
      notify_hour: isNaN(hour) ? 10 : hour,
      tg_onboarding_step: 2,
    });
    await editTelegramMessage(
      chatId,
      messageId,
      `Готово! Ева будет с тобой в ${hour}:00 МСК 🌸\n\nИспользуй кнопки ниже для быстрого доступа.`,
      [
        [
          { text: "🌸 Приложение", url: `${appUrl}/home` },
          { text: "✨ Практика дня", callback_data: "cmd:practice" },
        ],
        [
          { text: "⏸ Пауза на неделю", callback_data: "cmd:pause" },
          { text: "🔕 Отписаться", callback_data: "cmd:stop" },
        ],
      ],
    );
    return true;
  }

  return false;
}
