import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft } from "lucide-react";
import { getActiveJourney, updateJourney } from "@/lib/journey.functions";
import { useJourneyStore } from "@/lib/journey-store";
import { AmbientBackground } from "@/components/eva/AmbientBackground";
import { ProgressBar } from "@/components/eva/ProgressBar";
import { EvaInterludeHost } from "@/components/eva/EvaInterlude";
import { STEPS, type StepId } from "@/lib/journey-types";

export const Route = createFileRoute("/_authenticated/journey")({
  component: JourneyLayout,
});

function JourneyLayout() {
  const fetchJourney = useServerFn(getActiveJourney);
  const save = useServerFn(updateJourney);
  const { setJourney, currentStep, loaded, journeyId, state, setStep } = useJourneyStore();
  const navigate = useNavigate();

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
        import("sonner").then(({ toast }) =>
          toast.error(err instanceof Error ? err.message : "Не удалось загрузить путешествие")
        );
      });
  }, [loaded, fetchJourney, setJourney, navigate]);

  const idx = STEPS.indexOf(currentStep);
  const canGoBack = idx > 0;

  const handleBack = async () => {
    if (!canGoBack) return;
    const prev = STEPS[idx - 1];
    setStep(prev);
    if (journeyId) {
      void save({ data: { id: journeyId, state: state as never, current_step: prev } });
    }
    navigate({ to: `/journey/${prev}` as never });
  };

  return (
    <main
      className="relative flex flex-col overflow-hidden px-4 py-4 md:px-8 md:py-6"
      style={{ height: "100dvh" }}
    >
      <AmbientBackground theme="safe" />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden">
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
        </div>
        <div className="mt-4 flex-1 min-h-0 overflow-hidden md:mt-6">
          <Outlet />
        </div>
      </div>
      <EvaInterludeHost />
    </main>
  );
}

