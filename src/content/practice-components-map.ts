import type { PracticeComponentMap } from "@/types/practice";

export const practiceComponentMap: PracticeComponentMap = {
  // ── family ──────────────────────────────────────────────────
  "family-stabilization":       () => import("@/components/practices/FamilyAnchor"),
  "family-relaxation":          () => import("@/components/practices/FamilyLetter"),
  "family-harmonization":       () => import("@/components/practices/FamilyRewrite"),

  // ── relationships ────────────────────────────────────────────
  "relationships-stabilization": () => import("@/components/practices/RelBreathing"),
  "relationships-relaxation":    () => import("@/components/practices/RelNeeds"),
  "relationships-harmonization": () => import("@/components/practices/RelCloseness"),

  // ── career ───────────────────────────────────────────────────
  "career-stabilization":       () => import("@/components/practices/CareerFlow"),
  "career-relaxation":          () => import("@/components/practices/CareerLeaf"),
  "career-harmonization":       () => import("@/components/practices/CareerLetter"),

  // ── growth ───────────────────────────────────────────────────
  "growth-stabilization":       () => import("@/components/practices/GrowthTimeline"),
  "growth-relaxation":          () => import("@/components/practices/GrowthNotKnow"),
  "growth-harmonization":       () => import("@/components/practices/GrowthInnerWisdom"),

  // ── finance ──────────────────────────────────────────────────
  "finance-stabilization":      () => import("@/components/practices/FinanceAudit"),
  "finance-relaxation":         () => import("@/components/practices/FinanceBodyMap"),
  "finance-harmonization":      () => import("@/components/practices/FinanceBeliefs"),

  // ── rest ─────────────────────────────────────────────────────
  "rest-stabilization":         () => import("@/components/practices/RestBreathing"),
  "rest-relaxation":            () => import("@/components/practices/RestBodyScan"),
  "rest-harmonization":         () => import("@/components/practices/RestJoyArchive"),

  // ── people ───────────────────────────────────────────────────
  "people-stabilization":       () => import("@/components/practices/PeopleMap"),
  "people-relaxation":          () => import("@/components/practices/PeopleBoundaries"),
  "people-harmonization":       () => import("@/components/practices/PeopleVenn"),

  // ── health ───────────────────────────────────────────────────
  "health-stabilization":       () => import("@/components/practices/HealthGratitude"),
  "health-relaxation":          () => import("@/components/practices/HealthSymptom"),
  "health-harmonization":       () => import("@/components/practices/HealthVision"),
};
