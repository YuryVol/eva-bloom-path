import type { JSX } from "react";

// 6 SVG silhouettes for sphere guardians
// Each silhouette is a simple abstract figure that the user can colorize

export type SilhouetteId = "tree" | "mountain" | "flame" | "wave" | "star" | "lotus";

interface SilhouetteProps {
  id: SilhouetteId;
  colorPrimary: string;
  colorSecondary?: string;
  size?: number;
  className?: string;
}

export function GuardianSilhouette({
  id,
  colorPrimary,
  colorSecondary,
  size = 120,
  className = "",
}: SilhouetteProps) {
  const secondary = colorSecondary ?? colorPrimary + "80";

  const shapes: Record<SilhouetteId, JSX.Element> = {
    tree: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <ellipse cx="50" cy="38" rx="28" ry="30" fill={colorPrimary} opacity="0.9"/>
        <ellipse cx="50" cy="28" rx="20" ry="22" fill={secondary} opacity="0.8"/>
        <rect x="44" y="66" width="12" height="22" rx="5" fill={colorPrimary}/>
        <ellipse cx="50" cy="92" rx="14" ry="4" fill={colorPrimary} opacity="0.3"/>
      </svg>
    ),
    mountain: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <polygon points="50,10 85,82 15,82" fill={colorPrimary} opacity="0.9"/>
        <polygon points="50,10 68,50 32,50" fill={secondary} opacity="0.7"/>
        <ellipse cx="50" cy="84" rx="30" ry="5" fill={colorPrimary} opacity="0.2"/>
      </svg>
    ),
    flame: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M50 8 C50 8 72 30 72 55 C72 70 62 85 50 88 C38 85 28 70 28 55 C28 30 50 8 50 8Z" fill={colorPrimary} opacity="0.9"/>
        <path d="M50 35 C50 35 62 48 62 60 C62 70 56 80 50 82 C44 80 38 70 38 60 C38 48 50 35 50 35Z" fill={secondary} opacity="0.8"/>
        <ellipse cx="50" cy="90" rx="18" ry="4" fill={colorPrimary} opacity="0.2"/>
      </svg>
    ),
    wave: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M10 50 Q25 20 40 50 Q55 80 70 50 Q85 20 95 40 L95 80 Q80 100 60 85 Q45 72 30 85 Q15 98 10 80 Z" fill={colorPrimary} opacity="0.9"/>
        <path d="M10 45 Q25 18 40 45 Q55 72 70 45 Q82 22 92 38" stroke={secondary} strokeWidth="4" fill="none" strokeLinecap="round"/>
        <ellipse cx="50" cy="90" rx="28" ry="4" fill={colorPrimary} opacity="0.2"/>
      </svg>
    ),
    star: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M50 10 L57 38 L86 38 L63 55 L72 83 L50 67 L28 83 L37 55 L14 38 L43 38 Z" fill={colorPrimary} opacity="0.9"/>
        <path d="M50 22 L55 40 L74 40 L60 51 L66 69 L50 58 L34 69 L40 51 L26 40 L45 40 Z" fill={secondary} opacity="0.6"/>
        <ellipse cx="50" cy="88" rx="20" ry="4" fill={colorPrimary} opacity="0.2"/>
      </svg>
    ),
    lotus: (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M50 80 C50 80 20 65 20 45 C20 30 35 20 50 30 C65 20 80 30 80 45 C80 65 50 80 50 80Z" fill={colorPrimary} opacity="0.8"/>
        <path d="M50 80 C50 80 5 60 5 38 C5 20 25 12 40 25" stroke={colorPrimary} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6"/>
        <path d="M50 80 C50 80 95 60 95 38 C95 20 75 12 60 25" stroke={colorPrimary} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6"/>
        <ellipse cx="50" cy="52" rx="16" ry="18" fill={secondary} opacity="0.9"/>
        <circle cx="50" cy="48" r="7" fill={colorPrimary}/>
        <ellipse cx="50" cy="84" rx="22" ry="4" fill={colorPrimary} opacity="0.2"/>
      </svg>
    ),
  };

  return shapes[id] ?? shapes.tree;
}

export const SILHOUETTES: { id: SilhouetteId; label: string }[] = [
  { id: "tree",     label: "Дерево" },
  { id: "mountain", label: "Гора" },
  { id: "flame",    label: "Пламя" },
  { id: "wave",     label: "Волна" },
  { id: "star",     label: "Звезда" },
  { id: "lotus",    label: "Лотос" },
];

// Suggested silhouette per sphere
export const SPHERE_SILHOUETTE_HINT: Record<string, SilhouetteId> = {
  health:    "lotus",
  rest:      "wave",
  relations: "star",
  growth:    "tree",
  finance:   "mountain",
  purpose:   "flame",
};

// Palette options
export const PALETTE = [
  "#6B8F71", // forest green
  "#7C9CBF", // sky blue
  "#C9956B", // warm earth
  "#B07CC6", // soft violet
  "#E8A598", // rose
  "#F2C94C", // gold
  "#81C4C8", // teal
  "#A8A8A8", // silver
];
