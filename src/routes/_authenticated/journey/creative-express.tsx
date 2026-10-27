import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { GlowButton } from "@/components/eva/GlowButton";
import { JourneyScene } from "@/components/eva/JourneyScene";
import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { useAddress } from "@/lib/use-address";

export const Route = createFileRoute("/_authenticated/journey/creative-express")({
  component: CreativeExpressScreen,
});

const HERO_SRC = "/assets/eva/eva-creative.png";
const TIMER_SEC = 180; // 3 min

const PALETTE = [
  { color: "#D4A843", label: "Золото" },
  { color: "#c84b4b", label: "Тёплый" },
  { color: "#4a6fa5", label: "Синий" },
  { color: "#5a9960", label: "Зелёный" },
  { color: "#2a2038", label: "Тёмный" },
];

const BRUSH_SIZES = [
  { size: 1.5, label: "Тонкая" },
  { size: 4, label: "Средняя" },
  { size: 9, label: "Толстая" },
];

function CreativeExpressScreen() {
  const a = useAddress();
  const { state, journeyId, pushStep, patch } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);

  const [mode, setMode] = useState<"draw" | "write">("draw");
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SEC);
  const [timerStarted, setTimerStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeColor, setActiveColor] = useState(PALETTE[0].color);
  const [activeBrush, setActiveBrush] = useState(BRUSH_SIZES[1].size);

  // Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const startTimer = () => {
    if (timerStarted) return;
    setTimerStarted(true);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const onPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    startTimer();
    drawing.current = true;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const onPointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = activeBrush;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const onPointerUp = () => { drawing.current = false; };

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleNext = async () => {
    if (!journeyId) return;
    setSaving(true);
    const next = { ...state, xp: (state.xp || 0) + 8, coins: (state.coins || 0) + 3 };
    patch({ xp: next.xp, coins: next.coins });
    pushStep("practice-select");
    try {
      await save({ data: { id: journeyId, state: next as never, current_step: "practice-select" } });
      navigate({ to: "/journey/practice-select" as never });
    } finally {
      setSaving(false);
    }
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <FadeTransition k="creative-express">
      <JourneyScene current={{ src: HERO_SRC, alt: "Ева и творчество" }}>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Творческий путь</p>
          <h1 className="mt-2 font-display text-3xl text-glow md:text-5xl">Нарисовать и отпустить</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {a.vyrazite} то, что сейчас внутри — через образ или слова. Никаких правил.
          </p>
        </div>

        {/* Mode switcher */}
        <div className="mt-5 flex gap-2">
          {(["draw", "write"] as const).map((m) => (
            <button key={m} type="button"
              onClick={() => setMode(m)}
              className={["rounded-full border px-4 py-1.5 text-sm transition-all",
                mode === m ? "border-primary/60 bg-primary/10 text-foreground" : "border-border/50 text-muted-foreground hover:border-primary/30"
              ].join(" ")}>
              {m === "draw" ? "🎨 Нарисовать" : "✍️ Написать"}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <span className="font-mono">{mins}:{String(secs).padStart(2, "0")}</span>
          </div>
        </div>

        {mode === "draw" ? (
          <div className="mt-3">
            {/* Color + brush toolbar */}
            <div className="mb-2 flex items-center gap-3">
              <div className="flex gap-2">
                {PALETTE.map((p) => (
                  <button
                    key={p.color}
                    type="button"
                    title={p.label}
                    onClick={() => setActiveColor(p.color)}
                    className="rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: p.color,
                      width: 22,
                      height: 22,
                      borderColor: activeColor === p.color ? "white" : "transparent",
                      boxShadow: activeColor === p.color ? `0 0 6px ${p.color}` : undefined,
                    }}
                  />
                ))}
              </div>
              <div className="ml-2 flex items-center gap-2">
                {BRUSH_SIZES.map((b) => (
                  <button
                    key={b.size}
                    type="button"
                    title={b.label}
                    onClick={() => setActiveBrush(b.size)}
                    className="flex items-center justify-center rounded-full border border-border/50 transition-all hover:border-primary/40"
                    style={{
                      width: 24, height: 24,
                      background: activeBrush === b.size ? "oklch(0.74 0.13 70 / 0.2)" : undefined,
                    }}
                  >
                    <div
                      className="rounded-full"
                      style={{ width: b.size + 2, height: b.size + 2, backgroundColor: activeColor }}
                    />
                  </button>
                ))}
              </div>
              <button type="button" onClick={clearCanvas}
                className="ml-auto text-xs text-muted-foreground/60 hover:text-muted-foreground">
                Очистить
              </button>
            </div>
            <canvas
              ref={canvasRef}
              width={600}
              height={300}
              className="w-full touch-none rounded-2xl border border-border/40 bg-[#faf6f0]/80 dark:bg-card/50 cursor-crosshair"
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseUp={onPointerUp}
              onMouseLeave={onPointerUp}
              onTouchStart={onPointerDown}
              onTouchMove={onPointerMove}
              onTouchEnd={onPointerUp}
            />
          </div>
        ) : (
          <div className="mt-3">
            <textarea
              rows={6}
              placeholder="Пиши без остановки — о том, что чувствуешь в этой сфере..."
              className="w-full resize-none rounded-2xl border border-border/50 bg-card/40 px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground/40 focus:border-primary/60 focus:outline-none"
              onFocus={startTimer}
            />
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3">
          {!done ? (
            <GlowButton onClick={() => { setDone(true); if (timerRef.current) clearInterval(timerRef.current); }}>
              Я выразила это
            </GlowButton>
          ) : (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <p className="mb-3 text-sm italic text-foreground/80">
                Хорошо. Ты дала этому выход. Теперь — выбери практику для закрепления.
              </p>
              <GlowButton onClick={handleNext} disabled={saving}>
                {saving ? "сохраняю…" : "Выбрать практику"}
              </GlowButton>
            </motion.div>
          )}
        </div>
      </JourneyScene>
    </FadeTransition>
  );
}
