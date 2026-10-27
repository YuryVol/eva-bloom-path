export function canShowCTA(context: string, cooldownDays: number): boolean {
  if (typeof window === "undefined") return false;
  const key = `cta_last_shown_${context}`;
  const last = localStorage.getItem(key);
  if (!last) return true;
  const msPerDay = 86_400_000;
  const daysSince = (Date.now() - new Date(last).getTime()) / msPerDay;
  return daysSince >= cooldownDays;
}

export function markCTAShown(context: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`cta_last_shown_${context}`, new Date().toISOString());
}
