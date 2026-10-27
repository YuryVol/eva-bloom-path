import type { Partner } from "@/lib/partner-trigger";

function hashUserId(userId: string): string {
  // djb2 hash → 8-char hex string (sync, no crypto.subtle needed)
  let h = 5381;
  for (let i = 0; i < userId.length; i++) {
    h = ((h << 5) + h) ^ userId.charCodeAt(i);
    h = h >>> 0; // keep unsigned 32-bit
  }
  return h.toString(16).padStart(8, "0");
}

export function buildPartnerUrl(
  partner: Partner,
  params: { sphere_id: string; user_id: string },
): string {
  // Internal pages (psychologist) — no UTM needed
  if (partner.base_url.startsWith("/")) return partner.base_url;

  const hashed = hashUserId(params.user_id);
  const url = new URL(partner.base_url);
  url.searchParams.set("utm_source", "eva_app");
  url.searchParams.set("utm_medium", "partner");
  url.searchParams.set("utm_campaign", partner.utm_campaign);
  url.searchParams.set("utm_content", params.sphere_id);
  url.searchParams.set("utm_term", hashed);
  return url.toString();
}
