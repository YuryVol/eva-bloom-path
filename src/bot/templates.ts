import { pickByDay } from "@/lib/telegram";

// ─── Sphere labels ────────────────────────────────────────────────────────────

export const SPHERE_LABELS: Record<string, string> = {
  family: "Семья",
  relationships: "Отношения",
  career: "Призвание",
  growth: "Развитие",
  finance: "Финансы",
  rest: "Отдых",
  people: "Окружение",
  health: "Здоровье",
};

// ─── Morning practice ─────────────────────────────────────────────────────────

export const MORNING_FREE = [
  (moodLabel: string, title: string, dur: string, desc: string) =>
    `Доброе утро 🌸\n\n${moodLabel}: *${title}* · ${dur}\n${desc}`,
  (moodLabel: string, title: string, dur: string, desc: string) =>
    `Привет ✨\n\nЕва подобрала для тебя: *${title}* · ${dur}\n${desc}`,
  (moodLabel: string, title: string, dur: string, desc: string) =>
    `🌿 Новый день — новая возможность\n\n${moodLabel}: *${title}* · ${dur}\n${desc}`,
  (moodLabel: string, title: string, dur: string, desc: string) =>
    `Утро — лучшее время для себя 🌼\n\n*${title}* · ${dur}\n${desc}`,
  (moodLabel: string, title: string, dur: string, desc: string) =>
    `🌱 Маленький шаг каждое утро меняет всё\n\n${moodLabel}: *${title}* · ${dur}\n${desc}`,
];

// Premium: with guardian
export const MORNING_PREMIUM_WITH_GUARDIAN: Record<string, string[]> = {
  stabilization: [
    "{name} сегодня рядом. Для тебя — практика спокойствия по сфере {sphere}.",
    "{name} напоминает: ты сильнее чем кажется. Практика устойчивости — сфера {sphere}.",
  ],
  relaxation: [
    "{name} напоминает: можно выдохнуть. Практика отпускания по сфере {sphere}.",
    "{name} говорит: напряжение уходит само, если позволить. Сфера {sphere}.",
  ],
  harmonization: [
    "{name} ведёт тебя глубже. Практика переосмысления по сфере {sphere}.",
    "{name} рядом на этом шаге. Практика гармонизации — сфера {sphere}.",
  ],
};

// Premium: without guardian
export const MORNING_PREMIUM_NO_GUARDIAN: Record<string, string[]> = {
  stabilization: [
    "Сфера *{sphere}* сегодня. Практика Стабилизации — найти точку опоры.",
    "Утро — время для *{sphere}*. Практика устойчивости ждёт тебя.",
  ],
  relaxation: [
    "Практика Релаксации по сфере *{sphere}*. Выдохни и позволь телу расслабиться.",
    "Для сферы *{sphere}* — практика отпускания. Можно просто быть.",
  ],
  harmonization: [
    "Сфера *{sphere}*: практика Гармонизации. Время встретиться с собой.",
    "Для *{sphere}* сегодня — глубокая практика переосмысления. Ева рядом.",
  ],
};

export function formatPremiumMorning(
  type: "stabilization" | "relaxation" | "harmonization",
  sphere: string,
  guardianName: string | null,
  title: string,
  duration: string,
  desc: string,
): string {
  const sphereLabel = SPHERE_LABELS[sphere] ?? sphere;
  let intro: string;
  if (guardianName) {
    const tpl = pickByDay(MORNING_PREMIUM_WITH_GUARDIAN[type]);
    intro = tpl.replace("{name}", guardianName).replace("{sphere}", sphereLabel);
  } else {
    const tpl = pickByDay(MORNING_PREMIUM_NO_GUARDIAN[type]);
    intro = tpl.replace("{sphere}", sphereLabel);
  }
  return `${intro}\n\n*${title}* · ${duration}\n${desc}`;
}

// ─── Return reminders ────────────────────────────────────────────────────────

export const RETURN_1DAY = [
  "Твой мир начинает скучать 🌿\n\nВсего несколько минут — и он снова расцветёт.",
  "День без тебя — и в твоём мире стало чуть тише 🌫️\n\nЕва ждёт. Зайди, когда будешь готова.",
  "Без твоего внимания мир начинает увядать 🍂\n\nОдин маленький шаг — уже забота о себе.",
  "Твой внутренний мир помнит тебя 🌸\n\nЗаглянешь сегодня?",
];

export const RETURN_3DAY = [
  "Три дня тишины — и твой мир начал дремать 🌫️\n\nОдин шаг возвращает всё.",
  "Твой мир немного скучает по тебе 🌿\n\nХочешь заглянуть?",
  "Ева хранит твоё место 🌸\n\nКогда будешь готова — она рядом.",
  "Без твоего внимания мир затихает... 🌿\n\nМожет, сегодня — твоё время?",
];

