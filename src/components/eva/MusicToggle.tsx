import { Volume2, VolumeX } from "lucide-react";
import { useAudioStore } from "@/lib/audio-store";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function MusicToggle({ className }: Props) {
  const muted = useAudioStore((s) => s.muted);
  const autoplayBlocked = useAudioStore((s) => s.autoplayBlocked);
  const toggle = useAudioStore((s) => s.toggle);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? "Включить звук" : "Выключить звук"}
      title={muted ? "Включить звук" : "Выключить звук"}
      className={cn(
        "fixed right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/90 backdrop-blur-md transition hover:bg-black/50",
        autoplayBlocked && "animate-pulse ring-2 ring-white/60",
        className,
      )}
    >
      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </button>
  );
}
