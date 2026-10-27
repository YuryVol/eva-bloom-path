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

// ── Journey Variants ──────────────────────────────────────────────────────────

export type JourneyVariant =
  | "deep"
  | "somatic"
  | "creative"
  | "quick"
  | "narrative"
  | "meditative"
  | "dialogue"
  | "gratitude"
  | "polarity"
  | "fear-lens";

export interface VariantMeta {
  id: JourneyVariant;
  label: string;
  tagline: string;
  icon: string;
}

export const VARIANT_META: Record<JourneyVariant, VariantMeta> = {
  deep:       { id: "deep",       label: "Глубокая работа", tagline: "Идти в самую суть",      icon: "🌊" },
  somatic:    { id: "somatic",    label: "Телесный",        tagline: "Тело знает ответ",        icon: "🫁" },
  creative:   { id: "creative",   label: "Творческий",      tagline: "Нарисовать и отпустить",  icon: "🎨" },
  quick:      { id: "quick",      label: "Быстрый",         tagline: "Одно действие сейчас",    icon: "⚡" },
  narrative:  { id: "narrative",  label: "Нарративный",     tagline: "Написать и увидеть",      icon: "✍️" },
  meditative: { id: "meditative", label: "Медитативный",    tagline: "Остановиться и услышать", icon: "🌿" },
  dialogue:   { id: "dialogue",   label: "Диалог с собой",  tagline: "Письмо мудрой себе",      icon: "💌" },
  gratitude:  { id: "gratitude",  label: "Ресурсный",       tagline: "Что уже работает",        icon: "🌸" },
  polarity:   { id: "polarity",   label: "Полярность",      tagline: "Лучшее и худшее",         icon: "⚖️" },
  "fear-lens":{ id: "fear-lens",  label: "Под лупой",       tagline: "Страх изнутри",           icon: "🔍" },
};

// ── Step IDs ──────────────────────────────────────────────────────────────────

export const BASE_STEPS = [
  "spheres",
  "assess",
  "path",
  "goal",
  "fears",
  "feeling",
  "resistance",
  "resistance-shape",
  "emdr",
  "practice-select",
  "practice-run",
  "reassess",
  "success",
  "summary",
] as const;

// Keep legacy export for any external consumers
export const STEPS = BASE_STEPS;

export type BaseStepId = (typeof BASE_STEPS)[number];
export type SphereTaskStepId =
  | "sphere-task-relationships"
  | "sphere-task-career"
  | "sphere-task-health";
export type VariantStepId =
  | "somatic-work"
  | "creative-express"
  | "narrative-write"
  | "breathing-work"
  | "self-letter"
  | "gratitude-focus"
  | "polarity-map"
  | "fear-reframe";
export type EntryStepId =
  | "rel-entry"
  | "fam-entry"
  | "career-entry"
  | "finance-entry"
  | "growth-entry"
  | "health-entry"
  | "rest-entry"
  | "people-entry";
export type StepId = BaseStepId | SphereTaskStepId | VariantStepId | EntryStepId;

// ── Variant step sequences (from "goal" onwards) ──────────────────────────────

export const VARIANT_STEPS: Record<JourneyVariant, StepId[]> = {
  deep:       ["goal","fears","feeling","resistance","resistance-shape","emdr","practice-select","practice-run","reassess","success","summary"],
  somatic:    ["goal","feeling","somatic-work","reassess","practice-select","practice-run","success","summary"],
  creative:   ["goal","feeling","creative-express","practice-select","practice-run","success","summary"],
  quick:      ["goal","practice-select","practice-run","success","summary"],
  narrative:  ["goal","narrative-write","feeling","practice-select","practice-run","success","summary"],
  meditative: ["goal","feeling","breathing-work","practice-select","practice-run","success","summary"],
  dialogue:   ["goal","feeling","self-letter","practice-select","practice-run","success","summary"],
  gratitude:  ["goal","gratitude-focus","feeling","practice-select","practice-run","success","summary"],
  polarity:   ["goal","polarity-map","feeling","practice-select","practice-run","success","summary"],
  "fear-lens":["goal","fears","fear-reframe","feeling","practice-select","practice-run","success","summary"],
};

// ── Sphere-specific prefix steps ──────────────────────────────────────────────

const SPHERE_EXTRA_STEPS: Partial<Record<SphereId, SphereTaskStepId[]>> = {
  relationships: ["sphere-task-relationships"],
  career:        ["sphere-task-career"],
  health:        ["sphere-task-health"],
};

export function getJourneySteps(sphereId?: SphereId | "", variant?: JourneyVariant): StepId[] {
  const spherePrefix = (sphereId && SPHERE_EXTRA_STEPS[sphereId]) ?? [];
  const core = VARIANT_STEPS[variant ?? "deep"];
  return ["spheres", "assess", "path", ...spherePrefix, ...core];
}

/** Recommend a variant based on sphere score, check-in score, journey count */
export function getRecommendedVariant(
  sphereScore: number | undefined,
  checkinScore: number | null,
  journeyCount: number,
): JourneyVariant {
  const score = sphereScore ?? 5;
  const checkin = checkinScore ?? 5;
  if (journeyCount === 0) return "quick";
  if (score <= 3 && checkin <= 3) return "somatic";
  if (score <= 4) return "deep";
  if (checkin >= 7) return Math.random() < 0.5 ? "creative" : "gratitude";
  const pool: JourneyVariant[] = ["narrative", "meditative", "dialogue", "polarity", "fear-lens"];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ── JourneyState ──────────────────────────────────────────────────────────────

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
  selected_practice_id: string | null;
  selected_practice_key: string | null;
  selected_practice_name: string | null;
  practice_skipped: boolean;
  deep_work_skipped?: boolean;
  // Sphere-task fields (legacy)
  sphere_role?: string;
  sphere_values_order?: string[];
  sphere_safe_place?: string;
  // Entry issue types — determine branching path per sphere
  rel_issue_type?:     "conflict" | "distance" | "improve" | "seeking";
  fam_issue_type?:     "tension" | "disconnection" | "roles";
  career_issue_type?:  "burnout" | "no-meaning" | "conflict";
  finance_issue_type?: "fear" | "chaos" | "blocked-dream";
  growth_issue_type?:  "fear-fail" | "procrastination" | "direction";
  health_issue_type?:  "body-pain" | "habit" | "energy";
  rest_issue_type?:    "cant-relax" | "guilt" | "no-time";
  people_issue_type?:  "toxic" | "lonely" | "expand";
  // Variant fields
  journey_variant?: JourneyVariant;
  narrative_word?: string;
  breathing_type?: "478" | "body-scan";
  gratitude_items?: string[];
  polarity_worst?: string;
  polarity_realistic?: string;
  polarity_best?: string;
  fear_reframe?: { truth: string; not_truth: string; signal: string };
  user_roles?: string[];
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
  selected_practice_id: null,
  selected_practice_key: null,
  selected_practice_name: null,
  practice_skipped: false,
};
