import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { GuardianSilhouette, SILHOUETTES, PALETTE, SPHERE_SILHOUETTE_HINT } from "@/components/guardian/GuardianSilhouette";
import type { SilhouetteId } from "@/components/guardian/GuardianSilhouette";
import { saveGuardian } from "@/lib/guardian.functions";
import { SPHERES } from "@/lib/journey-types";

const searchSchema = z.object({
  sphere: z.string().optional(),
  from: z.string().optional(),
});

export const Route = createFileRoute("/premium/guardian-creator")({
  validateSearch: searchSchema,
  component: GuardianCreatorScreen,
});

function GuardianCreatorScreen() {
  const navigate = useNavigate();
  const { sphere: sphereId = "growth", from } = useSearch({ from: Route.id });
  const doSave = useServerFn(saveGuardian);

  const sphereLabel = SPHERES.find((s) => s.id === sphereId)?.label ?? sphereId;
  const defaultSilhouette = SPHERE_SILHOUETTE_HINT[sphereId] ?? "tree";

  const [name, setName] = useState("");
  const [silhouette, setSilhouette] = useState<SilhouetteId>(defaultSilhouette);
  const [colorPrimary, setColorPrimary] = useState(PALETTE[0]);
  const [colorSecondary, setColorSecondary] = useState(PALETTE[6]);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<"shape" | "color" | "name">("shape");

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await doSave({
      data: {
        sphere_id: sphereId,
        name: name.trim(),
        silhouette_id: silhouette,
        color_primary: colorPrimary,
        color_secondary: colorSecondary,
      },
    }).catch(() => {});
    setSaving(false);
    if (from) {
      navigate({ to: from as never });
    } else {
      navigate({ to: "/profile" as never });
    }
  };

  return (
    <FadeTransition k="guardian-creator">
      <div className="flex h-full flex-col overflow-y-auto pb-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Хранитель сферы</p>
          <h1 className="mt-1 font-display text-3xl text-glow">«{sphereLabel}»</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Создай образ внутренней силы, которая охраняет эту сферу твоей жизни
          </p>
        </div>

        {/* Preview */}
        <div className="flex justify-center mb-6">
          <motion.div
            key={silhouette + colorPrimary}
            initial={{ scale: 0.9, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="rounded-3xl bg-gradient-to-b from-primary/5 to-primary/15 border border-primary/20 p-5">
              <GuardianSilhouette
                id={silhouette}
                colorPrimary={colorPrimary}
                colorSecondary={colorSecondary}
                size={130}
              />
            </div>
            {name && (
              <p className="font-display text-base font-medium text-foreground">{name}</p>
            )}
          </motion.div>
        </div>

        {/* Step tabs */}
        <div className="flex gap-1 rounded-2xl bg-muted/30 p-1 mb-5">
          {(["shape", "color", "name"] as const).map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setStep(s)}
              className={`flex-1 rounded-xl py-2 text-xs font-medium transition ${
                step === s ? "bg-background shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              {i + 1}. {s === "shape" ? "Форма" : s === "color" ? "Цвет" : "Имя"}
            </button>
          ))}
        </div>

        {/* Step: Shape */}
        {step === "shape" && (
          <div>
            <p className="mb-3 text-sm font-medium">Выбери форму хранителя:</p>
            <div className="grid grid-cols-3 gap-3">
              {SILHOUETTES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSilhouette(s.id as SilhouetteId)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 transition ${
                    silhouette === s.id
                      ? "border-primary/60 bg-primary/10 shadow"
                      : "border-border/30 bg-card/40 hover:border-border"
                  }`}
                >
                  <GuardianSilhouette
                    id={s.id as SilhouetteId}
                    colorPrimary={silhouette === s.id ? colorPrimary : "#A8A8A8"}
                    size={60}
                  />
                  <span className="text-[11px] text-muted-foreground">{s.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setStep("color")}
                className="rounded-2xl bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/20"
              >
                Далее →
              </button>
            </div>
          </div>
        )}

        {/* Step: Color */}
        {step === "color" && (
          <div>
            <p className="mb-3 text-sm font-medium">Основной цвет:</p>
            <div className="flex flex-wrap gap-3 mb-5">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColorPrimary(c)}
                  className={`size-9 rounded-full border-2 transition ${
                    colorPrimary === c ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <p className="mb-3 text-sm font-medium">Акцентный цвет:</p>
            <div className="flex flex-wrap gap-3">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColorSecondary(c)}
                  className={`size-9 rounded-full border-2 transition ${
                    colorSecondary === c ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="mt-5 flex justify-between">
              <button
                type="button"
                onClick={() => setStep("shape")}
                className="rounded-2xl bg-muted/40 px-5 py-2.5 text-sm text-muted-foreground transition hover:text-foreground"
              >
                ← Назад
              </button>
              <button
                type="button"
                onClick={() => setStep("name")}
                className="rounded-2xl bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/20"
              >
                Далее →
              </button>
            </div>
          </div>
        )}

        {/* Step: Name */}
        {step === "name" && (
          <div>
            <p className="mb-3 text-sm font-medium">Дай хранителю имя:</p>
            <input
              type="text"
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Ясная, Тихий, Страж..."
              className="w-full rounded-2xl border border-border/40 bg-background/60 px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Имя — это то, к чему ты будешь обращаться в трудные моменты
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <GlowButton onClick={handleSave} disabled={!name.trim() || saving}>
                {saving ? "Сохраняю…" : "Создать хранителя"}
              </GlowButton>
              <button
                type="button"
                onClick={() => setStep("color")}
                className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition"
              >
                ← Назад
              </button>
            </div>
          </div>
        )}
      </div>
    </FadeTransition>
  );
}
