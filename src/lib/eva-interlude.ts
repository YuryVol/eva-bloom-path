import { create } from "zustand";

export type InterludeScene =
  | "spheres-to-assess"
  | "assess-to-path"
  | "feeling-to-current"
  | "shape-to-emdr"
  | "reassess-to-success"
  | "success-to-summary";

export interface SceneConfig {
  src: string;
  alt: string;
  caption: string;
  /** Optional small label rendered above the caption */
  subtitle?: string;
  /** Animation flavor for the inner figure */
  motion: "breathe" | "sway" | "pulse" | "rise";
  /** Optional video to play full-screen instead of the static image */
  video?: string;
  /** When true, the video loops and only the duration timer ends the interlude */
  loop?: boolean;
}

export const SCENE_MAP: Record<InterludeScene, SceneConfig> = {
  "spheres-to-assess": {
    src: "/assets/eva/wheel-01-spheres-map.svg",
    alt: "Ева раскручивает колесо сфер",
    caption: "Посмотрим внимательнее…",
    motion: "sway",
  },
  "assess-to-path": {
    src: "/assets/eva/path-02-eva-points-way.svg",
    alt: "Ева показывает путь",
    caption: "Вот куда сегодня пойдём",
    motion: "rise",
    video: "/assets/eva/assess-to-path.mp4",
  },
  "feeling-to-current": {
    src: "/assets/eva/step-07-current-state.png",
    alt: "Ева на каменной площадке у светящейся арки",
    caption: "Расскажи, как сейчас",
    motion: "breathe",
  },
  "shape-to-emdr": {
    src: "/assets/eva/video/step-10-emdr-butterfly-pose-loop.mp4",
    alt: "Ева в позе бабочки — мягкая билатеральная поддержка",
    caption: "Сейчас будет мягко.",
    motion: "pulse",
    video: "/assets/eva/video/step-10-emdr-butterfly-pose-loop.mp4",
    loop: true,
  },
  "reassess-to-success": {
    src: "/assets/eva/reward-eva-joy.svg",
    alt: "Ева радуется, мир светлеет",
    caption: "Свет вернулся в мир",
    motion: "rise",
  },
  "success-to-summary": {
    src: "/assets/eva/final-report-path-map.svg",
    alt: "Ева сворачивает карту",
    caption: "Собираем твой путь",
    motion: "sway",
    video: "/assets/eva/success-to-summary.mp4",
  },
};

interface InterludeState {
  active: InterludeScene | null;
  resolver: (() => void) | null;
  play: (scene: InterludeScene, duration?: number) => Promise<void>;
  finish: () => void;
}

export const useInterlude = create<InterludeState>((set, get) => ({
  active: null,
  resolver: null,
  play: (scene, duration = 1500) =>
    new Promise<void>((resolve) => {
      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        resolve();
        return;
      }
      set({ active: scene, resolver: resolve });
      if (duration > 0 && Number.isFinite(duration)) {
        setTimeout(() => {
          const cur = get();
          if (cur.active === scene) {
            cur.finish();
          }
        }, duration);
      }
    }),
  finish: () => {
    const r = get().resolver;
    set({ active: null, resolver: null });
    r?.();
  },
}));
