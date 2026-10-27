import type { SphereId } from "@/lib/journey-types";

export interface Partner {
  slug: "skillbox" | "voltabot" | "balansity" | "psychologist";
  name: string;
  base_url: string;
  utm_campaign: string;
  is_active: boolean;
  sphere_ids: string[];
  eva_phrase: string;
  cta_text: string;
  is_free: boolean;
}

export const PARTNERS: Record<string, Partner> = {
  voltabot: {
    slug: "voltabot",
    name: "Voltabot",
    base_url: "https://voltabot.com/",
    utm_campaign: "route_complete",
    is_active: true,
    sphere_ids: ["family", "relationships", "career", "growth", "finance", "rest", "people", "health"],
    eva_phrase: "Большой шаг пока не нужен. Начни с маленькой бережной игры — она рядом, в телефоне.",
    cta_text: "Попробовать бесплатно →",
    is_free: true,
  },
  skillbox: {
    slug: "skillbox",
    name: "Skillbox",
    base_url: "https://skillbox.ru/",
    utm_campaign: "route_complete",
    is_active: true,
    sphere_ids: ["career", "growth", "finance"],
    eva_phrase: "Ты уже чувствуешь, куда тянется твой интерес. Если захочешь сделать это опорой — вот дверь. Я приготовила тебе подарок на входе.",
    cta_text: "Открыть подборку курсов →",
    is_free: false,
  },
  balansity: {
    slug: "balansity",
    name: "Balansity",
    base_url: "https://balansity.ru/",
    utm_campaign: "route_complete",
    is_active: true,
    sphere_ids: ["family"],
    eva_phrase: "Заботиться о себе — это и заботиться о связи с ребёнком. Здесь помогут бережно и быстро.",
    cta_text: "Найти специалиста →",
    is_free: false,
  },
  psychologist: {
    slug: "psychologist",
    name: "Живой психолог",
    base_url: "/partners/psychologist",
    utm_campaign: "route_complete",
    is_active: true,
    sphere_ids: ["relationships", "health"],
    eva_phrase: "Иногда самый сильный шаг — позволить живому человеку быть рядом. Это не слабость. Это выбор — быть с собой.",
    cta_text: "Узнать больше →",
    is_free: false,
  },
};

export interface PartnerTriggerParams {
  sphere_id: SphereId;
  baseline_score: number;
  current_score: number;
  has_children_mention: boolean;
  mood_score?: number; // 1–5, если ≤ 2 — блокируем всё
}

export function getPartnerForRoute(params: PartnerTriggerParams): Partner[] {
  // Дистресс-блокировка
  if (params.mood_score !== undefined && params.mood_score <= 2) return [];

  // Кризис здоровья с низким baseline — только психолог, не коммерческие
  if (params.sphere_id === "health" && params.baseline_score <= 2) {
    return [PARTNERS.psychologist];
  }

  const growth = params.current_score - params.baseline_score;
  const partners: Partner[] = [];

  // Voltabot — всегда как мягкий шаг
  partners.push(PARTNERS.voltabot);

  // Skillbox — треки Развитие/Финансы/Призвание при росте ≥ 1
  if (["career", "growth", "finance"].includes(params.sphere_id) && growth >= 1) {
    partners.push(PARTNERS.skillbox);
  }

  // Balansity — трек Семья + упоминание детей
  if (params.sphere_id === "family" && params.has_children_mention) {
    partners.push(PARTNERS.balansity);
  }

  // Живой психолог — Отношения / Здоровье при низком baseline
  if (["relationships", "health"].includes(params.sphere_id) && params.baseline_score <= 4) {
    partners.push(PARTNERS.psychologist);
  }

  // Максимум 2 партнёра (Voltabot + 1 целевой)
  return partners.slice(0, 2);
}
