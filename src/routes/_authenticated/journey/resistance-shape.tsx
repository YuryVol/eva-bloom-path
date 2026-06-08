import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useInterlude } from "@/lib/eva-interlude";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GlassCard } from "@/components/eva/GlassCard";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/journey/resistance-shape")({
  component: ResistanceShapeScreen,
});

const SHAPES = [
  { id: "stone", label: "Камень", hint: "плотный, тяжёлый", image: "stone.png" },
  { id: "knot", label: "Узел", hint: "стянутый, запутанный", image: "knot.png" },
  { id: "wall", label: "Стена", hint: "глухая, неподвижная", image: "wall.png" },
  { id: "fog", label: "Туман", hint: "размытый, обволакивающий", image: "fog.png" },
  { id: "ice", label: "Лёд", hint: "холодный, оцепеневший", image: "ice.png" },
  { id: "thorn", label: "Шипы", hint: "колючие, острые", image: "thorn.png" },
  { id: "void", label: "Пустота", hint: "ничего внутри", image: "void.png" },
  { id: "shadow", label: "Тень", hint: "ничего не видно", image: "shadow.png" },
];

const COLORS = [
  { id: "black", label: "Чёрный", swatch: "#0a0a0a" },
  { id: "grey", label: "Серый", swatch: "#5a5a5a" },
  { id: "red", label: "Красный", swatch: "#a83232" },
  { id: "blue", label: "Синий", swatch: "#1e3a5f" },
  { id: "brown", label: "Бурый", swatch: "#5a3a1a" },
  { id: "white", label: "Белый", swatch: "#e8e8e8" },
];

const SIZES = [
  { id: "small", label: "С кулак", scale: 0.45 },
  { id: "medium", label: "С грудь", scale: 0.7 },
  { id: "large", label: "Больше тела", scale: 1 },
];

function ResistanceShapeScreen() {
  const { state, journeyId, setStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const [shape, setShape] = useState(state.resistance_shape || "");
  const [color, setColor] = useState(state.resistance_color || "");
  const [size, setSize] = useState(state.resistance_size || "");
  const [saving, setSaving] = useState(false);

  const ready = shape && color && size;
  const selectedShape = SHAPES.find((s) => s.id === shape);
  const selectedColor = COLORS.find((c) => c.id === color);
  const selectedSize = SIZES.find((s) => s.id === size);
  const scale = selectedSize?.scale ?? 0.6;
  const glow = selectedColor?.swatch ?? "#c9a878";

  const handleNext = async () => {
    if (!journeyId || !ready) return;
    setSaving(true);
    const next = {
      ...state,
      resistance_shape: shape,
      resistance_color: color,
      resistance_size: size,
      xp: (state.xp || 0) + 5,
      coins: (state.coins || 0) + 2,
    };
    patch({
      resistance_shape: shape,
      resistance_color: color,
      resistance_size: size,
      xp: next.xp,
      coins: next.coins,
    });
    setStep("emdr");
    try {
      await save({
        data: { id: journeyId, state: next as never, current_step: "emdr" },
      });
      await useInterlude.getState().play("shape-to-emdr", 0);
      navigate({ to: "/journey/emdr-intro" as never });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FadeTransition k="resistance-shape">
      <div className="h-full min-h-0 overflow-y-auto pr-1 pb-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Форма
          </p>
          <h1 className="mt-3 font-display text-3xl text-glow md:text-4xl">
            Если бы у этого ощущения была форма — то какая?
          </h1>
          <p className="mt-3 mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
            Закрой глаза на секунду. Что внутри мешает? Дай этому образ — форму,
            цвет, размер. Когда видишь — становишься больше этого.
          </p>

          {/* Preview stage — frameless, centered radial glow */}
          <div className="relative mx-auto mt-6 flex h-60 w-full max-w-sm items-center justify-center">
            {/* Centered radial halo */}
            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-500"
              style={{
                background: selectedColor
                  ? `radial-gradient(circle at 50% 50%, ${glow}55 0%, ${glow}22 35%, transparent 70%)`
                  : "radial-gradient(circle at 50% 50%, oklch(0.85 0.1 75 / 0.45), transparent 65%)",
                filter: "blur(6px)",
              }}
            />

            {/* Sparkles above selected icon */}
            {selectedShape && (
              <div className="pointer-events-none absolute inset-x-0 top-1 flex justify-center">
                <div className="relative h-12 w-44">
                  {[
                    { left: "12%", delay: 0, size: 5 },
                    { left: "30%", delay: 0.5, size: 4 },
                    { left: "48%", delay: 1.0, size: 7 },
                    { left: "66%", delay: 0.2, size: 5 },
                    { left: "84%", delay: 0.8, size: 4 },
                  ].map((s, i) => (
                    <motion.span
                      key={i}
                      className="absolute top-1/2 rounded-full"
                      style={{
                        left: s.left,
                        width: s.size,
                        height: s.size,
                        background: "oklch(0.96 0.12 85)",
                        boxShadow:
                          "0 0 8px oklch(0.9 0.15 80 / 0.95), 0 0 16px oklch(0.85 0.13 75 / 0.6)",
                      }}
                      animate={{ opacity: [0, 1, 0], scale: [0.4, 1.3, 0.4], y: [4, -6, 4] }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        delay: s.delay,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Figure */}
            <div className="relative z-10 flex h-full w-full items-center justify-center">
              <AnimatePresence mode="wait">
                {selectedShape ? (
                  <motion.img
                    key={`${selectedShape.id}-${size}`}
                    src={`/assets/eva/shapes/${encodeURIComponent(selectedShape.image)}`}
                    alt={selectedShape.label}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: `${scale * 92}%` }}
                    className="block w-auto max-w-[80%] object-contain"
                  />
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full w-full items-center justify-center"
                  >
                    <span className="font-display text-7xl text-muted-foreground/70">?</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Shape */}
          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Форма
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {SHAPES.map((s) => (
                <GlassCard
                  key={s.id}
                  interactive
                  selected={shape === s.id}
                  onClick={() => setShape(s.id)}
                  className="p-3 text-center"
                >
                  <p className="font-display text-sm">{s.label}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{s.hint}</p>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Цвет
            </p>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-3 transition-all",
                    color === c.id
                      ? "border-primary/70 bg-card shadow-[0_6px_18px_oklch(0.74_0.13_70/0.3)]"
                      : "border-border bg-card/70 hover:border-primary/40",
                  )}
                >
                  <div
                    className="h-8 w-8 rounded-full border border-border/60"
                    style={{ backgroundColor: c.swatch }}
                  />
                  <span className="text-[11px] text-muted-foreground">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mt-6">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Размер
            </p>
            <div className="grid grid-cols-3 gap-3">
              {SIZES.map((s) => (
                <GlassCard
                  key={s.id}
                  interactive
                  selected={size === s.id}
                  onClick={() => setSize(s.id)}
                  className="p-3 text-center"
                >
                  <p className="font-display text-sm">{s.label}</p>
                </GlassCard>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-2">
            <GlowButton onClick={handleNext} disabled={!ready || saving}>
              {saving ? "сохраняю…" : "Я вижу это"}
            </GlowButton>
            <p className="text-xs text-muted-foreground">
              {ready ? "+5 XP · +2 монеты за смелость назвать" : "Выбери форму, цвет и размер"}
            </p>
          </div>
        </div>
      </div>
    </FadeTransition>
  );
}