export const RETURN_6DAY = [
  "Ева хранит твоё место. Приходи, когда будешь готова ❄️",
  "Твой мир дремлет 🌫️\n\nОн помнит тебя и ждёт.",
  "Шесть дней тишины ❄️\n\nОдин шаг обратно — и мир снова твой.",
  "Ева не уходит 🌙\n\nТвоё место всегда здесь.",
];

export function addJoyToReturn(baseText: string, days: 3 | 6, joyItem: string): string {
  if (days === 3) {
    return `${baseText} Кстати, ты говорила что тебя радует *${joyItem}* — сегодня хороший день для этого 🌿`;
  }
  return `Ева не уходит. И помнит что ты говорила про *${joyItem}*. Это всё ещё здесь — и ты тоже.`;
}

// ─── Weekly digest ────────────────────────────────────────────────────────────

export function formatDigest(avg: number, trend: string, growthSphere?: string): string {
  const emoji = avg >= 7 ? "🌸" : avg >= 5 ? "🌿" : "🌫️";
  let text = `${emoji} Итоги недели\n\nСреднее состояние: ${avg.toFixed(1)}/10${trend}`;
  if (growthSphere) {
    const label = SPHERE_LABELS[growthSphere] ?? growthSphere;
    text += `\n\nНа этой неделе сфера *${label}* выросла заметнее всего. Это не случайность — ты работала.`;
  }
  text += "\n\nХорошей недели 🌙";
  return text;
}

export function formatPremiumDigest(
  avg: number,
  trend: string,
  growthSphere?: string,
  attentionSphere?: string,
  guardianName?: string,
): string {
  const emoji = avg >= 7 ? "🌸" : avg >= 5 ? "🌿" : "🌫️";
  let text = `${emoji} Итоги недели\n\nСреднее состояние: ${avg.toFixed(1)}/10${trend}`;
  if (growthSphere) {
    const label = SPHERE_LABELS[growthSphere] ?? growthSphere;
    text += `\n\n*${label}* выросла больше всего. Ты работала — и это видно.`;
  }
  if (attentionSphere) {
    const label = SPHERE_LABELS[attentionSphere] ?? attentionSphere;
    text += `\n\nЕва замечает что *${label}* требует внимания.`;
    if (guardianName && attentionSphere) {
      const quote = GUARDIAN_QUOTES[attentionSphere];
      if (quote) {
        text += `\n\n${quote.replace("{name}", guardianName)}`;
      }
    }
  }
  text += "\n\nХорошей недели 🌙";
  return text;
}

// ─── Guardian quotes (for digest and weekly) ──────────────────────────────────

export const GUARDIAN_QUOTES: Record<string, string> = {
  family: "{name} напоминает: близкие важнее срочного.",
  relationships: "{name} говорит: настоящий контакт начинается с себя.",
  career: "{name} знает: твоё дело ждёт — не торопи и не откладывай.",
  growth: "{name} видит: каждый маленький шаг — это уже рост.",
  finance: "{name} напоминает: спокойствие за завтра начинается сегодня.",
  rest: "{name} говорит: восстановление — это тоже работа.",
  people: "{name} замечает: ты не одна — даже когда так кажется.",
  health: "{name} шепчет: тело помнит всё. Позаботься о нём сегодня.",
};

// ─── Oath follow-up replies (Premium, by sphere, 4 variants each) ────────────

export const OATH_REPLIES: Record<string, string[]> = {
  family: [
    "Ты позаботилась о том что важно. Близкие это чувствуют.",
    "Маленький шаг в сторону близких — это больше чем кажется.",
    "Ты сделала. И это остаётся.",
    "Семья начинается с таких моментов.",
  ],
  relationships: [
    "Ты выбрала контакт. Это смелее чем кажется.",
    "Один шаг к другому человеку — уже мост.",
    "Отношения строятся из таких моментов.",
    "Ты сделала — и мир чуть теплее.",
  ],
  career: [
    "Ты двинулась в сторону своего. Это не мелочь.",
    "Призвание — это не молния. Это такие шаги.",
    "Ты сказала — и сделала. Это уже путь.",
    "Твоё дело видит тебя.",
  ],
  growth: [
    "Каждый шаг вперёд остаётся с тобой навсегда.",
    "Ты выросла чуть больше сегодня.",
    "Развитие — это и есть такие маленькие решения.",
    "Ты сделала. Это уже не вернуть назад.",
  ],
  finance: [
    "Ты позаботилась о своём будущем. Это важно.",
    "Спокойствие за завтра строится из таких шагов.",
    "Деньги — это просто инструмент. Ты им пользуешься.",
    "Маленький финансовый шаг — большое решение.",
  ],
  rest: [
    "Ты позволила себе восстановиться. Это не лень — это мудрость.",
    "Отдых — тоже работа. И ты её сделала.",
    "Ты выбрала себя. Это правильно.",
    "Забота о себе начинается с таких моментов.",
  ],
  people: [
    "Ты вышла навстречу. Это уже связь.",
    "Окружение строится из таких маленьких выборов.",
    "Ты не одна — и это ты подтвердила сегодня.",
    "Твой мир чуть шире после этого шага.",
  ],
  health: [
    "Тело запомнит эту заботу.",
    "Ты позаботилась о себе. Это не эгоизм.",
    "Здоровье — это такие решения каждый день.",
    "Маленький шаг к телу — большое уважение к себе.",
  ],
};

