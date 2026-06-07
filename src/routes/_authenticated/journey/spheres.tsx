import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { useJourneyStore } from "@/lib/journey-store";
import { updateJourney } from "@/lib/journey.functions";
import { SPHERES, type SphereId } from "@/lib/journey-types";

export const Route = createFileRoute("/_authenticated/journey/spheres")({
  component: SpheresScreen,
});

const SPHERE_ICON: Record<SphereId, string> = {
  family: "/assets/eva/spheres/family.png",
  relationships: "/assets/eva/spheres/relationships.png",
  career: "/assets/eva/spheres/career.png",
  growth: "/assets/eva/spheres/growth.png",
  finance: "/assets/eva/spheres/finance.png",
  rest: "/assets/eva/spheres/rest.png",
  people: "/assets/eva/spheres/people.png",
  health: "/assets/eva/spheres/health.png",
};

const EVA_CENTER = "/assets/eva/spheres/eva-center.png";

const ORDER: SphereId[] = [
  "family",
  "relationships",
  "career",
  "growth",
  "finance",
  "rest",
  "people",
  "health",
];

// Fixed absolute positions inside the square .spheres-map container.
// Coordinates are in percent of the container; transform: translate(-50%, -50%)
// centers each sphere on its anchor point.
const SPHERE_POS: Record<SphereId, { left: string; top: string }> = {
  family: { left: "50%", top: "13%" },
  relationships: { left: "75%", top: "30%" },
  career: { left: "77%", top: "51%" },
  growth: { left: "67%", top: "72%" },
  finance: { left: "50%", top: "84%" },
  rest: { left: "31%", top: "72%" },
  health: { left: "23%", top: "51%" },
  people: { left: "25%", top: "30%" },
};

