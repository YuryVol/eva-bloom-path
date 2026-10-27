import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAppConfig } from "@/lib/app-config-context";
import { trackCTAEvent } from "@/lib/cta-tracking";
import { premiumCTATexts } from "@/content/premium-cta-texts";

type CTAContext = keyof typeof premiumCTATexts;

interface PremiumCTAProps {
  format: "a" | "b" | "c";
  context: CTAContext;
  className?: string;
}

export function PremiumCTA({ format, context, className = "" }: PremiumCTAProps) {
  const { isPremiumApp } = useAppConfig();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPremiumApp) return;
    trackCTAEvent({ context, format, event_type: "shown" }).catch(() => {});
  }, [isPremiumApp, context, format]);

  if (!isPremiumApp) return null;

  const handleClick = () => {
    trackCTAEvent({ context, format, event_type: "clicked" }).catch(() => {});
    navigate({ to: "/premium/paywall" as never });
  };

  const texts = premiumCTATexts[context] as Record<string, unknown>;

  // ── Format A: тихая текстовая кнопка ──────────────────────────────────────
  if (format === "a") {
    const label = texts.a as string;
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`text-xs font-medium transition hover:opacity-80 ${className}`}
        style={{ color: "#B7950B" }}
      >
        {label}
      </button>
    );
  }

  // ── Format B: карточка с золотой рамкой ────────────────────────────────────
  if (format === "b") {
    const b = texts.b as { icon?: string; title?: string; text: string; btn?: string; tooltip?: string };
    return (
      <div
        className={`rounded-2xl border border-amber-400/40 bg-amber-50/60 px-4 py-4 ${className}`}
      >
        <div className="flex items-start gap-3">
          {(b.icon || b.title) && (
            <span className="mt-0.5 text-xl shrink-0">{b.icon ?? "✨"}</span>
          )}
          <div className="flex-1 min-w-0">
            {b.title && (
              <p className="font-display text-sm font-semibold text-foreground">{b.title}</p>
            )}
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{b.text}</p>
          </div>
        </div>
        {b.btn && (
          <button
            type="button"
            onClick={handleClick}
            className="mt-3 w-full rounded-xl border border-amber-400/60 bg-amber-400/10 py-2 text-xs font-medium text-amber-800 transition hover:bg-amber-400/20"
          >
            {b.btn}
          </button>
        )}
      </div>
    );
  }

  // ── Format C: контекстный блок с репликой Евы ─────────────────────────────
  const c = texts.c as { eva: string; btn: string };
  return (
    <div
      className={`rounded-2xl border-l-4 border-amber-400 bg-amber-50/60 px-5 py-4 ${className}`}
    >
      <p className="text-sm italic leading-relaxed text-foreground/80">«{c.eva}»</p>
      <button
        type="button"
        onClick={handleClick}
        className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-400/30 transition hover:from-amber-500 hover:to-amber-600"
      >
        {c.btn}
      </button>
    </div>
  );
}
