export type ShopCategory = "practice" | "psychologist" | "course";

export interface ShopItem {
  id: string;
  category: ShopCategory;
  icon: string;
  title: string;
  desc: string;
  coins: number;
  level_required: number;
  /** External link (psychologist / course) */
  url?: string;
  /** Internal practice route opened after purchase (or immediately if coins === 0) */
  practiceRoute?: string;
}

export const SHOP_ITEMS: ShopItem[] = [

  // ── Бесплатные текстовые практики ─────────────────────────────────────────
  // Эти практики бесплатны — кнопка «Открыть» ведёт сразу на страницу практики.

  {
    id: "free-breathing-478",
    category: "practice",
    icon: "🌬️",
    title: "Дыхание 4-7-8",
    desc: "Вдох 4 · задержка 7 · выдох 8. Три цикла снимают тревогу и помогают заснуть. 3 мин.",
    coins: 0,
    level_required: 1,
    practiceRoute: "/practices/breathing-478",
  },
  {
    id: "free-grounding-54321",
    category: "practice",
    icon: "⚓",
    title: "Заземление 5-4-3-2-1",
    desc: "5 вещей вижу → 4 ощущения → 3 звука → 2 запаха → 1 вкус. Возвращает в момент «здесь и сейчас». 2 мин.",
    coins: 0,
    level_required: 1,
    practiceRoute: "/practices/grounding-54321",
  },
  {
    id: "free-butterfly-hug",
    category: "practice",
    icon: "🦋",
    title: "Бабочка-обнимашка",
    desc: "Попеременные постукивания по плечам — EMDR-техника самоуспокоения. Работает за 2 минуты.",
    coins: 0,
    level_required: 1,
    practiceRoute: "/practices/butterfly-hug",
  },
  {
    id: "free-three-good",
    category: "practice",
    icon: "✨",
    title: "3 хорошие вещи",
    desc: "Запиши 3 момента из прошедшего дня, которые были хорошими. Тренирует мозг замечать позитивное. 5 мин.",
    coins: 0,
    level_required: 1,
    practiceRoute: "/practices/three-good",
  },
  {
    id: "free-morning-pages",
    category: "practice",
    icon: "📝",
    title: "Утренние страницы",
    desc: "Сразу после пробуждения — свободное письмо без цензуры. Очищает пространство для дня. 10 мин.",
    coins: 0,
    level_required: 1,
    practiceRoute: "/practices/morning-pages",
  },
  {
    id: "free-pause",
    category: "practice",
    icon: "⏸️",
    title: "Пауза",
    desc: "Просто остановись на 60 секунд. Ничего не делай. Просто существуй. 1 мин.",
    coins: 0,
    level_required: 1,
    practiceRoute: "/practices/pause",
  },
  {
    id: "free-walk",
    category: "practice",
    icon: "🚶",
    title: "Прогулка",
    desc: "Выйди без наушников. Иди и смотри по сторонам — мозгу нужен незаполненный эфир. 5–45 мин.",
    coins: 0,
    level_required: 1,
    practiceRoute: "/practices/walk",
  },
  {
    id: "free-scribble",
    category: "practice",
    icon: "🖊️",
    title: "Каляки-маляки",
    desc: "Рисуй то, что накопилось внутри — без правил и без цели. Это разгрузка, не арт-терапия. 10 мин.",
    coins: 0,
    level_required: 1,
    practiceRoute: "/practices/scribble",
  },
  {
    id: "free-i-message",
    category: "practice",
    icon: "💬",
    title: "Я-сообщение",
    desc: "Вместо «ты делаешь...» — «я чувствую... когда...». Одна фраза снимает защитную реакцию.",
    coins: 0,
    level_required: 1,
    practiceRoute: "/practices/i-message",
  },
  {
    id: "free-body-check",
    category: "practice",
    icon: "🧘",
    title: "Проверка тела",
    desc: "Раз в час: как я сейчас? Что нужно телу? Вода? Движение? Пауза? Тренировка внимания к себе.",
    coins: 0,
    level_required: 1,
    practiceRoute: "/practices/body-check",
  },

  // ── Интерактивные практики из путешествий ────────────────────────────────
  // Показываются неактивными новым пользователям (цена в монетах).
  // После прохождения практики в путешествии — исчезают из магазина
  // и появляются на экране практик. Можно также купить за монеты.

  // Семья
  { id: "family-stabilization",        category: "practice", icon: "🏡", title: "Якорь рода",            desc: "Телесная практика опоры. Почувствуй тех, кто был рядом — живых и ушедших. 10 мин.",                      coins: 15, level_required: 1, practiceRoute: "/practices/run/family-stabilization" },
  { id: "family-relaxation",           category: "practice", icon: "✉️", title: "Письмо близкому",        desc: "Слова, которые давно ждут своего момента. Не обязательно отправлять. 15 мин.",                          coins: 25, level_required: 1, practiceRoute: "/practices/run/family-relaxation" },
  { id: "family-harmonization",        category: "practice", icon: "🎬", title: "Переписать финал",        desc: "Перепиши болезненную сцену из прошлого так, как ты хотела. 20 мин.",                                    coins: 35, level_required: 1, practiceRoute: "/practices/run/family-harmonization" },

  // Отношения
  { id: "relationships-stabilization", category: "practice", icon: "💛", title: "Дыхание перед встречей", desc: "Прежде чем встретиться с другим — встреться с собой. Вдох за вдохом. 5 мин.",                           coins: 15, level_required: 1, practiceRoute: "/practices/run/relationships-stabilization" },
  { id: "relationships-relaxation",    category: "practice", icon: "🗂️", title: "Карта потребностей",     desc: "Твои потребности реальны. Посмотрим, какие из них уже удовлетворены. 15 мин.",                          coins: 25, level_required: 1, practiceRoute: "/practices/run/relationships-relaxation" },
  { id: "relationships-harmonization", category: "practice", icon: "🤝", title: "Близость в теле",        desc: "Близость — это навык. Закрепим его на уровне телесного ощущения. 20 мин.",                              coins: 35, level_required: 1, practiceRoute: "/practices/run/relationships-harmonization" },

  // Карьера
  { id: "career-stabilization",        category: "practice", icon: "🌟", title: "Состояние потока",        desc: "Вспомни, когда время останавливалось. Это и есть твоё призвание. 10 мин.",                              coins: 15, level_required: 1, practiceRoute: "/practices/run/career-stabilization" },
  { id: "career-relaxation",           category: "practice", icon: "🍂", title: "Листок на ветру",         desc: "Отпусти «должна». Практика освобождения от давления ожиданий. 10 мин.",                                coins: 25, level_required: 1, practiceRoute: "/practices/run/career-relaxation" },
  { id: "career-harmonization",        category: "practice", icon: "🔮", title: "Письмо из будущего",      desc: "Та, кто нашла свой путь, уже знает ответ. Дай ей написать тебе. 20 мин.",                               coins: 35, level_required: 1, practiceRoute: "/practices/run/career-harmonization" },

  // Развитие
  { id: "growth-stabilization",        category: "practice", icon: "🌱", title: "Таймлайн роста",          desc: "Твоё развитие уже происходит. Давай увидим это вместе. 10 мин.",                                       coins: 15, level_required: 1, practiceRoute: "/practices/run/growth-stabilization" },
  { id: "growth-relaxation",           category: "practice", icon: "🌫️", title: "Принятие незнания",       desc: "Позволь себе не знать всего. Это не слабость — это мудрость. 10 мин.",                                 coins: 25, level_required: 1, practiceRoute: "/practices/run/growth-relaxation" },
  { id: "growth-harmonization",        category: "practice", icon: "🦉", title: "Внутренняя мудрость",     desc: "Внутри есть часть, которая уже знает ответ. Задай ей вопрос. 20 мин.",                                  coins: 35, level_required: 1, practiceRoute: "/practices/run/growth-harmonization" },

  // Финансы
  { id: "finance-stabilization",       category: "practice", icon: "📊", title: "Аудит ресурсов",          desc: "Посмотрим на то, что у тебя уже есть. Факты успокаивают тревогу. 10 мин.",                             coins: 15, level_required: 1, practiceRoute: "/practices/run/finance-stabilization" },
  { id: "finance-relaxation",          category: "practice", icon: "🗺️", title: "Карта тела и денег",      desc: "Деньги живут в теле раньше, чем в кошельке. Найдём, где прячется напряжение. 15 мин.",                 coins: 25, level_required: 1, practiceRoute: "/practices/run/finance-relaxation" },
  { id: "finance-harmonization",       category: "practice", icon: "🔑", title: "Убеждения о деньгах",     desc: "Убеждения из детства — не приговор. Перепишем финансовый сценарий. 20 мин.",                            coins: 35, level_required: 1, practiceRoute: "/practices/run/finance-harmonization" },

  // Отдых
  { id: "rest-stabilization",          category: "practice", icon: "🌙", title: "Дыхание 90 секунд",       desc: "90 секунд. Ничего не нужно делать, решать, планировать. Просто быть. 5 мин.",                          coins: 15, level_required: 1, practiceRoute: "/practices/run/rest-stabilization" },
  { id: "rest-relaxation",             category: "practice", icon: "🛁", title: "Сканирование тела",        desc: "Пройдём по телу вместе — от макушки до стоп. С вниманием и без оценок. 10 мин.",                      coins: 25, level_required: 1, practiceRoute: "/practices/run/rest-relaxation" },
  { id: "rest-harmonization",          category: "practice", icon: "🌈", title: "Архив радости",            desc: "Что по-настоящему восстанавливает именно тебя? Создадим твой личный архив. 20 мин.",                   coins: 35, level_required: 1, practiceRoute: "/practices/run/rest-harmonization" },

  // Люди
  { id: "people-stabilization",        category: "practice", icon: "🗺️", title: "Карта окружения",         desc: "Посмотрим, кто есть рядом. Ты не одна — даже если сейчас так не ощущается. 10 мин.",                  coins: 15, level_required: 1, practiceRoute: "/practices/run/people-stabilization" },
  { id: "people-relaxation",           category: "practice", icon: "🧹", title: "Возврат чужого",          desc: "Чужое можно вернуть. Это не предательство — это граница. 15 мин.",                                    coins: 25, level_required: 1, practiceRoute: "/practices/run/people-relaxation" },
  { id: "people-harmonization",        category: "practice", icon: "⭕", title: "Диаграмма близости",      desc: "Как тебя видят близкие? Как ты видишь себя? Найдём пересечение. 20 мин.",                              coins: 35, level_required: 1, practiceRoute: "/practices/run/people-harmonization" },

  // Здоровье
  { id: "health-stabilization",        category: "practice", icon: "💚", title: "Благодарность телу",      desc: "Тело делает для тебя так много. Скажем ему спасибо — конкретно. 10 мин.",                             coins: 15, level_required: 1, practiceRoute: "/practices/run/health-stabilization" },
  { id: "health-relaxation",           category: "practice", icon: "👂", title: "Послание симптома",       desc: "У каждого симптома есть послание. Выслушаем его — без страха. 15 мин.",                                coins: 25, level_required: 1, practiceRoute: "/practices/run/health-relaxation" },
  { id: "health-harmonization",        category: "practice", icon: "✨", title: "Видение здоровья",        desc: "Представь своё тело через год. Здоровое. Отдохнувшее. Живое. 20 мин.",                                 coins: 35, level_required: 1, practiceRoute: "/practices/run/health-harmonization" },

  // EMDR
  { id: "emdr",                        category: "practice", icon: "🦋", title: "EMDR-сессия",             desc: "Билатеральная стимуляция — 3 цикла. Мягко растворяет телесное напряжение и застрявшие образы. 10 мин.", coins: 50, level_required: 2, practiceRoute: "/practices/run/emdr" },

  // ── Психолог ──────────────────────────────────────────────────────────────

  {
    id: "psych-session-10",
    category: "psychologist",
    icon: "🧑‍⚕️",
    title: "Скидка 10% на сессию",
    desc: "Промокод на первую сессию с психологом-партнёром ЕВА. Онлайн, 50 мин.",
    coins: 50,
    level_required: 1,
    url: "https://eva.partners/psych?utm_source=eva&utm_medium=shop&utm_campaign=session10",
  },
  {
    id: "psych-session-20",
    category: "psychologist",
    icon: "💚",
    title: "Скидка 20% на курс из 4 сессий",
    desc: "Четыре встречи с психологом — глубокая работа в сопровождении.",
    coins: 150,
    level_required: 3,
    url: "https://eva.partners/psych?utm_source=eva&utm_medium=shop&utm_campaign=session20",
  },

  // ── Курсы ─────────────────────────────────────────────────────────────────

  {
    id: "course-anxiety",
    category: "course",
    icon: "📚",
    title: "Курс: Тревога и как с ней жить",
    desc: "7 уроков о природе тревоги, инструменты для ежедневной практики.",
    coins: 80,
    level_required: 1,
    url: "https://eva.partners/courses/anxiety?utm_source=eva&utm_medium=shop",
  },
  {
    id: "course-relationships",
    category: "course",
    icon: "💞",
    title: "Курс: Близость без потери себя",
    desc: "5 уроков о здоровых границах и привязанности в отношениях.",
    coins: 80,
    level_required: 2,
    url: "https://eva.partners/courses/relationships?utm_source=eva&utm_medium=shop",
  },
  {
    id: "course-self-compassion",
    category: "course",
    icon: "🌸",
    title: "Курс: Сострадание к себе",
    desc: "8 уроков по методу Кристин Нефф. Мягкость вместо самокритики.",
    coins: 100,
    level_required: 3,
    url: "https://eva.partners/courses/self-compassion?utm_source=eva&utm_medium=shop",
  },
  {
    id: "course-burnout",
    category: "course",
    icon: "🔥",
    title: "Курс: Выход из выгорания",
    desc: "6 уроков — диагностика, восстановление, профилактика.",
    coins: 90,
    level_required: 2,
    url: "https://eva.partners/courses/burnout?utm_source=eva&utm_medium=shop",
  },
];

export const CATEGORY_LABELS: Record<ShopCategory, string> = {
  practice: "Практики",
  psychologist: "Психолог",
  course: "Курсы",
};

export const CATEGORY_ICONS: Record<ShopCategory, string> = {
  practice: "🧘",
  psychologist: "🧑‍⚕️",
  course: "📚",
};
