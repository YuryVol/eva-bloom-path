import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export interface WorldState {
  id: number;
  name: string;
  description: string;
  asset_key: string;
  required_days: number;
}

// Fallback images — mapped to existing free assets where possible
function getWorldImage(assetKey: string): string {
  const MAP: Record<string, string> = {
    sprout: "/assets/eva/world-healthy.png",
    dawn: "/assets/eva/world-healthy.png",
    awakening: "/assets/eva/world-healthy.png",
    "first-light": "/assets/eva/world-healthy.png",
    "quiet-morning": "/assets/eva/world-healthy.png",
    "green-shoot": "/assets/eva/world-healthy.png",
    "first-flower": "/assets/eva/world-healthy.png",
    "light-wind": "/assets/eva/world-healthy.png",
    "warm-day": "/assets/eva/world-healthy.png",
    "living-path": "/assets/eva/world-healthy.png",
    garden: "/assets/eva/world-healthy.png",
    "forest-voices": "/assets/eva/world-healthy.png",
    "summer-noon": "/assets/eva/world-healthy.png",
    waterfall: "/assets/eva/world-healthy.png",
    rainbow: "/assets/eva/world-healthy.png",
    "golden-hour": "/assets/eva/world-healthy.png",
    ripening: "/assets/eva/world-wilting.png",
    "full-moon": "/assets/eva/world-dormant.png",
    "starry-sky": "/assets/eva/world-dormant.png",
    "autumn-light": "/assets/eva/world-wilting.png",
    harvest: "/assets/eva/world-wilting.png",
    "quiet-rain": "/assets/eva/world-dormant.png",
    "golden-forest": "/assets/eva/world-wilting.png",
    "first-snow": "/assets/eva/world-winter.png",
    "winter-rest": "/assets/eva/world-winter.png",
    aurora: "/assets/eva/world-winter.png",
    "deep-silence": "/assets/eva/world-winter.png",
    "crystal-ice": "/assets/eva/world-winter.png",
    "pre-spring": "/assets/eva/world-healthy.png",
    "eternal-garden": "/assets/eva/world-healthy.png",
  };
  return MAP[assetKey] ?? "/assets/eva/world-healthy.png";
}

interface EvaWorldPremiumProps {
  currentState: WorldState;
  activeDays: number;
  nextState?: WorldState | null;
  unlockedStates?: WorldState[];
}

export function EvaWorldPremium({ currentState, activeDays, nextState, unlockedStates = [] }: EvaWorldPremiumProps) {
  const [showHistory, setShowHistory] = useState(false);
  const daysToNext = nextState ? nextState.required_days - activeDays : null;

  return (
    <div className="relative h-full flex flex-col">
      {/* Main world visual */}
      <motion.div
        key={currentState.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex-1 min-h-0 w-full overflow-hidden rounded-3xl border border-amber-200/30"
        style={{ boxShadow: "0 0 40px 6px rgba(251,191,36,0.15)" }}
      >
        <img
          src={getWorldImage(currentState.asset_key)}
          alt={currentState.name}
          className="h-full w-full object-cover"
        />
        {/* State name overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-4 pb-3 pt-6">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-[0.3em] text-white/60">✨ Premium</span>
              <p className="font-display text-base font-medium text-white leading-tight">{currentState.name}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] text-white/80 backdrop-blur-sm transition hover:bg-white/25"
            >
              История
            </button>
          </div>
        </div>
      </motion.div>

      {/* Progress to next state */}
      {nextState && daysToNext !== null && (
        <div className="mt-2 rounded-xl bg-amber-50/60 border border-amber-200/40 px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-amber-700/70">До «{nextState.name}»</span>
            <span className="text-[10px] font-medium text-amber-700">{daysToNext} дн.</span>
          </div>
          <div className="h-1 rounded-full bg-amber-200/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-400/70 transition-all duration-700"
              style={{ width: `${Math.min(100, (activeDays / nextState.required_days) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* History sheet */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowHistory(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-sm rounded-t-3xl bg-[#FDF8F0] border border-amber-200/30 px-5 pb-8 pt-5 shadow-2xl max-h-[70vh] overflow-y-auto"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border/40" />
              <p className="font-display text-base font-semibold mb-3">История мира</p>
              <div className="space-y-2">
                {unlockedStates.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center gap-3 rounded-xl p-3 ${s.id === currentState.id ? "bg-amber-50 border border-amber-200/50" : "bg-muted/20"}`}
                  >
                    <img src={getWorldImage(s.asset_key)} alt={s.name} className="size-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                    </div>
                    {s.id === currentState.id && (
                      <span className="ml-auto text-xs text-amber-600 font-medium">Сейчас</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Modal shown when world state changes
export function WorldStateChangedModal({
  newState,
  onClose,
}: {
  newState: WorldState;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-xs rounded-3xl bg-[#FDF8F0] border border-amber-200/40 p-6 text-center shadow-2xl"
      >
        <div className="text-4xl mb-3">🌟</div>
        <p className="text-xs uppercase tracking-[0.3em] text-amber-600 mb-1">Твой мир изменился</p>
        <h2 className="font-display text-xl font-semibold mb-2">{newState.name}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{newState.description}</p>
        <img
          src={getWorldImage(newState.asset_key)}
          alt={newState.name}
          className="w-full rounded-2xl object-cover mb-5"
          style={{ height: 140 }}
        />
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-sm font-semibold text-white"
        >
          Отлично!
        </button>
      </motion.div>
    </motion.div>
  );
}
