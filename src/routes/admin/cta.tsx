import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getCTAStats } from "@/lib/admin.functions";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/cta")({
  component: AdminCTAPage,
});

type CTAStat = { context: string; shown: number; clicked: number; ctr: number };

const CONTEXT_LABELS: Record<string, string> = {
  home: "Главная — Мир Евы",
  spheres: "Сферы — лимит",
  summary: "Итог путешествия",
  route_complete: "Первый шаг",
  practice: "Выбор практики",
  history: "История путешествий",
  guardians: "Хранители",
  practices: "Каталог практик",
  opportunities: "Возможности",
  help: "Помощь",
};

function ctrColor(ctr: number) {
  if (ctr >= 15) return "text-emerald-600";
  if (ctr >= 7) return "text-amber-600";
  return "text-muted-foreground";
}

function AdminCTAPage() {
  const fetch = useServerFn(getCTAStats);
  const [stats, setStats] = useState<CTAStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalShown = stats.reduce((s, r) => s + r.shown, 0);
  const totalClicked = stats.reduce((s, r) => s + r.clicked, 0);
  const totalCTR = totalShown > 0 ? Math.round((totalClicked / totalShown) * 1000) / 10 : 0;

  return (
    <AdminLayout>
      <h1 className="text-xl font-display font-semibold mb-2">CTA — аналитика</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Показы и клики по Premium CTA-блокам на всех экранах.
      </p>

      {loading && <p className="text-muted-foreground">Загрузка…</p>}

      {!loading && stats.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Данных пока нет. Убедитесь что таблица <code>premium_cta_events</code> создана в Supabase.
        </p>
      )}

      {!loading && stats.length > 0 && (
        <>
          {/* Итог */}
          <div className="mb-6 flex gap-6">
            <div className="rounded-2xl border border-border/50 bg-card/80 px-5 py-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Всего показов</p>
              <p className="mt-1 font-display text-3xl">{totalShown.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/80 px-5 py-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Всего кликов</p>
              <p className="mt-1 font-display text-3xl">{totalClicked.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-card/80 px-5 py-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">CTR</p>
              <p className={`mt-1 font-display text-3xl ${ctrColor(totalCTR)}`}>{totalCTR}%</p>
            </div>
          </div>

          {/* Таблица по контекстам */}
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/80">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                  <th className="px-5 py-3">Экран</th>
                  <th className="px-5 py-3 text-right">Показов</th>
                  <th className="px-5 py-3 text-right">Кликов</th>
                  <th className="px-5 py-3 text-right">CTR</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((row) => (
                  <tr key={row.context} className="border-b border-border/30 last:border-b-0">
                    <td className="px-5 py-3 font-medium">
                      {CONTEXT_LABELS[row.context] ?? row.context}
                    </td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{row.shown.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{row.clicked.toLocaleString()}</td>
                    <td className={`px-5 py-3 text-right font-semibold ${ctrColor(row.ctr)}`}>
                      {row.ctr}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
