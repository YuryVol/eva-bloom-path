import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getAppConfig } from "@/lib/app-config";

type Feature = "journey_limit" | "practice" | "diary" | "guardian" | "world";

const FEATURE_CONTENT: Record<Feature, { title: string; description: string; perks: string[] }> = {
  journey_limit: {
    title: "Больше путешествий",
    description: "Бесплатно — одно путешествие в сутки на каждую сферу.",
    perks: [
      "Неограниченные путешествия в выбранных сферах",
      "Доступ ко всем практикам без монет",
      "XP и монеты ×1.5",
    ],
  },
  practice: {
    title: "Все практики доступны",
    description: "Релаксация и Гармонизация — только в EVA+.",
    perks: [
      "Все три типа практик без ограничений",
      "Неограниченные путешествия",
      "Живой дневник Евы",
    ],
  },
  diary: {
    title: "Живой дневник Евы",
    description: "Ева записывает твой путь после каждого путешествия.",
    perks: [
      "Запись после каждого путешествия",
      "Milestone-записи с золотой рамкой",
      "Возможность поделиться",
    ],
  },
  guardian: {
    title: "Хранитель сферы",
    description: "Создай уникального хранителя для каждой из 8 сфер.",
    perks: [
      "Конструктор: силуэт + цвет + имя",
      "Хранитель сопровождает тебя в пути",
      "8 уникальных хранителей",
    ],
  },
  world: {
    title: "30 состояний Мира Евы",
    description: "Твой мир меняется вместе с твоим ростом.",
    perks: [
      "30 уникальных состояний мира",
      "Мир растёт с каждым днём активности",
      "История изменений мира",
    ],
  },
};

interface PremiumGateSheetProps {
  open: boolean;
  feature: Feature;
  onClose: () => void;
}

export function PremiumGateSheet({ open, feature, onClose }: PremiumGateSheetProps) {
  const navigate = useNavigate();
  const content = FEATURE_CONTENT[feature];
  const fetchAppConfig = useServerFn(getAppConfig);
  const [isPremiumApp, setIsPremiumApp] = useState(false);

  useEffect(() => {
    fetchAppConfig().then((cfg) => setIsPremiumApp(cfg.isPremiumApp)).catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTry = () => {
    onClose();
    navigate({ to: "/premium/paywall" as never });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-sm rounded-t-3xl border border-amber-400/20 bg-[#FDF8F0] px-6 pb-10 pt-6 shadow-2xl"
          >
            {/* Handle */}
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border/50" />

            <div className="text-center mb-5">
              <span className="text-4xl">✨</span>
              <h2 className="mt-2 font-display text-xl font-semibold text-foreground">{content.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{content.description}</p>
            </div>

            <ul className="space-y-2 mb-6">
              {content.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2 text-sm text-foreground/80">
                  <span className="mt-0.5 shrink-0 text-amber-500">✓</span>
                  {perk}
                </li>
              ))}
            </ul>

            {isPremiumApp && (
              <button
                type="button"
                onClick={handleTry}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-400/30 transition hover:from-amber-500 hover:to-amber-600"
              >
                Оформить EVA+
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full rounded-2xl py-2.5 text-sm text-muted-foreground transition hover:text-foreground"
            >
              Позже
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
