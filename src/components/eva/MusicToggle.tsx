import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useAudioStore } from "@/lib/audio-store";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

const TOOLTIP_KEY = "eva_music_tooltip_shown";

export function MusicToggle({ className }: Props) {
  const muted = useAudioStore((s) => s.muted);
  const autoplayBlocked = useAudioStore((s) => s.autoplayBlocked);
  const toggle = useAudioStore((s) => s.toggle);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (muted) return;
    try {
      if (localStorage.getItem(TOOLTIP_KEY)) return;
      localStorage.setItem(TOOLTIP_KEY, "1");
      setShowTooltip(true);
      const t = setTimeout(() => setShowTooltip(false), 4000);
      return () => clearTimeout(t);
    } catch {}
  }, [muted]);

  const handleClick = () => {
    setShowTooltip(false);
    toggle();
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={muted ? "Включить звук" : "Выключить звук"}
        title={muted ? "Включить звук" : "Выключить звук"}
        className={cn(
          "fixed bottom-4 left-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/90 backdrop-blur-md transition hover:bg-black/60",
          autoplayBlocked && "animate-pulse ring-2 ring-white/60",
          className,
        )}
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
      {showTooltip && (
        <div className="fixed bottom-5 left-14 z-50 animate-fade-in rounded-xl bg-foreground/80 px-3 py-1.5 text-xs text-background shadow-lg">
          Нажмите, чтобы выключить звук
        </div>
      )}
    </>
  );
}
