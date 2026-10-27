import { type JourneyState, type SphereId, type StepId } from "./journey-types";

// ── Universal terminal transitions (same for all spheres) ─────────────────────
const COMMON: Partial<Record<StepId, StepId>> = {
  "success":          "summary",
  "reassess":         "success",
  "resistance-shape": "emdr-intro",
  "emdr-intro":       "emdr",
  "emdr":             "reassess",
  "practice-select":  "practice-run",
  "practice-run":     "success",
  // These steps always go to the same place regardless of sphere
  "creative-express": "practice-select",
  "self-letter":      "practice-select",
};

// ── Per-sphere transition functions ───────────────────────────────────────────

function nextRelationships(step: StepId, s: JourneyState): StepId {
  switch (step) {
    case "rel-entry":   return "goal";
    case "goal":
      if (s.rel_issue_type === "conflict")  return "resistance";
      if (s.rel_issue_type === "distance")  return "self-letter";
      return "feeling"; // improve + seeking
    case "feeling":     return "polarity-map";
    case "polarity-map":return "practice-select";
    case "self-letter": return "practice-select";
    case "resistance":  return "resistance-shape";
    default:            return "summary";
  }
}

function nextFamily(step: StepId, s: JourneyState): StepId {
  switch (step) {
    case "fam-entry": return "goal";
    case "goal":
      if (s.fam_issue_type === "tension")       return "resistance";
      if (s.fam_issue_type === "disconnection") return "self-letter"; // COMMON: self-letter → practice-select
      return "narrative-write"; // roles
    case "resistance":      return "resistance-shape";
    case "narrative-write": return "practice-select";
    default:                return "summary";
  }
}

function nextCareer(step: StepId, s: JourneyState): StepId {
  switch (step) {
    case "career-entry":
      if (s.career_issue_type === "burnout") return "feeling";
      return "goal"; // no-meaning, conflict
    case "feeling":      return "somatic-work"; // burnout
    case "somatic-work": return "self-letter";  // burnout (COMMON handles self-letter → practice-select)
    case "goal":
      if (s.career_issue_type === "no-meaning") return "polarity-map";
      return "resistance"; // conflict
    case "polarity-map": return "creative-express"; // COMMON handles creative-express → practice-select
    case "resistance":   return "resistance-shape";
    default:             return "summary";
  }
}

function nextFinance(step: StepId, s: JourneyState): StepId {
  switch (step) {
    case "finance-entry":
      if (s.finance_issue_type === "fear") return "fear-reframe";
      return "goal"; // chaos, blocked-dream
    case "fear-reframe": return "goal"; // after reframe, set goal
    case "goal":
      if (s.finance_issue_type === "blocked-dream") return "gratitude-focus";
      return "polarity-map"; // fear (after reframe) or chaos
    case "gratitude-focus": return "creative-express"; // COMMON handles creative-express → practice-select
    case "polarity-map":    return "practice-select";
    default:                return "summary";
  }
}

function nextGrowth(step: StepId, s: JourneyState): StepId {
  switch (step) {
    case "growth-entry":
      if (s.growth_issue_type === "fear-fail") return "fears";
      return "goal"; // procrastination, direction
    case "fears":        return "fear-reframe"; // only for fear-fail
    case "fear-reframe": return "practice-select";
    case "goal":
      if (s.growth_issue_type === "procrastination") return "feeling";
      return "gratitude-focus"; // direction
    case "feeling":         return "narrative-write";
    case "narrative-write": return "practice-select"; // procrastination: write → practice → success
    case "gratitude-focus": return "creative-express"; // COMMON handles creative-express → practice-select
    default:                return "summary";
  }
}

function nextHealth(step: StepId, s: JourneyState): StepId {
  switch (step) {
    case "health-entry":
      if (s.health_issue_type === "body-pain") return "somatic-work";
      return "goal"; // habit, energy
    case "goal":
      if (s.health_issue_type === "habit") return "feeling";
      return "gratitude-focus"; // energy
    case "feeling":      return "breathing-work"; // habit
    case "somatic-work": return "breathing-work"; // body-pain
    case "breathing-work":
      if (s.health_issue_type === "body-pain") return "reassess";
      return "practice-select"; // habit, energy
    case "gratitude-focus": return "practice-select";
    default:                return "summary";
  }
}

function nextRest(step: StepId, s: JourneyState): StepId {
  switch (step) {
    case "rest-entry":
      if (s.rest_issue_type === "cant-relax") return "breathing-work";
      return "goal"; // guilt, no-time
    case "goal":
      if (s.rest_issue_type === "no-time") return "polarity-map";
      return "self-letter"; // guilt
    case "breathing-work": return "self-letter"; // cant-relax → breathe → reflect
    case "self-letter":    return "practice-select";
    case "polarity-map":   return "practice-select";
    default:               return "summary";
  }
}

function nextPeople(step: StepId, s: JourneyState): StepId {
  switch (step) {
    case "people-entry": return "goal";
    case "goal":
      if (s.people_issue_type === "toxic")  return "resistance";
      if (s.people_issue_type === "lonely") return "gratitude-focus";
      return "creative-express"; // expand
    case "resistance":      return "resistance-shape";
    case "gratitude-focus": return "practice-select";
    case "creative-express":return "practice-select";
    default:                return "summary";
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Returns the first step after assess for the given sphere. */
export function getEntryStep(sphereId: SphereId, state: JourneyState): StepId {
  // Health with very low score → skip entry question, go straight to body work
  if (sphereId === "health" && (state.sphere_scores[sphereId] ?? 5) <= 3) {
    return "somatic-work";
  }
  const entries: Record<SphereId, StepId> = {
    relationships: "rel-entry",
    family:        "fam-entry",
    career:        "career-entry",
    finance:       "finance-entry",
    growth:        "growth-entry",
    health:        "health-entry",
    rest:          "rest-entry",
    people:        "people-entry",
  };
  return entries[sphereId] ?? "goal";
}

/** Estimated total step count for the progress bar. */
export function getEstimatedLength(_sphereId: SphereId): number {
  // All journeys start: spheres → assess → entry → ... → summary
  // Average ~9 steps regardless of sphere/branch
  return 9;
}

/** Computes the next step given sphere, current step, and journey state. */
export function getNextStep(
  sphereId: SphereId | "",
  step: StepId,
  state: JourneyState,
): StepId {
  // Universal terminal transitions
  const common = COMMON[step];
  if (common) return common;

  if (!sphereId) return "summary";

  switch (sphereId) {
    case "relationships": return nextRelationships(step, state);
    case "family":        return nextFamily(step, state);
    case "career":        return nextCareer(step, state);
    case "finance":       return nextFinance(step, state);
    case "growth":        return nextGrowth(step, state);
    case "health":        return nextHealth(step, state);
    case "rest":          return nextRest(step, state);
    case "people":        return nextPeople(step, state);
    default:              return "summary";
  }
}
