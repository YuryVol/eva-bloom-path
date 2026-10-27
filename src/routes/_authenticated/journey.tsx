import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, X } from "lucide-react";
import { getActiveJourney, updateJourney } from "@/lib/journey.functions";
import { getUserStats } from "@/lib/journey.functions";
import { trackJourneyStep } from "@/lib/analytics";
import { useJourneyStore } from "@/lib/journey-store";
import { AmbientBackground } from "@/components/eva/AmbientBackground";
import { ProgressBar } from "@/components/eva/ProgressBar";
import { EvaInterludeHost } from "@/components/eva/EvaInterlude";
import { type StepId } from "@/lib/journey-types";

function toGenitive(name: string): string {
  const n = name.trim();
  const l = n.toLowerCase();
  if (l.endsWith("ия")) return n.slice(0, -1) + "и";
  if (l.endsWith("ья")) return n.slice(0, -1) + "и";
  if (l.endsWith("я"))  return n.slice(0, -1) + "и";
  if (/[гкхжшчщ]а$/u.test(l)) return n.slice(0, -1) + "и";
  if (l.endsWith("а"))  return n.slice(0, -1) + "ы";
  if (l.endsWith("й"))  return n.slice(0, -1) + "я";
  if (l.endsWith("ь"))  return n.slice(0, -1) + "я";
  if (/[бвгджзклмнпрстфхцчшщ]$/u.test(l)) return n + "а";
  return n;
}

export const Route = createFileRoute("/_authenticated/journey")({
  component: JourneyLayout,
});

function JourneyLayout() {
  const fetchJourney = useServerFn(getActiveJourney);
  const save = useServerFn(updateJourney);
  const fetchStats = useServerFn(getUserStats);
  const { setJourney, currentStep, steps, loaded, journeyId, state, popStep } = useJourneyStore();
  const navigate = useNavigate();
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    fetchStats().then((s) => setDisplayName(s.display_name ?? null)).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loaded) return;
    fetchJourney()
      .then((j) => {
        setJourney(j.id, j.state, j.current_step as StepId);
        if (j.current_step && j.current_step !== "spheres") {
          navigate({ to: `/journey/${j.current_step}` as never });
        }
      })
      .catch((err) => {
        console.error("[journey layout] fetchJourney failed:", err);
        // Non-blocking — user can still interact with journey screens
        // which will retry on next meaningful action
      });
  }, [loaded, fetchJourney, setJourney, navigate]);

  const canGoBack = steps.length > 1;

  const handleBack = async () => {
    if (!canGoBack) return;
    const prev = steps[steps.length - 2];
    if (journeyId) trackJourneyStep(journeyId, currentStep, "abandoned");
    popStep();
    if (journeyId) {
      void save({ data: { id: journeyId, state: state as never, current_step: prev } });
    }
    navigate({ to: `/journey/${prev}` as never });
  };

  const handleExitConfirm = () => {
    setShowExitConfirm(false);
    navigate({ to: "/home" as never });
  };

  return (
    <main
      className="relative flex flex-col overflow-hidden px-4 py-4 md:px-6 md:py-6"
      style={{ height: "100dvh" }}
    >
      <AmbientBackground theme="safe" />
      <div className="flex w-full flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={!canGoBack}
            aria-label="Назад"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card/70 text-foreground transition-all duration-200 hover:border-primary/50 hover:bg-card disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <ProgressBar currentStep={currentStep} />
          </div>
          {/* Кнопки ?, Возможности, Профиль */}
          <div className="flex items-center gap-2">
            {/* Справка */}
            <Link
              to="/help"
              title="Узнать механику мира Евы"
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card/60 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
              </svg>
            </Link>
            {/* Возможности */}
            <Link
              to="/opportunities"
              title="Практики, психологи, курсы, партнёрские предложения"
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border/50 bg-card/60 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                <line x1="12" y1="12" x2="12" y2="12.01"/>
                <path d="M2 12h20"/>
              </svg>
            </Link>
            {/* Профиль */}
            <Link
              to="/profile"
              aria-label="Мой прогресс"
              title="Мой прогресс"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card/70 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </Link>
          </div>
          {/* Выход */}
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            aria-label="Вернуться в Мой мир"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-card/70 text-muted-foreground transition hover:border-rose-300/60 hover:text-rose-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 flex-1 min-h-0 overflow-hidden md:mt-6">
          <Outlet />
        </div>
      </div>
      <EvaInterludeHost />

      {/* Диалог подтверждения выхода */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-6">
          <div className="w-full max-w-xs rounded-3xl border border-border/50 bg-[#F9F4EE] p-6 shadow-2xl">
            <p className="font-display text-lg text-foreground leading-snug">
              {"Вернуться в Мой мир?"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              <span className="inline-flex items-center gap-1.5 text-emerald-600"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="inline"><circle cx="7" cy="7" r="7" fill="currentColor" opacity="0.15"/><path d="M4 7l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> Прогресс сохранён.</span> Путешествие можно продолжить в любой момент.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleExitConfirm}
                className="w-full rounded-2xl bg-foreground/10 py-2.5 text-sm font-medium text-foreground transition hover:bg-foreground/15"
              >
                {"Вернуться в Мой мир"}
              </button>
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="w-full rounded-2xl py-2.5 text-sm text-muted-foreground transition hover:text-foreground"
              >
                Продолжить путешествие
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

