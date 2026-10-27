import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getAdminUserProfile } from "@/lib/admin.functions";
import { SpiderChart } from "./SpiderChart";
import { X } from "lucide-react";

interface UserProfileProps {
  userId: string;
  onClose: () => void;
}

export function UserProfile({ userId, onClose }: UserProfileProps) {
  const fetch = useServerFn(getAdminUserProfile);
  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminUserProfile>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch({ data: { targetUserId: userId } })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-card border border-border/50 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border/30">
          <span className="font-display text-base font-semibold">
            {loading ? "Загрузка…" : ((data?.profile?.display_name as string) ?? "Пользователь")}
          </span>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-muted/50 transition">
            <X className="size-4" />
          </button>
        </div>

        {loading && <div className="p-8 text-center text-muted-foreground text-sm">Загрузка данных…</div>}

        {!loading && data && (
          <div className="p-5 space-y-5">
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">XP</p>
                <p className="text-lg font-bold">{(data.profile?.xp_total as number) ?? 0}</p>
              </div>
              <div className="rounded-xl bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">Монеты</p>
                <p className="text-lg font-bold">{(data.profile?.coins_total as number) ?? 0}</p>
              </div>
              <div className="rounded-xl bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">Стрик</p>
                <p className="text-lg font-bold">{(data.profile?.practice_streak as number) ?? 0}</p>
              </div>
            </div>

            {/* Spider chart */}
            {Object.keys(data.sphereScores).length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Прогресс по сферам</p>
                <SpiderChart scores={data.sphereScores} />
              </div>
            )}

            {/* Recent journeys */}
            {data.journeys.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Путешествия</p>
                <div className="space-y-1">
                  {data.journeys.slice(0, 5).map((j: Record<string, unknown>) => (
                    <div key={j.id as string} className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2 text-sm">
                      <span>{(j.state as Record<string, unknown>)?.priority_sphere as string ?? "—"}</span>
                      <span className={[
                        "text-xs rounded-full px-2 py-0.5",
                        j.status === "completed" ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground",
                      ].join(" ")}>
                        {j.status === "completed" ? "Завершено" : "В процессе"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
