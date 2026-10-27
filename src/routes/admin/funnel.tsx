import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getAdminFunnel } from "@/lib/admin.functions";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { KPICard } from "@/components/admin/KPICard";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";

export const Route = createFileRoute("/admin/funnel")({
  component: AdminFunnelPage,
});

const STEP_LABELS: Record<string, string> = {
  intro: "Интро",
  "about-you": "О тебе",
  "auth-invite": "Регистрация",
  welcome: "Приветствие",
  spheres: "Сферы",
  assess: "Оценка",
  "first-journey": "1й путь",
};

function AdminFunnelPage() {
  const fetch = useServerFn(getAdminFunnel);
  const [data, setData] = useState<Awaited<ReturnType<typeof fetch>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const funnelForChart = data?.funnelSteps.map((s) => ({
    ...s,
    label: STEP_LABELS[s.step] ?? s.step,
  }));

  return (
    <AdminLayout>
      <h1 className="text-xl font-display font-semibold mb-5">Воронка онбординга</h1>

      {loading && <p className="text-muted-foreground">Загрузка…</p>}

      {data && (
        <div className="space-y-6">
          {/* Conversion KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPICard label="Всего пользователей" value={data.conversion.totalUsers} />
            <KPICard label="Начали путешествие" value={data.conversion.startedJourney} />
            <KPICard label="Завершили путешествие" value={data.conversion.completedJourney} />
            <KPICard label="Рег → Старт" value={`${data.conversion.regToStart}%`} highlight />
          </div>

          {/* Funnel bar chart */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-sm font-medium mb-3">Шаги онбординга</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnelForChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="label" type="category" tick={{ fontSize: 11 }} width={90} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Dropout by journey step */}
          {data.dropoutChart.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <p className="text-sm font-medium mb-3">Отказы по шагам путешествия</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.dropoutChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="step" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="rate" name="Отказ %" radius={[4, 4, 0, 0]}>
                    {data.dropoutChart.map((entry, i) => (
                      <Cell key={i} fill={entry.rate > 40 ? "hsl(var(--destructive))" : entry.rate > 20 ? "#f59e0b" : "hsl(var(--primary))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
