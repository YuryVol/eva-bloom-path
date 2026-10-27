import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { PartnerCard } from "./PartnerCard";
import { evaPartnerTexts } from "@/content/eva-partner-texts";
import { buildPartnerUrl } from "@/lib/partner-url";
import { trackPartnerEvent } from "@/lib/partner-analytics";
import type { Partner } from "@/lib/partner-trigger";
import type { SphereId } from "@/lib/journey-types";

interface PartnerGiftBlockProps {
  partners: Partner[];
  sphereId: SphereId;
  journeyId: string;
  coinsBalance: number;
  onSkip: () => void;
}

export function PartnerGiftBlock({
  partners,
  sphereId,
  journeyId,
  coinsBalance,
  onSkip,
}: PartnerGiftBlockProps) {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>("");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const trackedShown = useRef(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  // Track "shown" once
  useEffect(() => {
    if (!userId || trackedShown.current || partners.length === 0) return;
    trackedShown.current = true;
    partners.forEach((p) =>
      trackPartnerEvent({
        user_id: userId,
        partner_slug: p.slug,
        sphere_id: sphereId,
        event_type: "shown",
        journey_id: journeyId,
        coins_balance: coinsBalance,
      }),
    );
  }, [userId, partners, sphereId, journeyId, coinsBalance]);

  const handleCTA = (partner: Partner) => {
    if (!userId) return;
    trackPartnerEvent({
      user_id: userId,
      partner_slug: partner.slug,
      sphere_id: sphereId,
      event_type: "clicked",
      journey_id: journeyId,
      coins_balance: coinsBalance,
    });

    const url = buildPartnerUrl(partner, { sphere_id: sphereId, user_id: userId });
    if (url.startsWith("/")) {
      navigate({ to: url as never });
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleDismiss = (partner: Partner) => {
    if (!userId) return;
    trackPartnerEvent({
      user_id: userId,
      partner_slug: partner.slug,
      sphere_id: sphereId,
      event_type: "dismissed",
      journey_id: journeyId,
      coins_balance: coinsBalance,
    });
    setDismissed((prev) => new Set([...prev, partner.slug]));
  };

  const visible = partners.filter((p) => !dismissed.has(p.slug));

  if (partners.length === 0) return null;

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="mb-4 text-center md:text-left">
        <p className="font-display text-lg text-foreground">{evaPartnerTexts.giftTitle}</p>
        <p className="mt-1 text-sm text-muted-foreground">{evaPartnerTexts.giftSubtitle}</p>
      </div>

      {/* Cards */}
      <AnimatePresence initial={false}>
        {visible.map((partner, i) => (
          <motion.div
            key={partner.slug}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
            transition={{ duration: 0.35, delay: i * 0.2 }}
            className="mb-3"
          >
            <PartnerCard
              partner={partner}
              onCTA={() => handleCTA(partner)}
              onDismiss={() => handleDismiss(partner)}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Skip & Disclaimer */}
      <div className="mt-4 flex flex-col items-center gap-2 text-center md:items-start md:text-left">
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {evaPartnerTexts.skipButton}
        </button>
        <p className="text-[10px] text-muted-foreground/60">{evaPartnerTexts.disclaimer}</p>
      </div>
    </div>
  );
}
