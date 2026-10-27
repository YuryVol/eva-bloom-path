import type { SphereId } from "@/lib/journey-types";

export type PracticeType = "stabilization" | "relaxation" | "harmonization";

export interface Practice {
  id: string;
  sphere_id: SphereId;
  type: PracticeType;
  name: string;
  description: string;
  mechanics: string;
  duration_min: number;
  xp_reward: number;
  coins_reward: number;
  is_premium: boolean;
  component_key: string;
}

export interface PracticeCompletion {
  id: string;
  user_id: string;
  practice_id: string;
  journey_id: string | null;
  context: "journey" | "daily";
  completed_at: string;
  skipped: boolean;
  notes: string | null;
}

/** Props every practice component must accept */
export interface PracticeProps {
  onComplete: () => void;
  onSkip: () => void;
  sphereId: SphereId;
}

export type PracticeComponentLoader = () => Promise<{
  default: React.ComponentType<PracticeProps>;
}>;

export type PracticeComponentMap = Record<string, PracticeComponentLoader>;