export const OATH_DONE_FREE = "Отлично! Ты сделала это 🌱\n\n+15 монет добавлено. Каждый закрытый шаг — это рост.";

export function formatOathDonePremium(sphere: string): string {
  const replies = OATH_REPLIES[sphere] ?? OATH_REPLIES.growth;
  return `${pickByDay(replies)} 🌱\n\n+15 монет добавлено.`;
}

// ─── Diary notifications (Premium) ───────────────────────────────────────────

export const DIARY_INTRO_BY_WEEKDAY = [
  "Ева написала кое-что для тебя ✨",       // вс (0)
  "Ева написала кое-что для тебя ✨",       // пн (1)
  "Есть запись которая ждёт тебя 🌿",      // вт (2)
  "Ева заметила кое-что важное сегодня",    // ср (3)
  "Для тебя — слова которые Ева сохранила", // чт (4)
  "Конец недели. Ева написала.",            // пт (5)
  "Суббота. Тихая запись от Евы ✨",        // сб (6)
];

export function formatDiaryNotification(entryText: string): string {
  const day = new Date().getDay();
  const intro = DIARY_INTRO_BY_WEEKDAY[day];
  const preview = entryText.length > 150 ? entryText.slice(0, 150) + "..." : entryText;
  return `${intro}\n\n_${preview}_`;
}

// ─── World state notifications (Premium) ─────────────────────────────────────

export function formatWorldStateNotification(stateId: number, name: string, description: string): string {
  let prefix: string;
  if (stateId <= 10) {
    prefix = `Твой мир делает первые шаги. *${name}* — это только начало.`;
  } else if (stateId <= 20) {
    prefix = `*${name}*. Твой мир расцветает — день за днём.`;
  } else {
    prefix = `*${name}*. Ты дошла до этого момента. Это много.`;
  }
  return `Твой мир изменился ✨\n\n${prefix}\n\n_${description}_`;
}

// ─── Milestone diary (Premium) ────────────────────────────────────────────────

export const MILESTONE_TEXTS: Record<number, string> = {
  7: "7 записей. Ева видела тебя в семи разных моментах.\n\nЭто уже история.",
  30: "30 дней наблюдений. Ева видела как ты меняешься.\n\nНе каждый решается на такой путь.",
  100: "100 записей. Это целая книга — твоя и только твоя.\n\nЕва рядом с самого начала.",
};

// ─── Guardian reminder (Premium) ─────────────────────────────────────────────

export function formatGuardianReminder(emptySlots: number): string {
  return `У тебя ещё ${emptySlots} ${emptySlots === 1 ? "сфера без хранителя" : emptySlots < 5 ? "сферы без хранителя" : "сфер без хранителя"} ✨\n\nХранитель — твой персонаж для этой сферы. Создай его — и он будет сопровождать тебя в каждом путешествии.`;
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export function formatOnboardingStep1(
  practices: boolean,
  returnReminder: boolean,
  digest: boolean,
): string {
  return (
    `Что тебе присылать? 🌸\n\n` +
    `${practices ? "✅" : "☐"} Утреннюю практику\n` +
    `${returnReminder ? "✅" : "☐"} Напоминание о возвращении\n` +
    `${digest ? "✅" : "☐"} Еженедельный дайджест`
  );
}

export function formatOnboardingStep2(): string {
  return "В котором часу удобнее получать сообщения? ☀️\n\n(Московское время)";
}

export const WELCOME_MESSAGE =
  "Ева теперь будет писать тебе сюда 🌸\n\nКаждое утро — практика дня, подобранная под твоё настроение. Плюс мягкие напоминания, если твой мир начнёт увядать.";

export const PAUSE_CONFIRMED = (days: number) =>
  `Хорошо, уведомления приостановлены на ${days} ${days === 1 ? "день" : days < 5 ? "дня" : "дней"} 🌿\n\nЕва будет ждать.`;

export const PAUSE_RESUMED = "Ева снова с тобой ☀️\n\nУведомления возобновлены.";
