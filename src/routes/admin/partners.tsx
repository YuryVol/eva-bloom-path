import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getAdminPartners } from "@/lib/admin.functions";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

export const Route = createFileRoute("/admin/partners")({
  component: AdminPartnersPage,
});

type Period = "today" | "7d" | "30d" | "all";

const PARTNER_LABELS: Record<string, string> = {
  skillbox: "Skillbox",
  voltabot: "VoltaBot",
  balansity: "Balansity",
  psychologist: "Психолог",
};

function AdminPartnersPage() {
  const fetch = useServerFn(getAdminPartners);
  const [data, setData] = useState<Awaited<ReturnType<typeof fetch>> | null>(null);
  const [period, setPeriod] = useState<Period>("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch({ data: { period } }).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [period]); // eslint-disable-line react-hooks/exhaustive-deps

  const PERIODS: { value: Period; label: string }[] = [
    { value: "today", label: "Сегодня" },
    { value: "7d", label: "7 дней" },
    { value: "30d", label: "30 дней" },
    { value: "all", label: "Всё время" },
  ];

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-display font-semibold">Партнёры</h1>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={[
                "rounded-lg px-3 py-1.5 text-sm transition",
                period === p.value ? "bg-primary text-white" : "bg-muted/50 text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-muted-foreground">Загрузка…</p>}

      {data && (
        <div className="space-y-6">
          {/* Partner cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {data.partnerCards.map((p) => (
              <div key={p.slug} className="rounded-2xl border border-border/50 bg-card p-4">
                <p className="font-medium text-sm mb-3">{PARTNER_LABELS[p.slug] ?? p.slug}</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Показов</span>
                    <span>{p.shown}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Кликов</span>
                    <span>{p.clicked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CTR</span>
                    <span className={p.ctr > 10 ? "text-emerald-600 font-semibold" : p.ctr > 3 ? "text-amber-600" : "text-muted-foreground"}>
                      {p.ctr}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Daily trend */}
          {data.dailyChart.length > 0 && (
            <div className="rounded-2xl border border-border/50 bg-card p-5">
              <p className="text-sm font-medium mb-3">Динамика по дням</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.dailyChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="shown" name="Показы" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="clicked" name="Клики" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
