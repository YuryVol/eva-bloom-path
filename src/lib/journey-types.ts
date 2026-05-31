export const SPHERES = [
  { id: "family", label: "Семья" },
  { id: "relationships", label: "Отношения" },
  { id: "career", label: "Призвание" },
  { id: "growth", label: "Развитие" },
  { id: "finance", label: "Финансы" },
  { id: "rest", label: "Отдых" },
  { id: "people", label: "Окружение" },
  { id: "health", label: "Здоровье" },
] as const;

export type SphereId = (typeof SPHERES)[number]["id"];

export const STEPS = [
  "spheres",
  "assess",
  "path",
  "goal",
  "fears",
  "feeling",
  "current-state",
  "resistance",
  "resistance-shape",
  "emdr",
  "reassess",
  "success",
  "summary",
] as const;

export type StepId = (typeof STEPS)[number];

export interface JourneyState {
  selected_spheres: SphereId[];
  sphere_scores: Record<string, number>;
  priority_sphere: SphereId | "";
  desired_goal: string;
  selected_fears: string[];
  desired_state: string;
  current_state_score: number;
  resistance_score_before: number;
  resistance_shape: string;
  resistance_color: string;
  resistance_size: string;
  resistance_score_after: number;
  xp: number;
  coins: number;
  emdr_cycles: number;
}

export const initialJourneyState: JourneyState = {
  selected_spheres: [],
  sphere_scores: {},
  priority_sphere: "",
  desired_goal: "",
  selected_fears: [],
  desired_state: "",
  current_state_score: 5,
  resistance_score_before: 5,
  resistance_shape: "",
  resistance_color: "",
  resistance_size: "",
  resistance_score_after: 5,
  xp: 0,
  coins: 0,
  emdr_cycles: 0,
};