function SpheresScreen() {
  const { state, patch, journeyId, setStep } = useJourneyStore();
  const navigate = useNavigate();
  const save = useServerFn(updateJourney);
  const selected = state.selected_spheres;
  const maxed = selected.length >= 3;


  // ---------- Intro video overlay state ----------
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  }, []);

  const [showIntro, setShowIntro] = useState(false);
  const [videoOpacity, setVideoOpacity] = useState(1);
  const [sceneVisible, setSceneVisible] = useState(true);
  const [assetsReady, setAssetsReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Decide on mount whether to play the intro.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const flag = sessionStorage.getItem("eva:spheres-intro");
    if (flag === "1" && !prefersReducedMotion) {
      sessionStorage.removeItem("eva:spheres-intro");
      setShowIntro(true);
      setSceneVisible(false); // hidden under the video, but mounted
    } else {
      sessionStorage.removeItem("eva:spheres-intro");
    }
  }, [prefersReducedMotion]);

  // Preload all sphere images before allowing the crossfade.
  useEffect(() => {
    let cancelled = false;
    const urls = [EVA_CENTER, ...ORDER.map((id) => SPHERE_ICON[id])];
    let loaded = 0;
    const done = () => {
      if (cancelled) return;
      loaded += 1;
      if (loaded >= urls.length) setAssetsReady(true);
    };
    urls.forEach((u) => {
      const img = new Image();
      img.onload = done;
      img.onerror = done;
      img.src = u;
    });
    // Safety: never block more than 2.5s
    const t = setTimeout(() => !cancelled && setAssetsReady(true), 2500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  const startCrossfade = () => {
    // Reveal scene first (fade in), then fade out the video on top.
    setSceneVisible(true);
    requestAnimationFrame(() => {
      setVideoOpacity(0);
    });
    window.setTimeout(() => setShowIntro(false), 900);
  };

  const handleVideoEnded = () => {
    if (assetsReady) startCrossfade();
    else {
      // Wait for assets, but cap the wait.
      const start = Date.now();
      const tick = () => {
        if (assetsReady || Date.now() - start > 1500) startCrossfade();
        else window.setTimeout(tick, 80);
      };
      tick();
    }
  };

  const skipIntro = () => {
    setSceneVisible(true);
    setVideoOpacity(0);
    window.setTimeout(() => setShowIntro(false), 600);
  };

  const toggle = (id: SphereId) => {
    if (selected.includes(id)) {
      patch({ selected_spheres: selected.filter((s) => s !== id) });
    } else if (!maxed) {
      patch({ selected_spheres: [...selected, id] });
    }
  };

  const handleNext = async () => {
    if (selected.length !== 3) return;
    if (!journeyId) {
      toast.error("Путешествие ещё загружается, подожди секунду");
      return;
    }
    try {
      setStep("assess");
      await save({ data: { id: journeyId, state: state as never, current_step: "assess" } });
      navigate({ to: "/journey/assess" as never });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось сохранить выбор");
    }
  };

  return (
    <div className="relative h-full w-full">
      {/* Spheres scene — always mounted, opacity-controlled */}
      <div
        className="absolute inset-0"
        style={{
          opacity: sceneVisible ? 1 : 0,
          transform: sceneVisible ? "scale(1)" : "scale(0.96)",
          transition: prefersReducedMotion
            ? "none"
            : "opacity 800ms ease-out, transform 800ms ease-out",
          willChange: "opacity, transform",
        }}
      >
        <div
          className="relative flex h-full w-full flex-col overflow-y-auto"
          style={{ background: "#F5EDDF" }}
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={{ background: "#F5EDDF" }} />
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${(i * 37) % 100}%`,
                  top: `${(i * 53) % 100}%`,
                  width: 4 + (i % 3),
                  height: 4 + (i % 3),
                  background: "rgba(255, 230, 170, 0.45)",
                  boxShadow: "0 0 8px rgba(255,220,140,0.4)",
                  animation: `evaFloat ${8 + (i % 5)}s ease-in-out ${i * 0.4}s infinite`,
                  opacity: 0.6,
                }}
              />
            ))}
          </div>

          {/* Header */}
          <div className="relative z-10 shrink-0 px-4 pt-2 pb-1 text-center">
            <h1
              className="text-2xl md:text-3xl"
              style={{
                fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
                color: "#5F4B3E",
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
            >
              Что важно сейчас?
            </h1>
            <p
              className="mx-auto mt-1 max-w-xs text-[13px] leading-relaxed"
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                color: "#7A6553",
                fontStyle: "italic",
              }}
            >
              Выбери три сферы жизни, к которым хочешь прикоснуться сегодня.
            </p>
          </div>

          {/* Spheres stage */}
          <div
            className="spheres-stage relative shrink-0"
            style={{
              width: "min(720px, 92vw)",
              height: "clamp(560px, 68vh, 720px)",
              margin: "32px auto 24px",
              overflow: "visible",
            }}
          >
            {/* EVA */}
            <img
              src={EVA_CENTER}
              alt="Ева"
              draggable={false}
              className="select-none"
              style={{
                position: "absolute",
                left: "50%",
                top: "48%",
                transform: "translate(-50%, -50%)",
                width: "clamp(80px, 10.7vw, 113px)",
                height: "auto",
                zIndex: 5,
                pointerEvents: "none",
                filter: "drop-shadow(0 12px 18px rgba(110,70,40,0.28))",
              }}
            />

            {/* Sphere nodes */}
            {ORDER.map((id) => {
              const sphere = SPHERES.find((s) => s.id === id)!;
              const pos = SPHERE_POS[id];
              const isSel = selected.includes(id);
              const isInactive = maxed && !isSel;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  aria-pressed={isSel}
                  aria-label={sphere.label}
                  disabled={isInactive}
                  className="sphere-node focus:outline-none"
                  style={{
                    position: "absolute",
                    left: pos.left,
                    top: pos.top,
                    transform: "translate(-50%, -50%)",
                    width: "clamp(79px, 8.7vw, 100px)",
                    height: "clamp(85px, 9.3vw, 110px)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 6,
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    zIndex: 2,
                    transition: "opacity 0.4s ease",
                    opacity: isSel ? 1 : 0.45,
                    cursor: isInactive ? "not-allowed" : "pointer",
                  }}
                >
                  <div className="relative" style={{ width: "100%", aspectRatio: "1 / 1" }}>
                    {isSel && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{
                          width: "140%",
                          height: "140%",
                          background:
                            "radial-gradient(circle, rgba(255,220,140,0.7) 0%, rgba(212,168,67,0.25) 45%, rgba(212,168,67,0) 75%)",
                          filter: "blur(3px)",
                        }}
                      />
                    )}
                    <img
                      src={SPHERE_ICON[id]}
                      alt={sphere.label}
                      draggable={false}
                      className="relative block select-none"
                      style={{
                        width: "100%",
                        height: "auto",
                        aspectRatio: "1 / 1",
                        objectFit: "contain",
                        filter: isSel
                          ? "drop-shadow(0 8px 14px rgba(180,120,40,0.45)) drop-shadow(0 0 10px rgba(255,210,120,0.55))"
                          : "drop-shadow(0 6px 10px rgba(110,70,40,0.25))",
                      }}
                    />
                  </div>
                  <span
                    className="sphere-label"
                    style={{
                      fontSize: "clamp(12px, 1.1vw, 16px)",
                      lineHeight: 1.1,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      color: "#7a6655",
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      fontWeight: isSel ? 600 : 500,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {sphere.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer — sticky внизу, всегда видна */}
          <div className="sticky bottom-0 z-20 shrink-0 px-4 pb-4 pt-3 text-center"
            style={{ background: "linear-gradient(to top, #F5EDDF 70%, transparent)" }}
          >
            <p
              className="mb-2 text-[11px] uppercase tracking-[0.3em]"
              style={{ color: "#9B8470", fontFamily: '"Cormorant Garamond", serif' }}
            >
              Выбрано {selected.length} / 3
            </p>
            <button
              type="button"
              onClick={handleNext}
              disabled={selected.length !== 3}
              className="inline-flex items-center justify-center rounded-full px-10 py-3 text-sm transition-all duration-300 disabled:cursor-not-allowed"
              style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                letterSpacing: "0.08em",
                background:
                  selected.length === 3
                    ? "linear-gradient(135deg, #E2B85A 0%, #D4A843 60%, #B8862A 100%)"
                    : "#E8DDCB",
                color: selected.length === 3 ? "#3E2E1F" : "#A89682",
                boxShadow:
                  selected.length === 3
                    ? "0 8px 22px rgba(212,168,67,0.45), 0 0 24px rgba(255,220,140,0.55)"
                    : "none",
                opacity: selected.length === 3 ? 1 : 0.6,
              }}
            >
              Продолжить
            </button>
          </div>


          <style>{`
            @keyframes evaBreath {
              0%, 100% { transform: translate(-50%, -50%) scale(1); }
              50% { transform: translate(-50%, -50%) scale(1.03); }
            }
            @keyframes evaFloat {
              0%, 100% { transform: translateY(0) translateX(0); opacity: 0.5; }
              50% { transform: translateY(-14px) translateX(6px); opacity: 0.9; }
            }
          `}</style>
        </div>
      </div>

      {/* Intro video overlay */}
      {showIntro && (
        <div
          className="absolute inset-0 z-20 bg-[#F5EDDF]"
          style={{
            opacity: videoOpacity,
            transition: "opacity 800ms ease-out",
            pointerEvents: videoOpacity === 0 ? "none" : "auto",
          }}
        >
          <video
            ref={videoRef}
            src="/assets/eva/to-spheres.mp4"
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={skipIntro}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/15 px-4 py-1.5 text-xs text-white backdrop-blur-md transition hover:bg-white/25"
          >
            Пропустить
          </button>
        </div>
      )}
    </div>
  );
}
