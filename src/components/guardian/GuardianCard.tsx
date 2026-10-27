import { useNavigate } from "@tanstack/react-router";
import { GuardianSilhouette } from "./GuardianSilhouette";
import type { SilhouetteId } from "./GuardianSilhouette";
import type { Guardian } from "@/lib/guardian.functions";

interface GuardianCardProps {
  guardian: Guardian;
  sphereId?: string;
  compact?: boolean;
}

export function GuardianCard({ guardian, compact = false }: GuardianCardProps) {
  const navigate = useNavigate();

  if (compact) {
    return (
      <button
        type="button"
        onClick={() =>
          navigate({
            to: "/premium/guardian-creator" as never,
            search: { sphere: guardian.sphere_id } as never,
          })
        }
        className="flex items-center gap-2 rounded-2xl border border-border/30 bg-card/40 px-3 py-2 transition hover:border-primary/40"
      >
        <GuardianSilhouette
          id={guardian.silhouette_id as SilhouetteId}
          colorPrimary={guardian.color_primary}
          colorSecondary={guardian.color_secondary ?? undefined}
          size={36}
        />
        <div className="text-left">
          <p className="text-xs font-medium text-foreground leading-tight">{guardian.name}</p>
          <p className="text-[10px] text-muted-foreground">Хранитель</p>
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-3xl border border-border/30 bg-card/60 p-5 text-center">
      <div className="flex justify-center mb-3">
        <div className="rounded-2xl bg-gradient-to-b from-primary/5 to-primary/15 p-4">
          <GuardianSilhouette
            id={guardian.silhouette_id as SilhouetteId}
            colorPrimary={guardian.color_primary}
            colorSecondary={guardian.color_secondary ?? undefined}
            size={90}
          />
        </div>
      </div>
      <p className="font-display text-lg font-semibold">{guardian.name}</p>
      <p className="text-xs text-muted-foreground mt-0.5">Хранитель сферы</p>
      <button
        type="button"
        onClick={() =>
          navigate({
            to: "/premium/guardian-creator" as never,
            search: { sphere: guardian.sphere_id } as never,
          })
        }
        className="mt-3 rounded-xl bg-muted/30 px-4 py-1.5 text-xs text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
      >
        Изменить
      </button>
    </div>
  );
}

interface CreateGuardianPromptProps {
  sphereId: string;
  sphereLabel: string;
}

export function CreateGuardianPrompt({ sphereId, sphereLabel }: CreateGuardianPromptProps) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() =>
        navigate({
          to: "/premium/guardian-creator" as never,
          search: { sphere: sphereId } as never,
        })
      }
      className="flex items-center gap-3 rounded-2xl border border-dashed border-amber-300/50 bg-amber-50/30 px-4 py-3 text-left transition hover:bg-amber-50/60"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100/60 text-amber-600">
        ✨
      </div>
      <div>
        <p className="text-xs font-medium text-amber-700">Создать хранителя «{sphereLabel}»</p>
        <p className="text-[10px] text-amber-600/70">Твой образ внутренней силы</p>
      </div>
    </button>
  );
}
