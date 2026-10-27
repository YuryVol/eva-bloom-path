import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from "recharts";

const SPHERE_LABELS: Record<string, string> = {
  relationships: "Отношения",
  health: "Здоровье",
  career: "Карьера",
  growth: "Рост",
  family: "Семья",
  finance: "Финансы",
  rest: "Отдых",
  people: "Люди",
};

interface SpiderChartProps {
  scores: Record<string, number>;
}

export function SpiderChart({ scores }: SpiderChartProps) {
  const data = Object.keys(SPHERE_LABELS).map((key) => ({
    sphere: SPHERE_LABELS[key],
    value: scores[key] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="sphere" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
        <Tooltip
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Radar dataKey="value" fill="hsl(var(--primary))" fillOpacity={0.25} stroke="hsl(var(--primary))" strokeWidth={1.5} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
