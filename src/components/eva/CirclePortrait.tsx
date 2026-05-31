import { motion } from "framer-motion";

export type GoalVisual = {
  src: string;
  objectPosition: string;
  scale: number;
};

export function CirclePortrait({
  current,
  all,
  variant = "circle",
}: {
  current: GoalVisual;
  all: GoalVisual[];
  variant?: "circle" | "card";
}) {
  if (variant === "card") {
    return <SceneCard current={current} all={all} />;
  }
  const orbitDots = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div className="relative mt-1 flex size-56 items-center justify-center md:size-64">

      {/* Sun halo radiating into background */}
      <div
        aria-hidden
        className="absolute -inset-12 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,236,170,0.7) 0%, rgba(255,224,150,0.45) 28%, rgba(255,214,140,0.22) 50%, rgba(255,214,140,0) 75%)",
        }}
      />
      {/* Pulsing sun rays */}
      <motion.div
        aria-hidden
        className="absolute -inset-8 rounded-full"
        animate={{ opacity: [0.55, 0.95, 0.55], scale: [1, 1.06, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "conic-gradient(from 0deg, rgba(255,243,180,0) 0deg, rgba(255,243,180,0.45) 10deg, rgba(255,243,180,0) 20deg, rgba(255,243,180,0) 40deg, rgba(255,243,180,0.4) 50deg, rgba(255,243,180,0) 60deg, rgba(255,243,180,0) 80deg, rgba(255,243,180,0.45) 90deg, rgba(255,243,180,0) 100deg, rgba(255,243,180,0) 120deg, rgba(255,243,180,0.4) 130deg, rgba(255,243,180,0) 140deg, rgba(255,243,180,0) 160deg, rgba(255,243,180,0.45) 170deg, rgba(255,243,180,0) 180deg, rgba(255,243,180,0) 200deg, rgba(255,243,180,0.4) 210deg, rgba(255,243,180,0) 220deg, rgba(255,243,180,0) 240deg, rgba(255,243,180,0.45) 250deg, rgba(255,243,180,0) 260deg, rgba(255,243,180,0) 280deg, rgba(255,243,180,0.4) 290deg, rgba(255,243,180,0) 300deg, rgba(255,243,180,0) 320deg, rgba(255,243,180,0.45) 330deg, rgba(255,243,180,0) 340deg, rgba(255,243,180,0) 360deg)",
          filter: "blur(6px)",
        }}
      />
      {/* Outer pulsing golden glow tight around circle */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            "0 0 22px 6px rgba(255,236,170,0.55), 0 0 50px 14px rgba(255,224,150,0.35)",
            "0 0 38px 14px rgba(255,248,214,0.9), 0 0 90px 30px rgba(255,224,150,0.55)",
            "0 0 22px 6px rgba(255,236,170,0.55), 0 0 50px 14px rgba(255,224,150,0.35)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Orbit sparkles */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {orbitDots.map((i) => {
          const angle = (i / orbitDots.length) * Math.PI * 2;
          const radius = 52;
          const left = 50 + Math.cos(angle) * radius;
          const top = 50 + Math.sin(angle) * radius;
          const delay = (i % 7) * 0.25;
          const duration = 2 + (i % 4) * 0.4;
          const size = 3 + (i % 3);
          return (
            <motion.span
              key={i}
              className="absolute rounded-full bg-[#FFF8D6]"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
                boxShadow: "0 0 10px 3px rgba(255,243,180,0.9)",
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
              transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
            />
          );
        })}
      </div>
      {/* Portrait frame — circular with warm shadow, holds crossfading images */}
      <div
        className="relative size-52 overflow-hidden rounded-full border-2 border-[#FFF8D6]/80 bg-[#F9F4EE] md:size-60"
        style={{
          boxShadow:
            "0 14px 32px -8px rgba(110,70,40,0.35), 0 6px 14px -4px rgba(110,70,40,0.28)",
        }}
      >
        {all.map((v) => {
          const isActive = v.src === current.src;
          return (
            <img
              key={v.src}
              src={v.src}
              alt="Ева рядом"
              draggable={false}
              className="absolute inset-0 h-full w-full select-none"
              style={{
                objectFit: "cover",
                objectPosition: v.objectPosition,
                transform: `scale(${isActive ? v.scale : v.scale * 0.985})`,
                opacity: isActive ? 1 : 0,
                filter: isActive ? "blur(0)" : "blur(4px)",
                transition:
                  "opacity 460ms ease, transform 460ms ease, filter 460ms ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function SceneCard({
  current,
  all,
}: {
  current: GoalVisual;
  all: GoalVisual[];
}) {
  const maskImage =
    "radial-gradient(circle at center, black 72%, transparent 100%)";
  return (
    <div
      className="relative mx-auto mb-4 aspect-[4/5] w-[min(220px,50vw)] shrink-0 overflow-hidden max-lg:w-[min(200px,46vw)] max-md:mb-3 max-md:w-[min(170px,42vw)]"
      style={{
        borderRadius: 9999,
        background: "linear-gradient(180deg, #efe5d6 0%, #e8ddcd 100%)",
        boxShadow:
          "0 0 40px rgba(212, 173, 86, 0.16), 0 18px 38px rgba(109, 89, 65, 0.10)",
      }}
    >
      {all.map((v) => {
        const isActive = v.src === current.src;
        return (
          <img
            key={v.src}
            src={v.src}
            alt="Ева рядом"
            draggable={false}
            className="absolute inset-0 block h-full w-full select-none"
            style={{
              objectFit: "cover",
              objectPosition: v.objectPosition ?? "center 42%",
              transform: `scale(${isActive ? 1 : 0.99})`,
              opacity: isActive ? 1 : 0,
              transition: "opacity 300ms ease, transform 300ms ease",
              WebkitMaskImage: maskImage,
              maskImage,
            }}
          />
        );
      })}
    </div>
  );
}
