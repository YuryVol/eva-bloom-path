import { supabase } from "@/integrations/supabase/client";

export type PracticeType = "stabilization" | "relaxation" | "harmonization";

export const PremiumGate = {
  async canStartJourney(
    userId: string,
    sphereId: string,
  ): Promise<{ allowed: boolean; reason: "daily_limit" | "ok"; nextAvailableAt?: Date }> {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("journey_limits")
      .select("last_journey_date")
      .eq("user_id", userId)
      .eq("sphere_id", sphereId)
      .maybeSingle();

    if (!data || (data as { last_journey_date: string }).last_journey_date < today) {
      return { allowed: true, reason: "ok" };
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return { allowed: false, reason: "daily_limit", nextAvailableAt: tomorrow };
  },

  async recordJourneyStart(userId: string, sphereId: string): Promise<void> {
    const today = new Date().toISOString().split("T")[0];
    await supabase
      .from("journey_limits")
      .upsert({ user_id: userId, sphere_id: sphereId, last_journey_date: today }, { onConflict: "user_id,sphere_id" });
  },

  canUsePractice(isPremium: boolean, practiceType: PracticeType): boolean {
    if (isPremium) return true;
    return practiceType === "stabilization";
  },

  getXPMultiplier(isPremium: boolean): number {
    return isPremium ? 1.5 : 1.0;
  },

  getPartnerDiscount(isPremium: boolean, baseDiscount: number): number {
    return isPremium ? baseDiscount * 1.5 : baseDiscount;
  },
};

// Coin cost for unlocking a practice for one journey (free users)
export const PRACTICE_UNLOCK_COST: Record<PracticeType, number> = {
  stabilization: 0,
  relaxation: 15,
  harmonization: 25,
};
