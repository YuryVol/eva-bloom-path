import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Suspense, lazy, useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AmbientBackground } from "@/components/eva/AmbientBackground";
import { GlassCard } from "@/components/eva/GlassCard";
import { GlowButton } from "@/components/eva/GlowButton";
import { EmdrAnimation } from "@/components/eva/EmdrAnimation";
import { recordPractice } from "@/lib/journey.functions";
import { INTERACTIVE_MAP } from "@/lib/practices-local";
import { practiceComponentMap } from "@/content/practice-components-map";
import type { SphereId } from "@/lib/journey-types";

export const Route = createFileRoute("/_authenticated/practices_/run/$componentKey")({
  component: PracticeRunScreen,
});

function PracticeRunScreen() {
  const { componentKey } = Route.useParams();
  const navigate = useNavigate();
  const doRecord = useServerFn(recordPractice);

  const meta = INTERACTIVE_MAP[componentKey];

  const handleComplete = async () => {
    try {
      const res = await doRecord({ data: { practiceId: componentKey } });
      if (res.xp) toast.success(`+${res.xp} XP · +${res.coins} монет`);
    } catch { /* best-effort */ }
    navigate({ to: "/practices" as never });
  };

  const handleSkip = () => {
    navigate({ to: "/practices" as never });
  };

  // ── EMDR special case ──────────────────────────────────────────────────────
  if (componentKey === "emdr") {
    return <EmdrRunScreen onComplete={handleComplete} onSkip={handleSkip} />;
  }

  // ── Unknown key ──────────────────────────────────────────────────────────
  if (!meta || !practiceComponentMap[componentKey]) {
    return (
      <main className="relative min-h-[100dvh] bg-[#F9F4EE] flex items-center justify-center">
        <AmbientBackground theme="safe" />
        <div className="relative z-10 text-center px-6">
          <p className="text-muted-foreground">Практика не найдена.</p>
          <Link to="/practices" className="mt-4 inline-block text-sm text-primary underline">← Практики</Link>
        </div>
      </main>
    );
  }

  const LazyComponent = lazy(practiceComponentMap[componentKey]);

  return (
    <main className="relative bg-[#F9F4EE] h-[100dvh] overflow-hidden flex flex-col">
      <AmbientBackground theme="safe" />

      {/* Header */}
      <div
        className="relative z-10 flex-none px-4 py-3 flex items-center gap-3 border-b border-border/30"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0.75rem)" }}
      >
        <Link
          to="/practices"
          className="flex size-8 items-center justify-center rounded-full border border-border/50 text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">
            {meta.emoji} {meta.title}
          </p>
          <p className="text-[10px] text-muted-foreground/50">{meta.duration}</p>
        </div>
      </div>

      {/* Practice content */}
      <div className="relative z-10 flex-1 min-h-0 overflow-hidden px-5 py-4">
        <Suspense fallback={
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground animate-pulse">Загружаю практику…</p>
          </div>
        }>
          <LazyComponent
            onComplete={handleComplete}
            onSkip={handleSkip}
            sphereId={meta.sphereId as SphereId}
          />
        </Suspense>
      </div>
    </main>
  );
}

// ── EMDR standalone screen ────────────────────────────────────────────────────

function EmdrRunScreen({ onComplete, onSkip }: { onComplete: () => void; onSkip: () => void }) {
  const [done, setDone] = useState(false);

  return (
    <main className="relative bg-[#F9F4EE] h-[100dvh] overflow-hidden flex flex-col">
      <AmbientBackground theme="safe" />

      <div
        className="relative z-10 flex-none px-4 py-3 flex items-center gap-3 border-b border-border/30"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0.75rem)" }}
      >
        <Link
          to="/practices"
          className="flex size-8 items-center justify-center rounded-full border border-border/50 text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <p className="text-xs text-muted-foreground">🦋 EMDR-сессия</p>
          <p className="text-[10px] text-muted-foreground/50">10 мин · 3 цикла</p>
        </div>
      </div>

      <div className="relative z-10 flex flex-col flex-1 min-h-0 px-5 py-6 gap-6">
        <div className="text-center">
          <h1 className="font-display text-3xl text-glow">Мягко растворим это</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-md mx-auto">
            Следи глазами за светом, не двигая головой. Позволь телу самостоятельно справиться с напряжением.
          </p>
        </div>

        <GlassCard className="flex-1 flex items-center justify-center p-6 w-full">
          <EmdrAnimation cycles={3} onComplete={() => setDone(true)} />
        </GlassCard>

        {done ? (
          <div className="flex flex-col items-center gap-3 pb-2">
            <p className="text-sm italic text-foreground/80 text-center">Сделай глубокий вдох. Замечаешь, что изменилось внутри?</p>
            <GlowButton onClick={onComplete}>Завершить</GlowButton>
          </div>
        ) : (
          <div className="flex justify-center pb-2">
            <button
              type="button"
              onClick={onSkip}
              className="text-xs text-muted-foreground/50 underline-offset-2 hover:underline hover:text-muted-foreground transition"
            >
              Пропустить
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
