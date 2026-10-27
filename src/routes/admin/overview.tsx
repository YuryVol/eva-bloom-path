import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getAdminOverview } from "@/lib/admin.functions";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { KPICard } from "@/components/admin/KPICard";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/admin/overview")({
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  const fetch = useServerFn(getAdminOverview);
  const [data, setData] = useState<Awaited<ReturnType<typeof fetch>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AdminLayout>
      <h1 className="text-xl font-display font-semibold mb-5">Обзор</h1>

      {loading && <p className="text-muted-foreground">Загрузка…</p>}

      {data && (
        <div className="space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPICard label="DAU сегодня" value={data.kpi.dau} highlight />
            <KPICard label="MAU 30д" value={data.kpi.mau} />
            <KPICard label="Новые за 7д" value={data.kpi.newWeek} />
            <KPICard label="Завершено сегодня" value={data.kpi.completedToday} />
          </div>

          {/* Retention row */}
          <div className="grid grid-cols-3 gap-3">
            <KPICard label="Retention D1" value={`${data.kpi.d1Retention}%`} />
            <KPICard label="Retention D7" value={`${data.kpi.d7Retention}%`} />
            <KPICard label="Retention D30" value={`${data.kpi.d30Retention}%`} />
          </div>

          {/* DAU chart */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-sm font-medium mb-3">Ежедневные активные пользователи (30д)</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.dauChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Line type="monotone" dataKey="dau" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Two charts side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Top spheres */}
            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <p className="text-sm font-medium mb-3">Топ сферы</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data.topSpheres.slice(0, 8)} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="sphere" type="category" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Streak distribution */}
            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <p className="text-sm font-medium mb-3">Распределение стриков</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data.streakChart}>
                  <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hourly activity */}
          <div className="rounded-2xl border border-border/50 bg-card p-5">
            <p className="text-sm font-medium mb-3">Активность по часам (UTC, 30д)</p>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={data.hourChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}:00`} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
