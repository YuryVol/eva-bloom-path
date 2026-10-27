/** Lightweight Supabase REST helper for the bot (no SDK, runs in Cloudflare Workers). */
export function db(supabaseUrl: string, serviceKey: string) {
  const h = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
  const jh = { ...h, "Content-Type": "application/json" };

  async function get<T>(path: string): Promise<T[]> {
    try {
      const r = await fetch(`${supabaseUrl}/rest/v1/${path}`, { headers: h });
      if (!r.ok) return [];
      return r.json() as Promise<T[]>;
    } catch { return []; }
  }

  async function getOne<T>(path: string): Promise<T | null> {
    const rows = await get<T>(path);
    return rows[0] ?? null;
  }

  async function patch(table: string, filter: string, data: unknown): Promise<void> {
    try {
      await fetch(`${supabaseUrl}/rest/v1/${table}?${filter}`, {
        method: "PATCH", headers: jh, body: JSON.stringify(data),
      });
    } catch { /* ignore */ }
  }

  async function insert(table: string, data: unknown, prefer = ""): Promise<void> {
    try {
      const headers: Record<string, string> = prefer ? { ...jh, Prefer: prefer } : jh;
      await fetch(`${supabaseUrl}/rest/v1/${table}`, {
        method: "POST", headers, body: JSON.stringify(data),
      });
    } catch { /* ignore */ }
  }

  async function insertGetId(table: string, data: unknown): Promise<string | null> {
    try {
      const r = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
        method: "POST",
        headers: { ...jh, Prefer: "return=representation" },
        body: JSON.stringify(data),
      });
      if (!r.ok) return null;
      const rows = await r.json() as Array<{ id: string }>;
      return rows[0]?.id ?? null;
    } catch { return null; }
  }

  return { get, getOne, patch, insert, insertGetId };
}

export type Db = ReturnType<typeof db>;
