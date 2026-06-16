import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getUserStats } from "@/lib/journey.functions";
import { PremiumGate, type PracticeType } from "@/lib/premium-gate";

export function usePremiumGate() {
  const fetchStats = useServerFn(getUserStats);
  const [isPremium, setIsPremium] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchStats()
      .then(({ profile }) => {
        setIsPremium((profile as { is_premium?: boolean }).is_premium ?? false);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    isPremium,
    loaded,
    canUsePractice: (type: PracticeType) => PremiumGate.canUsePractice(isPremium, type),
    xpMultiplier: PremiumGate.getXPMultiplier(isPremium),
    getPartnerDiscount: (base: number) => PremiumGate.getPartnerDiscount(isPremium, base),
  };
}
