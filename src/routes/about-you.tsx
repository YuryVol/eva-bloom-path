import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AmbientBackground } from "@/components/eva/AmbientBackground";
import { GlowButton } from "@/components/eva/GlowButton";
import { useOnboardingDraft } from "@/lib/onboarding-store";

export const Route = createFileRoute("/about-you")({
  component: AboutYouScreen,
  head: () => ({ meta: [{ title: "Давай познакомимся — ЕВА" }] }),
});

const ROLE_OPTIONS = [
  "Работаю",
  "Учусь",
  "В декрете",
  "Забочусь о семье",
  "Ищу себя",
  "Сейчас отдыхаю / восстанавливаюсь",
] as const;

const AGE_OPTIONS = (() => {
  const arr: (number | "65+")[] = [];
  for (let a = 18; a <= 65; a++) arr.push(a);
  return arr;
})();

function AboutYouScreen() {
  const navigate = useNavigate();
  const { user_name, user_age, user_roles, address_form, set } = useOnboardingDraft();
  const formal = address_form === "вы";

  const toggleRole = (r: string) => {
    if (user_roles.includes(r)) {
      set({ user_roles: user_roles.filter((x) => x !== r) });
    } else {
      set({ user_roles: [...user_roles, r] });
    }
  };

  const handleNext = () => {
    if (!user_name.trim()) return;
    navigate({ to: "/auth-invite" });
  };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#F9F4EE]">
      <AmbientBackground theme="safe" />
      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-5xl items-center px-6 py-8 md:px-12">
        {/* Desktop 2-column: left = portrait, right = form */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="flex w-full flex-col items-center gap-6 md:grid md:grid-cols-2 md:items-center md:gap-16"
        >
        {/* LEFT — Eva + title */}
        <div className="flex flex-col items-center text-center">
        <EvaPortrait />

        <h1 className="mt-2 font-display text-2xl text-glow md:text-3xl">
          Я — Ева. Давай познакомимся
        </h1>
        <p className="mt-1 text-xs text-muted-foreground md:mt-2 md:text-sm">
          Несколько мягких вопросов, чтобы я обращалась {formal ? "к вам" : "к тебе"} по-настоящему.
        </p>
        </div>

        {/* RIGHT — form */}
        <div className="w-full">

        {/* Address form toggle */}
        <div className="mt-3 flex w-full items-center gap-1.5 rounded-full border border-border/60 bg-card/40 p-1">
          {(["ты", "вы"] as const).map((form) => (
            <button
              key={form}
              type="button"
              onClick={() => set({ address_form: form })}
              className={`flex-1 rounded-full py-2 text-sm font-bold tracking-wide transition-all duration-200 ${
                address_form === form
                  ? "bg-primary/15 text-foreground shadow-sm border border-primary/40"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              На «<span className="font-black">{form.toUpperCase()}</span>»
            </button>
          ))}
        </div>

        <div className="mt-3 w-full space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Как {formal ? "к вам" : "к тебе"} обращаться?
            </label>
            <input
              type="text"
              value={user_name}
              onChange={(e) => set({ user_name: e.target.value })}
              placeholder="Введите имя"
              maxLength={80}
              className="mt-1.5 w-full rounded-full border border-border bg-background/60 px-5 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Сколько {formal ? "вам" : "тебе"} лет?
            </label>
            <select
              value={user_age ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                set({ user_age: v === "65+" ? 65 : v === "" ? null : Number(v) });
              }}
              className="mt-1.5 w-full rounded-full border border-border bg-background/60 px-5 py-2.5 text-sm focus:border-primary/60 focus:outline-none"
            >
              <option value="">—</option>
              {AGE_OPTIONS.map((a) => (
                <option key={String(a)} value={String(a)}>
                  {a}
                </option>
              ))}
              <option value="65+">65+</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Чем {formal ? "занимаетесь" : "занимаешься"}?
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((r) => {
                const active = user_roles.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleRole(r)}
                    aria-pressed={active}
                    className={`rounded-2xl border px-3 py-2.5 text-left text-xs leading-snug transition-all duration-300 ${
                      active
                        ? "border-primary/70 bg-primary/15 text-foreground shadow-[0_6px_20px_-6px_oklch(0.74_0.13_70/0.5)]"
                        : "border-border bg-card/40 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center md:justify-start">
          <GlowButton onClick={handleNext} disabled={!user_name.trim()} size="md">
            Продолжить
          </GlowButton>
        </div>
        </div>{/* end right */}
        </motion.div>
      </div>
    </main>
  );
}

function EvaPortrait() {
  const orbitDots = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div className="relative mt-1 flex size-40 items-center justify-center md:size-48">
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
        animate={{
          opacity: [0.55, 0.95, 0.55],
          scale: [1, 1.06, 1],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "conic-gradient(from 0deg, rgba(255,243,180,0.0) 0deg, rgba(255,243,180,0.45) 10deg, rgba(255,243,180,0) 20deg, rgba(255,243,180,0) 40deg, rgba(255,243,180,0.4) 50deg, rgba(255,243,180,0) 60deg, rgba(255,243,180,0) 80deg, rgba(255,243,180,0.45) 90deg, rgba(255,243,180,0) 100deg, rgba(255,243,180,0) 120deg, rgba(255,243,180,0.4) 130deg, rgba(255,243,180,0) 140deg, rgba(255,243,180,0) 160deg, rgba(255,243,180,0.45) 170deg, rgba(255,243,180,0) 180deg, rgba(255,243,180,0) 200deg, rgba(255,243,180,0.4) 210deg, rgba(255,243,180,0) 220deg, rgba(255,243,180,0) 240deg, rgba(255,243,180,0.45) 250deg, rgba(255,243,180,0) 260deg, rgba(255,243,180,0) 280deg, rgba(255,243,180,0.4) 290deg, rgba(255,243,180,0) 300deg, rgba(255,243,180,0) 320deg, rgba(255,243,180,0.45) 330deg, rgba(255,243,180,0) 340deg, rgba(255,243,180,0) 360deg)",
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

      {/* Orbit sparkles around frame */}
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

      {/* Portrait frame — warm brown shadow */}
      <div
        className="relative size-36 overflow-hidden rounded-full border-2 border-[#FFF8D6]/80 bg-[#F9F4EE] md:size-44"
        style={{
          boxShadow:
            "0 14px 32px -8px rgba(110,70,40,0.35), 0 6px 14px -4px rgba(110,70,40,0.28)",
        }}
      >
        <img
          src="/assets/eva/eva-portrait.png"
          alt="Ева"
          className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 object-contain"
        />
      </div>
    </div>
  );
}

