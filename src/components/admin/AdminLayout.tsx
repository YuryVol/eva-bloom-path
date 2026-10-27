import { Link, useLocation } from "@tanstack/react-router";

const TABS = [
  { to: "/admin/overview", label: "Обзор" },
  { to: "/admin/funnel", label: "Воронка" },
  { to: "/admin/users", label: "Пользователи" },
  { to: "/admin/partners", label: "Партнёры" },
  { to: "/admin/cta", label: "CTA" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-card/80 px-6 py-4 flex items-center gap-6">
        <span className="font-display text-lg font-semibold">EVA Admin</span>
        <nav className="flex gap-1">
          {TABS.map((t) => (
            <Link
              key={t.to}
              to={t.to as never}
              className={[
                "rounded-lg px-3 py-1.5 text-sm transition",
                pathname === t.to
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              ].join(" ")}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <Link to="/home" className="ml-auto text-xs text-muted-foreground hover:text-foreground transition">
          ← В приложение
        </Link>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
