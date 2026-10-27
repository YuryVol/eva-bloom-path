export type MilestoneRewardType = "practice" | "course";

export interface Milestone {
  id: string;
  label: string;
  rewardLabel: string;
  rewardType: MilestoneRewardType;
  rewardIcon: string;
  journeysRequired?: number;
  streakRequired?: number;
  xpRequired?: number;
}

export const MILESTONES: Milestone[] = [
  {
    id: "safe-place",
    label: "Безопасное место",
    rewardLabel: "Практика «Безопасное место»",
    rewardType: "practice",
    rewardIcon: "🏡",
    journeysRequired: 3,
  },
  {
    id: "self-compassion",
    label: "Сострадание к себе",
    rewardLabel: "Практика «Сострадание к себе»",
    rewardType: "practice",
    rewardIcon: "💚",
    streakRequired: 7,
  },
  {
    id: "inner-child",
    label: "Внутренний ребёнок",
    rewardLabel: "Практика «Внутренний ребёнок»",
    rewardType: "practice",
    rewardIcon: "🧸",
    journeysRequired: 7,
  },
  {
    id: "course-anxiety",
    label: "Путь к тишине",
    rewardLabel: "Сокровищница: тревога и твоя сила",
    rewardType: "course",
    rewardIcon: "📚",
    xpRequired: 450,
  },
  {
    id: "course-burnout",
    label: "Глубокая работа",
    rewardLabel: "Сокровищница: энергия и восстановление",
    rewardType: "course",
    rewardIcon: "🔥",
    xpRequired: 750,
  },
];

export function getNextMilestone(
  journeyCount: number,
  practiceStreak: number,
  xp: number,
): Milestone | null {
  return (
    MILESTONES.find((m) => {
      if (m.journeysRequired) return journeyCount < m.journeysRequired;
      if (m.streakRequired) return practiceStreak < m.streakRequired;
      if (m.xpRequired) return xp < m.xpRequired;
      return false;
    }) ?? null
  );
}

export function getMilestoneProgress(
  m: Milestone,
  journeyCount: number,
  practiceStreak: number,
  xp: number,
): { current: number; total: number; remaining: number; unit: string } {
  let current = 0;
  let total = 1;
  if (m.journeysRequired) { current = journeyCount; total = m.journeysRequired; }
  else if (m.streakRequired) { current = practiceStreak; total = m.streakRequired; }
  else if (m.xpRequired) { current = xp; total = m.xpRequired; }

  const remaining = total - current;
  const unit = m.journeysRequired
    ? remaining === 1 ? "путь" : remaining < 5 ? "пути" : "путей"
    : m.streakRequired
    ? remaining === 1 ? "день" : remaining < 5 ? "дня" : "дней"
    : "XP";

  return { current, total, remaining, unit };
}

export function isUnlocked(
  m: Milestone,
  journeyCount: number,
  practiceStreak: number,
  xp: number,
): boolean {
  if (m.journeysRequired) return journeyCount >= m.journeysRequired;
  if (m.streakRequired) return practiceStreak >= m.streakRequired;
  if (m.xpRequired) return xp >= m.xpRequired;
  return false;
}
