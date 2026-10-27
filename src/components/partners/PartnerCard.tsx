import { motion } from "framer-motion";
import type { Partner } from "@/lib/partner-trigger";

interface PartnerCardProps {
  partner: Partner;
  onCTA: () => void;
  onDismiss: () => void;
}

export function PartnerCard({ partner, onCTA, onDismiss }: PartnerCardProps) {
  return (
    <div className="relative rounded-2xl border border-primary/20 bg-card/80 p-5 backdrop-blur-sm">
      {/* Dismiss */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Закрыть"
        className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/50 transition hover:text-muted-foreground"
      >
        ×
      </button>

      {/* Partner name badge */}
      <div className="mb-3 inline-flex items-center gap-2">
        <span className="rounded-md border border-border/60 bg-background/60 px-2.5 py-0.5 font-display text-sm text-foreground">
          {partner.name}
        </span>
        {partner.is_free && (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-600">
            Бесплатно
          </span>
        )}
        {!partner.is_free && (
          <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-600">
            Спец. предложение
          </span>
        )}
      </div>

      {/* Eva phrase */}
      <p className="mb-4 font-display text-sm italic leading-relaxed text-foreground/80">
        «{partner.eva_phrase}»
      </p>

      {/* CTA */}
      <button
        type="button"
        onClick={onCTA}
        className="w-full rounded-xl bg-primary/10 border border-primary/30 px-4 py-2.5 text-sm font-display text-primary transition hover:bg-primary/20"
      >
        {partner.cta_text}
      </button>
    </div>
  );
}
