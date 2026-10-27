/**
 * Server-safe practices catalog (no React). Shared between server.ts cron and
 * the practices UI screen. Keep descriptions as plain text for Telegram messages.
 */

export interface CatalogPractice {
  id: string;
  title: string;
  duration: string;
  /** "grounding" = low-score days; "standard" = mid; "deep" = high-score days */
  mood: "grounding" | "standard" | "deep";
  descShort: string;
}

export const CATALOG: CatalogPractice[] = [
  {
    id: "breathing-478",
    title: "Дыхание 4-7-8",
    duration: "3 мин",
    mood: "grounding",
    descShort: "Вдох 4 счёта · задержка 7 · выдох 8. Повтори 3 раза.",
  },
  {
    id: "grounding-54321",
    title: "Заземление 5-4-3-2-1",
    duration: "2 мин",
    mood: "grounding",
    descShort: "5 вещей вижу → 4 ощущения → 3 звука → 2 запаха → 1 вкус.",
  },
  {
    id: "shake",
    title: "Тряска (somatic shake)",
    duration: "1 мин",
    mood: "grounding",
    descShort: "Встань и мягко потряси тело 60 секунд — сбрасывает напряжение.",
  },
  {
    id: "butterfly-hug",
    title: "Бабочка-обнимашка",
    duration: "2 мин",
    mood: "grounding",
    descShort: "Скрести руки на груди, постукивай попеременно — левая, правая.",
  },
  {
    id: "pause",
    title: "Пауза",
    duration: "1 мин",
    mood: "standard",
    descShort: "Просто остановись на 60 секунд. Ничего не делай, просто существуй.",
  },
  {
    id: "mindful-sip",
    title: "Осознанный глоток",
    duration: "3 мин",
    mood: "standard",
    descShort: "Выпей стакан воды с полным вниманием к каждому глотку.",
  },
  {
    id: "body-scan",
    title: "Сканирование тела",
    duration: "5 мин",
    mood: "standard",
    descShort: "Мысленно пройди от стоп до макушки, просто замечая ощущения.",
  },
  {
    id: "three-good",
    title: "3 хорошие вещи",
    duration: "5 мин",
    mood: "standard",
    descShort: "Запиши 3 момента из сегодня, которые были хорошими.",
  },
  {
    id: "walk",
    title: "Прогулка",
    duration: "5–45 мин",
    mood: "standard",
    descShort: "Выйди на улицу без наушников — длительность зависит от твоего уровня.",
  },
  {
    id: "scribble",
    title: "Каляки-маляки",
    duration: "10 мин",
    mood: "standard",
    descShort: "Возьми лист и нарисуй эмоции, которые накопились внутри — без правил и оценок.",
  },
  {
    id: "wall-push",
    title: "Стена",
    duration: "1–2 мин",
    mood: "grounding",
    descShort: "Опрись на стену с силой 30–60 сек. Помогает выгрузить напряжение из тела.",
  },
  {
    id: "three-to-five",
    title: "3 по 5",
    duration: "5–7 мин",
    mood: "standard",
    descShort: "Выпиши все мысли, которые сейчас волнуют — не останавливайся 5 минут.",
  },
  {
    id: "morning-pages",
    title: "Утренние страницы",
    duration: "10 мин",
    mood: "deep",
    descShort: "3 минуты свободного письма сразу после пробуждения — без цензуры.",
  },
  {
    id: "fear-reframe",
    title: "Переосмысление страха",
    duration: "7 мин",
    mood: "deep",
    descShort: "Возьми один страх и найди 3 альтернативные интерпретации.",
  },
  {
    id: "letter-to-self",
    title: "Письмо себе",
    duration: "10 мин",
    mood: "deep",
    descShort: "Напиши письмо себе-через-месяц. Что важно прямо сейчас?",
  },
  {
    id: "gratitude-person",
    title: "Благодарность одному человеку",
    duration: "5 мин",
    mood: "deep",
    descShort: "Напиши или скажи кому-то конкретное «спасибо» — за что именно.",
  },
];

/**
 * Picks today's recommended practice based on the user's last check-in score.
 * Deterministic per calendar day so all users with the same mood bucket get
 * the same practice (makes it feel curated, not random).
 */
export function pickPracticeOfDay(score: number | null): CatalogPractice {
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));

  let pool: CatalogPractice[];
  if (score === null) {
    pool = CATALOG.filter((p) => p.mood === "standard");
  } else if (score <= 4) {
    pool = CATALOG.filter((p) => p.mood === "grounding");
  } else if (score >= 7) {
    pool = CATALOG.filter((p) => p.mood === "deep");
  } else {
    pool = CATALOG.filter((p) => p.mood === "standard");
  }

  return pool[dayIndex % pool.length];
}
