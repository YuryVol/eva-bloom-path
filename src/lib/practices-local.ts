// Shared local (client-side) practice data and localStorage helpers.
// Imported by both /practices and /practices/$practiceId routes.

import { CATALOG } from "@/lib/practices-catalog";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocalPractice {
  id: string;
  title: string;
  duration: string;
  description: string | { ty: string; vy: string };
  locked?: boolean;
  unlockCost?: number;
}

export interface LocalCategory {
  id: string;
  title: string;
  emoji: string;
  practices: LocalPractice[];
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

export const CATEGORIES: LocalCategory[] = [
  {
    id: "body",
    title: "Телесные",
    emoji: "🌿",
    practices: [
      {
        id: "breathing-478",
        title: "Дыхание 4-7-8",
        duration: "3 мин",
        description: { ty: "Вдох на 4 счёта, задержка на 7, выдох на 8. Повтори 3 раза. Помогает при тревоге и перед сном — активирует парасимпатическую нервную систему.", vy: "Вдох на 4 счёта, задержка на 7, выдох на 8. Повторите 3 раза. Помогает при тревоге и перед сном — активирует парасимпатическую нервную систему." },
      },
      {
        id: "body-scan",
        title: "Сканирование тела",
        duration: "5 мин",
        description: { ty: "Мысленно пройди от стоп до макушки. На каждой части тела задержись и просто замети — тепло, напряжение, покалывание, нейтральность. Без оценок.", vy: "Мысленно пройдите от стоп до макушки. На каждой части тела задержитесь и просто заметьте — тепло, напряжение, покалывание, нейтральность. Без оценок." },
      },
      {
        id: "grounding-54321",
        title: "Заземление 5-4-3-2-1",
        duration: "2 мин",
        description: { ty: "Назови: 5 вещей, которые видишь → 4 тактильных ощущения → 3 звука → 2 запаха → 1 вкус. Возвращает в настоящий момент при тревоге или диссоциации.", vy: "Назовите: 5 вещей, которые видите → 4 тактильных ощущения → 3 звука → 2 запаха → 1 вкус. Возвращает в настоящий момент при тревоге или диссоциации." },
      },
      {
        id: "shake",
        title: "Тряска (somatic shake)",
        duration: "1 мин",
        description: { ty: "Встань, расслабь колени и начни мягко трястись — как будто сбрасываешь воду. 60 секунд. Сбрасывает накопленное физическое напряжение.", vy: "Встаньте, расслабьте колени и начните мягко трястись — как будто сбрасываете воду. 60 секунд. Сбрасывает накопленное физическое напряжение." },
      },
      {
        id: "butterfly-hug",
        title: "Бабочка-обнимашка",
        duration: "2 мин",
        description: { ty: "Скрести руки на груди, пальцы на плечах. Начни попеременно постукивать — левая, правая, левая... Это EMDR-техника самоуспокоения. Почувствуй, как тело мягко успокаивается.", vy: "Скрестите руки на груди, пальцы на плечах. Начните попеременно постукивать — левая, правая, левая... Это EMDR-техника самоуспокоения. Почувствуйте, как тело мягко успокаивается." },
      },
    ],
  },
  {
    id: "mind",
    title: "Когнитивные",
    emoji: "✍️",
    practices: [
      {
        id: "three-good",
        title: "3 хорошие вещи",
        duration: "5 мин",
        description: { ty: "Запиши 3 момента из прошедшего дня, которые были хорошими — любой размер. Почему они случились? Тренирует мозг замечать позитивное без токсичного оптимизма.", vy: "Запишите 3 момента из прошедшего дня, которые были хорошими — любой размер. Почему они случились? Тренирует мозг замечать позитивное без токсичного оптимизма." },
      },
      {
        id: "morning-pages",
        title: "Утренние страницы",
        duration: "10 мин",
        description: "Сразу после пробуждения — 3 минуты свободного письма. Всё, что приходит в голову, без цензуры и редактуры. Очищает пространство для дня.",
      },
      {
        id: "fear-reframe",
        title: "Переосмысление страха",
        duration: "7 мин",
        description: { ty: "Возьми один страх из своего последнего путешествия. Запиши его. Затем спроси: «Что если это наоборот означает...?» Найди 3 версии. Мозг учится видеть альтернативы.", vy: "Возьмите один страх из последнего путешествия. Запишите его. Затем спросите: «Что если это наоборот означает...?» Найдите 3 версии. Мозг учится видеть альтернативы." },
      },
      {
        id: "10-ideas",
        title: "Список 10 идей",
        duration: "10 мин",
        description: { ty: "Выбери любую тему и запиши 10 идей без самокритики. Качество не важно — важна скорость и количество. Тренирует творческое мышление и снижает перфекционизм.", vy: "Выберите любую тему и запишите 10 идей без самокритики. Качество не важно — важна скорость и количество. Тренирует творческое мышление и снижает перфекционизм." },
      },
      {
        id: "letter-to-self",
        title: "Письмо себе",
        duration: "10 мин",
        description: { ty: "Напиши письмо себе-через-месяц. Что важно сейчас? Что ты хочешь, чтобы будущая ты помнила? Это якорит текущий момент и создаёт ощущение связи с собой.", vy: "Напишите письмо себе-через-месяц. Что важно сейчас? Что вы хотите, чтобы будущая вы помнили? Это якорит текущий момент и создаёт ощущение связи с собой." },
      },
    ],
  },
  {
    id: "presence",
    title: "Присутствие",
    emoji: "🕯️",
    practices: [
      {
        id: "pause",
        title: "Пауза",
        duration: "1 мин",
        description: { ty: "Просто остановись на 60 секунд. Ничего не делай, ничего не думай специально. Просто существуй. Это не медитация — это просто пауза.", vy: "Просто остановитесь на 60 секунд. Ничего не делайте, ничего не думайте специально. Просто существуйте. Это не медитация — это просто пауза." },
      },
      {
        id: "mindful-sip",
        title: "Осознанный глоток",
        duration: "3 мин",
        description: { ty: "Налей стакан воды или чая. Пей очень медленно, с полным вниманием — температура, вкус, ощущение в горле. Один глоток — один момент.", vy: "Налейте стакан воды или чая. Пейте очень медленно, с полным вниманием — температура, вкус, ощущение в горле. Один глоток — один момент." },
      },
      {
        id: "walk",
        title: "Прогулка",
        duration: "5–45 мин (по уровню)",
        description: { ty: "Выйди без наушников. Уровень 1 → 5 мин, уровень 2 → 15 мин, уровень 3 → 20 мин, уровень 4 → 30 мин, уровень 5+ → 45 мин. Просто иди и смотри по сторонам — мозгу нужен незаполненный эфир.", vy: "Выйдите без наушников. Уровень 1 → 5 мин, уровень 2 → 15 мин, уровень 3 → 20 мин, уровень 4 → 30 мин, уровень 5+ → 45 мин. Просто идите и смотрите по сторонам — мозгу нужен незаполненный эфир." },
      },
      {
        id: "gratitude-person",
        title: "Благодарность одному человеку",
        duration: "5 мин",
        description: { ty: "Вспомни одного человека, которому ты благодарна сегодня. Напиши или скажи ему что-то конкретное — не «спасибо за всё», а за что именно. Укрепляет связи.", vy: "Вспомните одного человека, которому вы благодарны сегодня. Напишите или скажите ему что-то конкретное — не «спасибо за всё», а за что именно. Укрепляет связи." },
      },
    ],
  },
  {
    id: "discharge",
    title: "Разгрузка",
    emoji: "⚡",
    practices: [
      {
        id: "scribble",
        title: "Каляки-маляки",
        duration: "10 мин",
        description: { ty: "Возьми лист бумаги и нарисуй то, что накопилось внутри — без правил, каракулями, любыми формами и линиями. Не думай, просто рисуй. Это не арт-терапия — это разгрузка. После можно смять лист.", vy: "Возьмите лист бумаги и нарисуйте то, что накопилось внутри — без правил, каракулями, любыми формами и линиями. Не думайте, просто рисуйте. Это не арт-терапия — это разгрузка. После можно смять лист." },
      },
      {
        id: "wall-push",
        title: "Стена",
        duration: "1–2 мин",
        description: { ty: "Встань у стены, упрись в неё ладонями и толкай с силой 30–60 секунд. Дыши. Сделай паузу, затем повтори. Тело умеет сбрасывать напряжение через усилие — доверься этому.", vy: "Встаньте у стены, упритесь ладонями и толкайте с силой 30–60 секунд. Дышите. Сделайте паузу, затем повторите. Тело умеет сбрасывать напряжение через усилие — доверьтесь этому." },
      },
      {
        id: "three-to-five",
        title: "3 по 5",
        duration: "5–7 мин",
        description: { ty: "Возьми ручку и бумагу. Поставь таймер на 5 минут. Пиши все мысли, которые сейчас волнуют — без остановки, без редактуры, без порядка. Когда всё выписано — голове легче. Можно сжечь или выбросить лист.", vy: "Возьмите ручку и бумагу. Поставьте таймер на 5 минут. Пишите все мысли, которые сейчас волнуют — без остановки, без редактуры, без порядка. Когда всё выписано — голове легче. Можно сжечь или выбросить лист." },
      },
    ],
  },
  {
    id: "relations",
    title: "Отношения",
    emoji: "💛",
    practices: [
      {
        id: "active-listen",
        title: "Активное слушание",
        duration: "Следующий разговор",
        description: { ty: "В следующем разговоре — не перебивай и не советуй. Только слушай и задавай уточняющие вопросы. Заметь, как изменится качество контакта.", vy: "В следующем разговоре — не перебивайте и не советуйте. Только слушайте и задавайте уточняющие вопросы. Заметьте, как изменится качество контакта." },
      },
      {
        id: "i-message",
        title: "Я-сообщение",
        duration: "В моменте",
        description: { ty: "Вместо «ты делаешь...» скажи «я чувствую... когда...». Одна фраза снимает защитную реакцию и открывает пространство для диалога.", vy: "Вместо «ты делаешь...» скажите «я чувствую... когда...». Одна фраза снимает защитную реакцию и открывает пространство для диалога." },
      },
      {
        id: "quality-time",
        title: "Качественное время",
        duration: "20 мин",
        description: "20 минут полного внимания одному человеку — без экрана, без параллельных дел. Просто быть рядом. Это один из главных языков любви.",
      },
    ],
  },
  {
    id: "special",
    title: "Особые",
    emoji: "✨",
    practices: [
      {
        id: "self-compassion",
        title: "Сострадание к себе",
        duration: "15 мин",
        locked: true,
        unlockCost: 30,
        description: { ty: "Положи руку на сердце. Скажи себе трижды: «Это больно. Боль — часть жизни. Я достаточно хороша». Протокол MSC Кристин Нефф — один из самых изученных методов снижения самокритики.", vy: "Положите руку на сердце. Скажите себе трижды: «Это больно. Боль — часть жизни. Я достаточно хороша». Протокол MSC Кристин Нефф — один из самых изученных методов снижения самокритики." },
      },
      {
        id: "safe-place",
        title: "Безопасное место",
        duration: "10 мин",
        locked: true,
        unlockCost: 50,
        description: { ty: "Закрой глаза. Представь место, где ты в полной безопасности — реальное или воображаемое. Задержись там 5 минут. Это EMDR-ресурс: можно использовать в любой момент тревоги.", vy: "Закройте глаза. Представьте место, где вы в полной безопасности — реальное или воображаемое. Задержитесь там 5 минут. Это EMDR-ресурс: можно использовать в любой момент тревоги." },
      },
      {
        id: "inner-child",
        title: "Внутренний ребёнок",
        duration: "20 мин",
        locked: true,
        unlockCost: 75,
        description: { ty: "Закрой глаза. Представь себя в возрасте 7–10 лет. Что ты чувствовала? Скажи той девочке то, что ей нужно было услышать тогда. Мощная техника IFS-терапии для работы с ранними паттернами.", vy: "Закройте глаза. Представьте себя в возрасте 7–10 лет. Что вы чувствовали? Скажите той девочке то, что ей нужно было услышать тогда. Мощная техника IFS-терапии." },
      },
      {
        id: "deep-emdr",
        title: "Глубокая EMDR-сессия",
        duration: "30 мин",
        locked: true,
        unlockCost: 100,
        description: { ty: "Расширенный вариант EMDR-практики: 5 циклов билатеральной стимуляции с паузами для интеграции. Используй только когда чувствуешь устойчивость — это интенсивная работа.", vy: "Расширенный вариант EMDR-практики: 5 циклов билатеральной стимуляции с паузами для интеграции. Используйте только когда чувствуете устойчивость." },
      },
    ],
  },
  {
    id: "health",
    title: "Здоровье",
    emoji: "🌱",
    practices: [
      {
        id: "body-check",
        title: "Проверка тела",
        duration: "Раз в час",
        description: { ty: "Раз в час задай себе: как я сейчас? Что нужно телу? Вода? Движение? Тепло? Три вдоха? Это тренировка внимания к себе до того, как тело начнёт кричать.", vy: "Раз в час задайте себе: как я сейчас? Что нужно телу? Вода? Движение? Тепло? Три вдоха? Это тренировка внимания к себе до того, как тело начнёт кричать." },
      },
      {
        id: "free-movement",
        title: "Движение без цели",
        duration: "5 мин",
        description: { ty: "5 минут двигайся так, как хочет тело — не упражнения, не тренировка. Потянись, покачайся, потряси руками. Тело знает, что ему нужно.", vy: "5 минут двигайтесь так, как хочет тело — не упражнения, не тренировка. Потянитесь, покачайтесь, потрясите руками. Тело знает, что ему нужно." },
      },
      {
        id: "early-sleep",
        title: "Ранний отбой",
        duration: "Раз в неделю",
        description: { ty: "Один раз в неделю — лечь спать на час раньше обычного. Просто попробуй. Одного раза достаточно, чтобы почувствовать разницу утром.", vy: "Один раз в неделю — лечь спать на час раньше обычного. Просто попробуйте. Одного раза достаточно, чтобы почувствовать разницу утром." },
      },
    ],
  },
];

// ─── Interactive (journey) practices ─────────────────────────────────────────

export interface InteractivePractice {
  id: string;           // = componentKey in practiceComponentMap (or "emdr")
  sphereId: string;     // e.g. "family"
  type: "stabilization" | "relaxation" | "harmonization" | "emdr";
  title: string;
  desc: string;
  duration: string;
  coins: number;        // shop price
  emoji: string;
}

export const INTERACTIVE_PRACTICES: InteractivePractice[] = [
  // ── Семья ──
  { id: "family-stabilization",       sphereId: "family",        type: "stabilization", emoji: "🏡", title: "Якорь рода",              desc: "Почувствуй тех, кто был рядом — живых и ушедших. Телесная практика опоры.",                              duration: "10 мин", coins: 15 },
  { id: "family-relaxation",          sphereId: "family",        type: "relaxation",    emoji: "✉️", title: "Письмо близкому",          desc: "Слова, которые давно ждут своего момента. Не обязательно отправлять.",                                   duration: "15 мин", coins: 25 },
  { id: "family-harmonization",       sphereId: "family",        type: "harmonization", emoji: "🎬", title: "Переписать финал",          desc: "Перепиши сцену из прошлого так, как ты хотела. Воображение меняет нейронные следы.",                     duration: "20 мин", coins: 35 },
  // ── Отношения ──
  { id: "relationships-stabilization",sphereId: "relationships", type: "stabilization", emoji: "💛", title: "Дыхание перед встречей",   desc: "Прежде чем встретиться с другим — встреться с собой. Вдох за вдохом.",                                   duration: "5 мин",  coins: 15 },
  { id: "relationships-relaxation",   sphereId: "relationships", type: "relaxation",    emoji: "🗂️", title: "Карта потребностей",       desc: "Твои потребности реальны. Посмотрим, какие из них уже удовлетворены.",                                    duration: "15 мин", coins: 25 },
  { id: "relationships-harmonization",sphereId: "relationships", type: "harmonization", emoji: "🤝", title: "Близость в теле",          desc: "Близость — это навык. Закрепим его на уровне телесного ощущения.",                                        duration: "20 мин", coins: 35 },
  // ── Карьера ──
  { id: "career-stabilization",       sphereId: "career",        type: "stabilization", emoji: "🌟", title: "Состояние потока",          desc: "Вспомни, когда время останавливалось. Это и есть твоё призвание.",                                        duration: "10 мин", coins: 15 },
  { id: "career-relaxation",          sphereId: "career",        type: "relaxation",    emoji: "🍂", title: "Листок на ветру",           desc: "Отпусти «должна». Практика освобождения от давления ожиданий.",                                          duration: "10 мин", coins: 25 },
  { id: "career-harmonization",       sphereId: "career",        type: "harmonization", emoji: "🔮", title: "Письмо из будущего",        desc: "Та, кто нашла свой путь, уже знает ответ. Дай ей написать тебе.",                                        duration: "20 мин", coins: 35 },
  // ── Развитие ──
  { id: "growth-stabilization",       sphereId: "growth",        type: "stabilization", emoji: "🌱", title: "Таймлайн роста",            desc: "Твоё развитие уже происходит. Давай увидим это вместе.",                                                  duration: "10 мин", coins: 15 },
  { id: "growth-relaxation",          sphereId: "growth",        type: "relaxation",    emoji: "🌫️", title: "Принятие незнания",         desc: "Позволь себе не знать всего. Это не слабость — это мудрость.",                                           duration: "10 мин", coins: 25 },
  { id: "growth-harmonization",       sphereId: "growth",        type: "harmonization", emoji: "🦉", title: "Внутренняя мудрость",       desc: "Внутри есть часть, которая уже знает ответ. Задай ей вопрос.",                                           duration: "20 мин", coins: 35 },
  // ── Финансы ──
  { id: "finance-stabilization",      sphereId: "finance",       type: "stabilization", emoji: "📊", title: "Аудит ресурсов",            desc: "Посмотрим на то, что у тебя уже есть. Факты успокаивают тревогу.",                                        duration: "10 мин", coins: 15 },
  { id: "finance-relaxation",         sphereId: "finance",       type: "relaxation",    emoji: "🗺️", title: "Карта тела и денег",        desc: "Деньги живут в теле раньше, чем в кошельке. Найдём, где прячется напряжение.",                            duration: "15 мин", coins: 25 },
  { id: "finance-harmonization",      sphereId: "finance",       type: "harmonization", emoji: "🔑", title: "Убеждения о деньгах",       desc: "Убеждения из детства — не приговор. Перепишем финансовый сценарий.",                                      duration: "20 мин", coins: 35 },
  // ── Отдых ──
  { id: "rest-stabilization",         sphereId: "rest",          type: "stabilization", emoji: "🌙", title: "Дыхание 90 секунд",         desc: "90 секунд. Ничего не нужно делать, решать, планировать. Просто быть.",                                    duration: "5 мин",  coins: 15 },
  { id: "rest-relaxation",            sphereId: "rest",          type: "relaxation",    emoji: "🛁", title: "Сканирование тела",          desc: "Пройдём по телу вместе — от макушки до стоп. С вниманием и без оценок.",                                  duration: "10 мин", coins: 25 },
  { id: "rest-harmonization",         sphereId: "rest",          type: "harmonization", emoji: "🌈", title: "Архив радости",             desc: "Что по-настоящему восстанавливает именно тебя? Создадим твой личный архив.",                               duration: "20 мин", coins: 35 },
  // ── Люди ──
  { id: "people-stabilization",       sphereId: "people",        type: "stabilization", emoji: "🗺️", title: "Карта окружения",           desc: "Посмотрим, кто есть рядом. Ты не одна — даже если сейчас так не ощущается.",                               duration: "10 мин", coins: 15 },
  { id: "people-relaxation",          sphereId: "people",        type: "relaxation",    emoji: "🧹", title: "Возврат чужого",            desc: "Чужое можно вернуть. Это не предательство — это граница.",                                               duration: "15 мин", coins: 25 },
  { id: "people-harmonization",       sphereId: "people",        type: "harmonization", emoji: "⭕", title: "Диаграмма близости",        desc: "Как тебя видят близкие? Как ты видишь себя? Найдём пересечение.",                                        duration: "20 мин", coins: 35 },
  // ── Здоровье ──
  { id: "health-stabilization",       sphereId: "health",        type: "stabilization", emoji: "💚", title: "Благодарность телу",        desc: "Тело делает для тебя так много. Скажем ему спасибо — конкретно.",                                         duration: "10 мин", coins: 15 },
  { id: "health-relaxation",          sphereId: "health",        type: "relaxation",    emoji: "👂", title: "Послание симптома",         desc: "У каждого симптома есть послание. Выслушаем его — без страха.",                                           duration: "15 мин", coins: 25 },
  { id: "health-harmonization",       sphereId: "health",        type: "harmonization", emoji: "✨", title: "Видение здоровья",          desc: "Представь своё тело через год. Здоровое. Отдохнувшее. Живое.",                                           duration: "20 мин", coins: 35 },
  // ── EMDR ──
  { id: "emdr",                       sphereId: "rest",          type: "emdr",          emoji: "🦋", title: "EMDR-сессия",               desc: "Билатеральная стимуляция — 3 цикла. Мягко растворяет телесное напряжение и застрявшие образы.",           duration: "10 мин", coins: 50 },
];

// Flat lookup: id → InteractivePractice
export const INTERACTIVE_MAP: Record<string, InteractivePractice> = Object.fromEntries(
  INTERACTIVE_PRACTICES.map((p) => [p.id, p])
);

// Which interactive practice IDs belong to a sphere (for auto-unlock)
export function getSpherePracticeIds(sphereId: string): string[] {
  return INTERACTIVE_PRACTICES
    .filter((p) => p.sphereId === sphereId && p.type !== "emdr")
    .map((p) => p.id);
}

// Flat lookup: id → { practice, category }
export const ALL_PRACTICES: Record<string, { practice: LocalPractice; category: LocalCategory }> = {};
for (const cat of CATEGORIES) {
  for (const p of cat.practices) {
    ALL_PRACTICES[p.id] = { practice: p, category: cat };
  }
}

// Mood badges sourced from practices-catalog.ts
export const MOOD_MAP: Record<string, "grounding" | "standard" | "deep"> = Object.fromEntries(
  CATALOG.map((p) => [p.id, p.mood])
);

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = "eva:practices-done";
export const UNLOCKED_KEY = "eva:unlocked-practices";

export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function getUnlockedPractices(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(UNLOCKED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch { return new Set(); }
}

export function saveUnlockedPractice(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getUnlockedPractices();
    existing.add(id);
    localStorage.setItem(UNLOCKED_KEY, JSON.stringify([...existing]));
  } catch { /* ignore */ }
}

export function loadDone(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return new Set(parsed[getTodayKey()] ?? []);
  } catch { return new Set(); }
}

export function saveDone(done: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    const existing: Record<string, string[]> = {};
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) Object.assign(existing, JSON.parse(raw));
    existing[getTodayKey()] = [...done];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch { /* ignore */ }
}

export function computeStreak(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    let streak = 0;
    const now = new Date();
    for (let i = 0; i <= 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      if (parsed[key]?.length > 0) streak++;
      else if (i > 0) break;
    }
    return streak;
  } catch { return 0; }
}
