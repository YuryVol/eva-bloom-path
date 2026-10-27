import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AmbientBackground } from "@/components/eva/AmbientBackground";
import { useAddress } from "@/lib/use-address";
import { useAppConfig } from "@/lib/app-config-context";
import { HelpAccordion } from "@/components/help/HelpAccordion";
import { SphereGrid } from "@/components/help/SphereGrid";
import { WORLD_STATES_DEV, STREAK_MILESTONES } from "@/content/help-texts";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { checkPremiumStatus } from "@/lib/premium.functions";

export const Route = createFileRoute("/_authenticated/help")({
  component: HelpScreen,
  head: () => ({ meta: [{ title: "Как устроен мир ЕВА" }] }),
});

function HelpScreen() {
  const a = useAddress();
  const navigate = useNavigate();
  const { isPremiumApp } = useAppConfig();
  const fetchPremium = useServerFn(checkPremiumStatus);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    fetchPremium().then(({ isPremium: p }) => setIsPremium(p)).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goBack = () => window.history.back();

  // ── Section 1: Награды ────────────────────────────────────────────────────────
  const rewardsContent = (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {a.vy
          ? "За каждый шаг вы получаете монеты и очки опыта — вот на что они нужны."
          : "За каждый шаг ты получаешь монеты и очки опыта — вот на что они нужны."}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {/* Монеты */}
        <div className="flex flex-col gap-2 rounded-xl border border-amber-300/40 bg-amber-50/60 px-3 py-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🪙</span>
            <p className="font-display text-sm">Монеты</p>
          </div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Трать на:</p>
          <div className="flex flex-col gap-1.5">
            {[
              { icon: "🔓", label: "Секретные задания", desc: "Особые практики не для всех" },
              { icon: "🎨", label: "Новый персонаж", desc: "Расширь свой мир Евы" },
              { icon: "🕯️", label: "Разблокировать практику", desc: "Релаксация — 15 монет, Гармонизация — 25 монет" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-1.5">
                <span className="text-sm leading-none mt-0.5 shrink-0">{item.icon}</span>
                <div>
                  <p className="text-xs font-medium text-foreground/90">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* XP */}
        <div className="flex flex-col gap-2 rounded-xl border border-violet-300/40 bg-violet-50/60 px-3 py-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">⚡</span>
            <p className="font-display text-sm">Опыт (XP)</p>
          </div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Открывает:</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-1.5">
              <span className="text-sm leading-none mt-0.5 shrink-0">🗺️</span>
              <div>
                <p className="text-xs font-medium text-foreground/90">Новые уровни</p>
                <p className="text-[11px] text-muted-foreground leading-snug">Открываются территории и возможности</p>
              </div>
            </div>
            {isPremiumApp && (
              <div className="flex items-start gap-1.5">
                <span className="text-sm leading-none mt-0.5 shrink-0">✨</span>
                <div>
                  <p className="text-xs font-medium text-amber-700">EVA+ бонус: ×1.5 XP</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">За каждое путешествие</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="rounded-xl border border-border/40 bg-card/50 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
        {a.vy
          ? "Чем честнее и глубже вы работаете — тем больше получаете. Свои слова всегда ценятся выше подсказок."
          : "Чем честнее и глубже ты работаешь — тем больше получаешь. Свои слова всегда ценятся выше подсказок."}
      </p>
    </div>
  );

  // ── Section 2: Сферы ──────────────────────────────────────────────────────────
  const spheresContent = (
    <div className="flex flex-col gap-3">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {a.vy
          ? "Ева работает с восемью областями, которые вместе создают баланс. В начале вы оцениваете каждую и выбираете приоритетные — туда Ева направит внимание."
          : "Ева работает с восемью областями, которые вместе создают баланс. В начале ты оцениваешь каждую и выбираешь приоритетные — туда Ева направит внимание."}
      </p>
      <SphereGrid showPremiumNote={isPremiumApp} />
      <p className="text-xs text-muted-foreground">
        {a.vy
          ? "Вы можете вернуться и переоценить сферы в любой момент — жизнь меняется."
          : "Ты можешь вернуться и переоценить сферы в любой момент — жизнь меняется."}
      </p>
    </div>
  );

  // ── Section 3: Путешествие ────────────────────────────────────────────────────
  const journeyContent = (
    <div className="flex flex-col gap-3">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {a.vy
          ? "Каждый раз когда вы заходите в сферу — начинается путешествие. Это последовательность шагов которые помогают глубже встретиться с собой."
          : "Каждый раз когда ты заходишь в сферу — начинается путешествие. Это последовательность шагов которые помогают глубже встретиться с собой."}
      </p>
      <div className="rounded-xl border border-border/30 bg-card/50 px-3 py-2.5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-1">Шаги путешествия</p>
        <p className="text-xs text-foreground/80">Цель → Чувства → Сопротивление → Практика → EMDR → Переоценка → Итог</p>
      </div>
      <div className="flex flex-col gap-2">
        {[
          {
            icon: "🕯️",
            label: "Практика",
            desc: "После основной работы ты выбираешь одну из трёх практик для интеграции. Стабилизация — успокоить. Релаксация — отпустить. Гармонизация — переосмыслить.",
            premiumNote: isPremiumApp ? "✨ В EVA+ доступны все три типа практик без ограничений." : null,
          },
          {
            icon: "🔵",
            label: "EMDR",
            desc: "Краткая техника двусторонней стимуляции — 45 секунд. Помогает переработать напряжение. Безопасна для большинства людей. Если есть сомнения — можно пропустить.",
            premiumNote: null,
          },
          {
            icon: "📊",
            label: "Оценки",
            desc: "В начале и конце каждого путешествия ты оцениваешь сферу. Так виден реальный прогресс.",
            premiumNote: null,
          },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-2.5 rounded-xl border border-border/30 bg-card/50 px-3 py-2.5">
            <span className="text-base leading-none mt-0.5 shrink-0">{item.icon}</span>
            <div>
              <p className="text-sm font-medium text-foreground/90">{item.label}</p>
              <p className="text-[12px] text-muted-foreground leading-snug mt-0.5">{item.desc}</p>
              {item.premiumNote && (
                <p className="mt-1 text-[11px] text-amber-700">{item.premiumNote}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {a.vy
          ? "Путешествие занимает 10–20 минут. Можно остановиться в любой момент."
          : "Путешествие занимает 10–20 минут. Можно остановиться в любой момент."}
      </p>
    </div>
  );

  // ── Section 4: Мир Евы ────────────────────────────────────────────────────────
  const worldContent = (
    <div className="flex flex-col gap-3">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {a.vy
          ? "Мир Евы на главном экране — живой. Он отражает вашу активность и меняется вместе с вами."
          : "Мир Евы на главном экране — живой. Он отражает твою активность и меняется вместе с тобой."}
      </p>
      {isPremiumApp ? (
        <div className="flex flex-col gap-2">
          <div className="rounded-xl border border-amber-200/50 bg-amber-50/50 px-3 py-2.5">
            <p className="text-sm font-medium text-foreground/90">30 динамических состояний</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground leading-snug">
              Мир меняется каждый день активности — от «Первого ростка» до «Вечного сада».
              Появляются новые элементы, острова, существа.
            </p>
          </div>
          <div className="rounded-xl border border-border/30 bg-card/50 px-3 py-2.5">
            <p className="text-sm font-medium text-foreground/90">📖 История мира</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground leading-snug">В профиле доступна лента всех разблокированных состояний с датами.</p>
          </div>
          <div className="rounded-xl border border-border/30 bg-card/50 px-3 py-2.5">
            <p className="text-sm font-medium text-foreground/90">🌱 Прогресс на экране</p>
            <p className="mt-0.5 text-[12px] text-muted-foreground leading-snug">На главном экране видно: «До следующего состояния: X дней»</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {WORLD_STATES_DEV.map((s) => (
            <div key={s.label} className="flex items-start gap-2.5 rounded-xl border border-border/30 bg-card/50 px-3 py-2">
              <span className="text-base leading-none mt-0.5 shrink-0">{s.icon}</span>
              <div>
                <p className="text-sm font-medium text-foreground/90">{s.label}</p>
                <p className="text-[12px] text-muted-foreground leading-snug">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {a.vy
          ? "Возвращайтесь каждый день. Каждое путешествие и практика делают мир живее."
          : "Возвращайся каждый день. Каждое путешествие и практика делают мир живее."}
      </p>
    </div>
  );

  // ── Section 5: Стрик ─────────────────────────────────────────────────────────
  const streakContent = (
    <div className="flex flex-col gap-3">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {a.vy
          ? "Стрик показывает сколько дней подряд вы делали хотя бы одно действие в приложении — путешествие или практику."
          : "Стрик показывает сколько дней подряд ты делала хотя бы одно действие в приложении — путешествие или практику."}
      </p>
      <div className="flex flex-col gap-2">
        {STREAK_MILESTONES.map((m) => (
          <div key={m.days} className="flex items-start gap-2.5 rounded-xl border border-border/30 bg-card/50 px-3 py-2">
            <span className="text-base leading-none mt-0.5 shrink-0">{m.icon}</span>
            <div>
              <p className="text-sm font-medium text-foreground/90">{m.label}</p>
              <p className="text-[12px] text-muted-foreground leading-snug">{m.reward}</p>
            </div>
          </div>
        ))}
        <div className="rounded-xl border border-border/30 bg-card/50 px-3 py-2.5">
          <p className="text-sm font-medium text-foreground/90">Если пропустила день</p>
          <p className="text-[12px] text-muted-foreground leading-snug mt-0.5">
            Стрик обнуляется — но без наказания. Ева напомнит мягко: «Стрик можно начать заново в любой момент.»
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {a.vy
          ? "Стрик — не обязательство. Это просто зеркало вашей регулярности."
          : "Стрик — не обязательство. Это просто зеркало твоей регулярности."}
      </p>
    </div>
  );

  // ── Section 6: Дневник — только Premium версия (worker) ──────────────────────
  const diaryContent = (
    <div className="flex flex-col gap-3">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {a.vy
          ? "После каждого путешествия Ева делает запись в ваш личный дневник. Не отчёт — а живое наблюдение: что она заметила, что важно, что может остаться с вами."
          : "После каждого путешествия Ева делает запись в твой личный дневник. Не отчёт — а живое наблюдение: что она заметила, что важно, что может остаться с тобой."}
      </p>
      <div className="flex flex-col gap-2">
        {[
          { icon: "📖", label: "Где найти", desc: "Вкладка «Дневник» в нижней навигации" },
          { icon: "🌸", label: "Что внутри", desc: "Лента записей от Евы — каждая привязана к путешествию. Особые записи в ключевые моменты: первое путешествие, 7 дней, 30 дней, возвращение после паузы." },
          { icon: "🔒", label: "Личное", desc: "Дневник виден только тебе. Ева пишет только для тебя." },
          { icon: "🎴", label: "Шеринг", desc: "Любую запись можно сохранить как красивую карточку." },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-2.5 rounded-xl border border-border/30 bg-card/50 px-3 py-2.5">
            <span className="text-base leading-none mt-0.5 shrink-0">{item.icon}</span>
            <div>
              <p className="text-sm font-medium text-foreground/90">{item.label}</p>
              <p className="text-[12px] text-muted-foreground leading-snug mt-0.5">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Section 7: Premium CTA — только Dev версия (worker) ──────────────────────
  const premiumCtaContent = (
    <div className="flex flex-col gap-3">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {a.vy
          ? "Бесплатная версия даёт полный доступ к основному пути. EVA+ делает его глубже и живее."
          : "Бесплатная версия даёт полный доступ к основному пути. EVA+ делает его глубже и живее."}
      </p>
      <div className="flex flex-col gap-1.5">
        {[
          { icon: "♾️", label: "Неограниченные путешествия", desc: "Без лимита 1 в сутки на сферу" },
          { icon: "🕯️", label: "Все практики", desc: "Релаксация и Гармонизация без монет" },
          { icon: "📖", label: "Живой дневник Евы", desc: "Личные записи после каждого путешествия" },
          { icon: "🌸", label: "Мир Евы 30 состояний", desc: "Динамический мир, меняющийся каждый день" },
          { icon: "🧿", label: "Хранитель сферы", desc: "Твой персонаж для каждой из 8 сфер" },
          { icon: "⚡", label: "XP ×1.5", desc: "Бонус за каждое путешествие и практику" },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-2.5">
            <span className="text-sm leading-none mt-0.5 shrink-0">{item.icon}</span>
            <div>
              <p className="text-sm font-medium text-foreground/90">{item.label}</p>
              <p className="text-[11px] text-muted-foreground leading-snug">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      {isPremiumApp && (
        <button
          type="button"
          onClick={() => navigate({ to: "/premium/paywall" as never })}
          className="mt-1 w-full rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-400/30 transition hover:from-amber-500 hover:to-amber-600"
        >
          Оформить EVA+ ✨
        </button>
      )}
    </div>
  );

  // ── Build section list ─────────────────────────────────────────────────────────
  const allSections = [
    { id: "rewards",  icon: "🎁", title: "Твой путь приносит награды", content: rewardsContent },
    { id: "spheres",  icon: "🌐", title: "Восемь сфер жизни",         content: spheresContent },
    { id: "journey",  icon: "🧭", title: "Что такое путешествие",      content: journeyContent },
    { id: "world",    icon: "🌸", title: "Мир Евы",                    content: worldContent },
    { id: "streak",   icon: "🔥", title: "Стрик — дни подряд",         content: streakContent },
    ...(isPremiumApp
      ? [{ id: "diary",   icon: "📖", title: "Живой дневник Евы", content: diaryContent }]
      : [{ id: "premium", icon: "✨", title: "Что открывает EVA+",   content: premiumCtaContent }]),
  ];

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#F9F4EE]">
      <AmbientBackground theme="safe" />

      {/* Header */}
      <div
        className="relative z-10 flex items-center gap-3 border-b border-border/40 bg-[#F9F4EE]/80 px-4 py-3 backdrop-blur-md"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0.75rem)" }}
      >
        <button
          type="button"
          onClick={goBack}
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card/70 text-foreground transition hover:border-primary/50"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">Справка</p>
          <h1 className="font-display text-xl text-glow leading-tight">Как устроен мир ЕВА</h1>
        </div>
      </div>

      {/* Content */}
      <div
        className="relative z-10 flex-1 overflow-y-auto px-4 py-5"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1.5rem)" }}
      >
        <HelpAccordion sections={allSections} defaultOpen={0} />

        {/* Footer */}
        <div className="mt-6 flex flex-col items-center gap-3">
          {isPremiumApp && !isPremium && (
            <button
              type="button"
              onClick={() => navigate({ to: "/premium/paywall" as never })}
              className="text-sm font-medium text-amber-700/80 transition hover:text-amber-700"
            >
              Узнать о EVA+ →
            </button>
          )}
          <Link
            to="/disclaimer"
            className="text-xs text-muted-foreground/60 underline-offset-2 hover:text-muted-foreground hover:underline transition"
          >
            О ЕВЕ — важное
          </Link>
        </div>
      </div>
    </main>
  );
}
