import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getAdminUsers } from "@/lib/admin.functions";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ChurnBadge } from "@/components/admin/ChurnBadge";
import { UserProfile } from "@/components/admin/UserProfile";
import { Search } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

type Filter = "all" | "high_risk" | "medium_risk" | "new" | "active_today";
type User = Awaited<ReturnType<ReturnType<typeof useServerFn<typeof getAdminUsers>>>>["users"][number];

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "active_today", label: "Сегодня активны" },
  { value: "new", label: "Новые (7д)" },
  { value: "medium_risk", label: "Риск оттока" },
  { value: "high_risk", label: "Высокий риск" },
];

function AdminUsersPage() {
  const fetch = useServerFn(getAdminUsers);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const PAGE_SIZE = 50;

  const load = useCallback(() => {
    setLoading(true);
    fetch({ data: { page, filter, search } })
      .then(({ users, total }) => { setUsers(users); setTotal(total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, filter, search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const handleSearch = () => { setSearch(searchInput); setPage(0); };

  return (
    <AdminLayout>
      <h1 className="text-xl font-display font-semibold mb-5">Пользователи</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => { setFilter(f.value); setPage(0); }}
            className={[
              "rounded-full px-3 py-1 text-sm transition",
              filter === f.value ? "bg-primary text-white" : "bg-muted/50 text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}

        {/* Search */}
        <div className="flex ml-auto gap-2">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Поиск по имени…"
            className="rounded-full border border-border/50 bg-card px-3 py-1 text-sm outline-none focus:border-primary/50 w-48"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="rounded-full border border-border/50 bg-card p-2 hover:border-primary/50 transition"
          >
            <Search className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30 bg-muted/20">
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Имя</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">XP</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Стрик</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Telegram</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Статус</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Последняя активность</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Загрузка…</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Нет данных</td></tr>
            )}
            {!loading && users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-border/20 hover:bg-muted/20 cursor-pointer transition"
                onClick={() => setSelectedUserId(u.id)}
              >
                <td className="px-4 py-3 font-medium">{u.displayName}</td>
                <td className="px-4 py-3">{u.xpTotal}</td>
                <td className="px-4 py-3">{u.practiceStreak}д</td>
                <td className="px-4 py-3">{u.telegramConnected ? "✓" : "—"}</td>
                <td className="px-4 py-3"><ChurnBadge risk={u.churnRisk} /></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleDateString("ru") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <span>Всего: {total}</span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-lg border border-border/50 px-3 py-1.5 disabled:opacity-30 hover:border-primary/40 transition"
          >
            ←
          </button>
          <span className="px-2 py-1.5">{page + 1} / {Math.ceil(total / PAGE_SIZE) || 1}</span>
          <button
            type="button"
            disabled={(page + 1) * PAGE_SIZE >= total}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-border/50 px-3 py-1.5 disabled:opacity-30 hover:border-primary/40 transition"
          >
            →
          </button>
        </div>
      </div>

      {/* Profile drawer */}
      {selectedUserId && (
        <UserProfile userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </AdminLayout>
  );
}
