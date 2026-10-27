import { SPHERE_DATA } from "@/content/help-texts";

export function SphereGrid({ showPremiumNote }: { showPremiumNote?: boolean }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {SPHERE_DATA.map((s) => (
          <div
            key={s.id}
            className="flex items-start gap-2 rounded-xl border border-border/30 bg-card/50 px-3 py-2.5"
          >
            <span className="mt-0.5 text-lg leading-none shrink-0">{s.icon}</span>
            <div>
              <p className="text-sm font-medium text-foreground/90">{s.label}</p>
              <p className="text-[11px] leading-snug text-muted-foreground">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
      {showPremiumNote && (
        <p className="mt-3 rounded-xl border border-amber-200/60 bg-amber-50/60 px-3 py-2 text-[12px] text-amber-800/80">
          ✨ В Premium каждая сфера получает своего хранителя — персонажа которого ты создаёшь сама.
        </p>
      )}
    </div>
  );
}
