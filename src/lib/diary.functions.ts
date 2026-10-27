import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// --- Diary entry templates ---

const SPHERE_TEMPLATES: Record<string, string[]> = {
  health: [
    "Сегодня я уделила время своему телу и заметила: {insight}.",
    "Мой организм сегодня говорил мне: {insight}.",
    "Работая со здоровьем, я осознала: {insight}.",
  ],
  rest: [
    "Сегодня я разрешила себе отдохнуть и поняла: {insight}.",
    "В моменте тишины пришло понимание: {insight}.",
    "Отпуская напряжение, я обнаружила: {insight}.",
  ],
  relationships: [
    "Думая об отношениях, я поняла: {insight}.",
    "Сегодня в отношениях я заметила: {insight}.",
    "Работая с этой темой, я открыла для себя: {insight}.",
  ],
  family: [
    "Думая о близких, я поняла: {insight}.",
    "Сегодня в семье я заметила: {insight}.",
    "Работая с этой темой, я открыла для себя: {insight}.",
  ],
  people: [
    "Думая об окружении, я поняла: {insight}.",
    "Сегодня в общении я заметила: {insight}.",
    "Работая с этой темой, я открыла для себя: {insight}.",
  ],
  growth: [
    "Сегодня я сделала шаг вперёд и осознала: {insight}.",
    "В работе над собой пришло понимание: {insight}.",
    "Мой рост сегодня проявился в том, что: {insight}.",
  ],
  finance: [
    "Размышляя о финансах, я поняла: {insight}.",
    "Сегодня я честно посмотрела на свои ресурсы и увидела: {insight}.",
    "Работая с темой денег, я осознала: {insight}.",
  ],
  career: [
    "Сегодня я прикоснулась к своему смыслу и поняла: {insight}.",
    "В вопросе предназначения я обнаружила: {insight}.",
    "Ища свой путь, я заметила: {insight}.",
  ],
};

const INSIGHT_PHRASES: Record<string, string[]> = {
  high_resistance: [
    "сопротивление — это тоже часть пути",
    "даже малый шаг имеет значение",
    "я могу быть добрее к себе",
  ],
  low_resistance: [
    "я способна на больше, чем думала",
    "внутренняя сила — всегда со мной",
    "спокойствие внутри — это я сама",
  ],
  neutral: [
    "каждый момент — возможность для роста",
    "я иду своим путём",
    "быть честной с собой — это уже смелость",
  ],
};

function generateEntryText(
  sphere: string,
  resistanceBefore: number,
  resistanceAfter: number,
  goalText?: string,
): string {
  const templates = SPHERE_TEMPLATES[sphere] ?? SPHERE_TEMPLATES.growth;
  const template = templates[Math.floor(Math.random() * templates.length)];

  const delta = resistanceBefore - resistanceAfter;
  const insightKey =
    resistanceBefore >= 7 ? "high_resistance" : delta >= 2 ? "low_resistance" : "neutral";
  const phrases = INSIGHT_PHRASES[insightKey];
  const insight = phrases[Math.floor(Math.random() * phrases.length)];

  let text = template.replace("{insight}", insight);

  if (goalText) {
    text += `\n\nМоя цель сегодня: «${goalText}».`;
  }

  if (delta > 0) {
    text += `\n\nСопротивление снизилось с ${resistanceBefore} до ${resistanceAfter} — это ощутимый сдвиг.`;
  }

  return text;
}

export interface DiaryEntry {
  id: string;
  user_id: string;
  journey_id: string | null;
  sphere_id: string;
  entry_text: string;
  resistance_before: number | null;
  resistance_after: number | null;
  created_at: string;
}

const saveDiarySchema = z.object({
  journey_id: z.string(),
  sphere_id: z.string(),
  resistance_before: z.number(),
  resistance_after: z.number(),
  goal_text: z.string().optional(),
  custom_text: z.string().optional(),
});

export const saveDiaryEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => saveDiarySchema.parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    // Server-side premium gate — diary is a premium-only feature
    const { data: prof } = await supabase.from("profiles")
      .select("is_premium")
      .eq("id", userId)
      .maybeSingle();
    if (!(prof as { is_premium?: boolean } | null)?.is_premium) {
      throw new Error("Premium required");
    }

    const generated = data.custom_text
      ? data.custom_text
      : generateEntryText(
          data.sphere_id,
          data.resistance_before,
          data.resistance_after,
          data.goal_text,
        );

    const { data: entry, error } = await supabase
      .from("eva_diary")
      .insert({
        user_id: userId,
        journey_id: data.journey_id,
        sphere_id: data.sphere_id,
        entry_text: generated,
        resistance_before: data.resistance_before,
        resistance_after: data.resistance_after,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return entry as DiaryEntry;
  });

export const getDiaryEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: entries, error } = await supabase
      .from("eva_diary")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    return (entries ?? []) as DiaryEntry[];
  });

const updateDiarySchema = z.object({
  id: z.string(),
  entry_text: z.string(),
});

export const updateDiaryEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => updateDiarySchema.parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    const { error } = await supabase
      .from("eva_diary")
      .update({ entry_text: data.entry_text })
      .eq("id", data.id)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });
