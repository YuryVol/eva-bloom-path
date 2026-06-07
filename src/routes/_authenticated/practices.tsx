import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, ArrowLeft } from "lucide-react";
import { AmbientBackground } from "@/components/eva/AmbientBackground";
import { GlassCard } from "@/components/eva/GlassCard";

export const Route = createFileRoute("/_authenticated/practices")({
  component: PracticesScreen,
  head: () => ({ meta: [{ title: "Практики — ЕВА" }] }),
});

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Practice {
  id: string;
  title: string;
  duration: string;
  description: string;
}

interface Category {
  id: string;
  title: string;
  emoji: string;
  practices: Practice[];
}

const CATEGORIES: Category[] = [
  {
    id: "body",
    title: "Телесные",
    emoji: "🌿",
    practices: [
      {
        id: "breathing-478",
        title: "Дыхание 4-7-8",
        duration: "3 мин",
        description:
          "Вдох на 4 счёта, задержка на 7, выдох на 8. Повтори 3 раза. Помогает при тревоге и перед сном — активирует парасимпатическую нервную систему.",
      },
      {
        id: "body-scan",
        title: "Сканирование тела",
        duration: "5 мин",
        description:
          "Мысленно пройди от стоп до макушки. На каждой части тела задержись и просто замети — тепло, напряжение, покалывание, нейтральность. Без оценок.",
      },
      {
        id: "grounding-54321",
        title: "Заземление 5-4-3-2-1",
        duration: "2 мин",
        description:
          "Назови: 5 вещей, которые видишь → 4 тактильных ощущения → 3 звука → 2 запаха → 1 вкус. Возвращает в настоящий момент при тревоге или диссоциации.",
      },
      {
        id: "shake",
        title: "Тряска (somatic shake)",
        duration: "1 мин",
        description:
          "Встань, расслабь колени и начни мягко трястись — как будто сбрасываешь воду. 60 секунд. Сбрасывает накопленное физическое напряжение.",
      },
      {
        id: "butterfly-hug",
        title: "Бабочка-обнимашка",
        duration: "2 мин",
        description:
          "Скрести руки на груди, пальцы на плечах. Начни попеременно постукивать — левая, правая, левая... Это EMDR-техника самоуспокоения. Почувствуй, как тело мягко успокаивается.",
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
        description:
          "Запиши 3 момента из прошедшего дня, которые были хорошими — любой размер. Почему они случились? Тренирует мозг замечать позитивное без токсичного оптимизма.",
      },
      {
        id: "morning-pages",
        title: "Утренние страницы",
        duration: "10 мин",
        description:
          "Сразу после пробуждения — 3 минуты свободного письма. Всё, что приходит в голову, без цензуры и редактуры. Очищает пространство для дня.",
      },
      {
        id: "fear-reframe",
        title: "Переосмысление страха",
        duration: "7 мин",
        description:
          "Возьми один страх из своего последнего путешествия. Запиши его. Затем спроси: «Что если это наоборот означает...?» Найди 3 версии. Мозг учится видеть альтернативы.",
      },
      {
        id: "10-ideas",
        title: "Список 10 идей",
        duration: "10 мин",
        description:
          "Выбери любую тему и запиши 10 идей без самокритики. Качество не важно — важна скорость и количество. Тренирует творческое мышление и снижает перфекционизм.",
      },
      {
        id: "letter-to-self",
        title: "Письмо себе",
        duration: "10 мин",
        description:
          "Напиши письмо себе-через-месяц. Что важно сейчас? Что ты хочешь, чтобы будущая ты помнила? Это якорит текущий момент и создаёт ощущение связи с собой.",
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
        description:
          "Просто остановись на 60 секунд. Ничего не делай, ничего не думай специально. Просто существуй. Это не медитация — это просто пауза.",
      },
      {
        id: "mindful-sip",
        title: "Осознанный глоток",
        duration: "3 мин",
        description:
          "Налей стакан воды или чая. Пей очень медленно, с полным вниманием — температура, вкус, ощущение в горле. Один глоток — один момент.",
      },
      {
        id: "walk",
        title: "Прогулка без телефона",
        duration: "10+ мин",
        description:
          "Выйди на 10 минут без наушников и телефона. Просто иди и смотри по сторонам. Мозгу нужен незаполненный эфир — это время идей и восстановления.",
      },
      {
        id: "gratitude-person",
        title: "Благодарность одному человеку",
        duration: "5 мин",
        description:
          "Вспомни одного человека, которому ты благодарна сегодня. Напиши или скажи ему что-то конкретное — не «спасибо за всё», а за что именно. Укрепляет связи.",
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
        description:
          "В следующем разговоре — не перебивай и не советуй. Только слушай и задавай уточняющие вопросы. Заметь, как изменится качество контакта.",
      },
      {
        id: "i-message",
        title: "Я-сообщение",
        duration: "В моменте",
        description:
          "Вместо «ты делаешь...» скажи «я чувствую... когда...». Одна фраза снимает защитную реакцию и открывает пространство для диалога.",
      },
      {
        id: "quality-time",
        title: "Качественное время",
        duration: "20 мин",
        description:
          "20 минут полного внимания одному человеку — без экрана, без параллельных дел. Просто быть рядом. Это один из главных языков любви.",
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
        description:
          "Раз в час задай себе: как я сейчас? Что нужно телу? Вода? Движение? Тепло? Три вдоха? Это тренировка внимания к себе до того, как тело начнёт кричать.",
      },
      {
        id: "free-movement",
        title: "Движение без цели",
        duration: "5 мин",
        description:
          "5 минут двигайся так, как хочет тело — не упражнения, не тренировка. Потянись, покачайся, потряси руками. Тело знает, что ему нужно.",
      },
      {
        id: "early-sleep",
        title: "Ранний отбой",
        duration: "Раз в неделю",
        description:
          "Один раз в неделю — лечь спать на час раньше обычного. Просто попробуй. Одного раза достаточно, чтобы почувствовать разницу утром.",
      },
    ],
  },
];

// ─── Local storage helpers ────────────────────────────────────────────────────

const STORAGE_KEY = "eva:practices-done";

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function loadDone(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return new Set(parsed[getTodayKey()] ?? []);
  } catch {
    return new Set();
  }
}

function saveDone(done: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    const existing: Record<string, string[]> = {};
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) Object.assign(existing, JSON.parse(raw));
    // keep only last 7 days
    const today = getTodayKey();
    existing[today] = [...done];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    /* ignore */
  }
}

function computeStreak(): number {
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
      if (parsed[key] && parsed[key].length > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  } catch {
    return 0;
  }
}

// ─── Practice card ────────────────────────────────────────────────────────────

function PracticeCard({
  practice,
  done,
  onDone,
}: {
  practice: Practice;
  done: boolean;
  onDone: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
        done
          ? "border-primary/50 bg-primary/5"
          : "border-border/60 bg-card/60"
      } backdrop-blur-sm`}
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        {/* Done indicator */}
        <span
          className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
            done
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border/60"
          }`}
        >
          {done && <Check className="size-3.5" strokeWidth={2.5} />}
        </span>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium leading-snug ${done ? "text-foreground/60 line-through" : "text-foreground"}`}
          >
            {practice.title}
          </p>
          <p className="text-[11px] text-muted-foreground">{practice.duration}</p>
        </div>

        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-4 border-t border-border/40 px-5 py-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {practice.description}
              </p>
              {!done && (
                <button
                  type="button"
                  onClick={() => onDone(practice.id)}
                  className="self-start rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 active:scale-95"
                >
                  Выполнено ✓
                </button>
              )}
              {done && (
                <p className="text-xs text-primary/70 font-medium">
                  ✓ Завершено сегодня · +5 XP
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Category accordion ───────────────────────────────────────────────────────

function CategorySection({
  category,
  done,
  onDone,
  defaultOpen,
}: {
  category: Category;
  done: Set<string>;
  onDone: (id: string) => void;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const completedCount = category.practices.filter((p) => done.has(p.id)).length;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 px-1 py-2 text-left"
      >
        <span className="text-xl">{category.emoji}</span>
        <span className="flex-1 font-display text-base text-foreground">
          {category.title}
        </span>
        {completedCount > 0 && (
          <span className="text-xs text-primary font-medium">
            {completedCount}/{category.practices.length}
          </span>
        )}
        <ChevronDown
          className={`size-4 text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="cat-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 pb-2">
              {category.practices.map((p) => (
                <PracticeCard
                  key={p.id}
                  practice={p}
                  done={done.has(p.id)}
                  onDone={onDone}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

function PracticesScreen() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setDone(loadDone());
    setStreak(computeStreak());
  }, []);

  const handleDone = (id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveDone(next);
      return next;
    });
  };

  const totalDone = done.size;
  const totalPractices = CATEGORIES.reduce((s, c) => s + c.practices.length, 0);

  return (
    <main className="relative h-[100dvh] overflow-hidden bg-[#F9F4EE]">
      <AmbientBackground theme="safe" />

      {/* Шапка — фиксированная */}
      <div className="relative z-10 mx-auto w-full max-w-md px-5 pt-5">
        <Link
          to="/home"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Мир Евы
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
            Каждый день
          </p>
          <h1 className="font-display text-2xl text-glow">Твои практики</h1>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Маленькие действия, которые поддерживают работу между путешествиями.
          </p>
        </motion.div>

        {/* Progress strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-3"
        >
          <GlassCard className="p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Сегодня выполнено</span>
              <span className="font-display text-base text-foreground">
                {totalDone} / {totalPractices}
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{
                  width: `${totalPractices > 0 ? (totalDone / totalPractices) * 100 : 0}%`,
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            {streak >= 2 && (
              <p className="mt-3 text-xs text-muted-foreground">
                🔥 {streak} {streak < 5 ? "дня" : "дней"} подряд — так держать!
              </p>
            )}
            {totalDone === totalPractices && totalPractices > 0 && (
              <p className="mt-3 text-xs font-medium text-primary">
                ✨ Все практики дня выполнены · +{totalDone * 5} XP заработано
              </p>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Скролл-список практик */}
      <div className="relative z-10 overflow-y-auto" style={{ maxHeight: "calc(100dvh - 220px)" }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mx-auto w-full max-w-md px-5 pb-8 pt-4 flex flex-col gap-1 divide-y divide-border/30"
        >
          {CATEGORIES.map((cat, i) => (
            <div key={cat.id} className="pt-1">
              <CategorySection
                category={cat}
                done={done}
                onDone={handleDone}
                defaultOpen={i === 0}
              />
            </div>
          ))}
          <p className="pt-6 text-center text-[11px] leading-relaxed text-muted-foreground/60">
            Практики обновляются каждый день.
            <br />
            Выполненные сегодня засчитываются в streak.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
