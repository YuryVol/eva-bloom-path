import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/to-spheres")({
  component: ToSpheresScreen,
  head: () => ({ meta: [{ title: "ЕВА" }] }),
});

function ToSpheresScreen() {
  const navigate = useNavigate();
  const go = () => navigate({ to: "/journey/spheres" });

  return (
    <main className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#F9F4EE]">
      <video
        src="/assets/eva/to-spheres.mp4"
        autoPlay
        muted
        playsInline
        onEnded={go}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={go}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/15 px-4 py-1.5 text-xs text-white backdrop-blur-md transition hover:bg-white/25"
      >
        Пропустить
      </button>
    </main>
  );
}
