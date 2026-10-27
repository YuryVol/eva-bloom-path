import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { getAppConfig } from "@/lib/app-config";
import { checkPremiumStatus } from "@/lib/premium.functions";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { BookOpen, Share2, Pencil, Check, X, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { FadeTransition } from "@/components/eva/FadeTransition";
import { getDiaryEntries, updateDiaryEntry } from "@/lib/diary.functions";
import type { DiaryEntry } from "@/lib/diary.functions";
import { SPHERES } from "@/lib/journey-types";

export const Route = createFileRoute("/_authenticated/diary")({
  component: DiaryScreen,
});

const SPHERE_EMOJI: Record<string, string> = {
  health: "💚",
  rest: "🌙",
  relationships: "💞",
  family: "🏡",
  people: "🤝",
  growth: "🌱",
  finance: "💎",
  career: "🌟",
};

type ViewMode = "day" | "week" | "month";

const WEEKDAYS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDayFull(d: Date): string {
  return d.toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

function getMonday(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function getMonthGrid(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (Date | null)[][] = [];
  let week: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) week.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

const SWIPE_THRESHOLD = 50;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

function DiaryEntryCard({
  entry,
  onEdit,
  onShare,
  editingId,
  editText,
  setEditText,
  saving,
  onCommitEdit,
  onCancelEdit,
  shareId,
}: {
  entry: DiaryEntry;
  onEdit: (e: DiaryEntry) => void;
  onShare: (e: DiaryEntry) => void;
  editingId: string | null;
  editText: string;
  setEditText: (t: string) => void;
  saving: boolean;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  shareId: string | null;
}) {
  const sphereLabel = SPHERES.find((s) => s.id === entry.sphere_id)?.label ?? entry.sphere_id;
  const emoji = SPHERE_EMOJI[entry.sphere_id] ?? "📖";
  const isEditing = editingId === entry.id;
  const delta =
    entry.resistance_before !== null && entry.resistance_after !== null
      ? entry.resistance_before - entry.resistance_after
      : null;

  return (
    <div className="rounded-2xl border border-border/30 bg-card/60 p-4 backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{emoji}</span>
          <span className="text-sm font-medium text-foreground">{sphereLabel}</span>
          <span className="text-[11px] text-muted-foreground">· {formatTime(entry.created_at)}</span>
        </div>
        {delta !== null && (
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-muted-foreground">
              {entry.resistance_before} → {entry.resistance_after}
            </span>
            {delta > 0 && <span className="text-emerald-600">−{delta}</span>}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2">
          <textarea
            className="w-full resize-none rounded-xl border border-border/40 bg-background/60 px-3 py-2 text-sm leading-relaxed text-foreground outline-none focus:border-primary/50"
            rows={5}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCommitEdit}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-primary/90 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-primary"
            >
              <Check className="size-3" />
              {saving ? "…" : "Сохранить"}
            </button>
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex items-center gap-1.5 rounded-xl bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
            >
              <X className="size-3" />
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
            {entry.entry_text}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => onEdit(entry)}
              className="flex items-center gap-1.5 rounded-xl bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
            >
              <Pencil className="size-3" />
              Редактировать
            </button>
            <button
              type="button"
              onClick={() => onShare(entry)}
              className="flex items-center gap-1.5 rounded-xl bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
            >
              {shareId === entry.id ? (
                <><Check className="size-3 text-emerald-500" /> Скопировано</>
              ) : (
                <><Share2 className="size-3" /> Поделиться</>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StackCard({
  entry,
  index,
  isTop,
  onDismiss,
  cardProps,
}: {
  entry: DiaryEntry;
  index: number;
  isTop: boolean;
  onDismiss: () => void;
  cardProps: {
    editingId: string | null;
    editText: string;
    setEditText: (t: string) => void;
    saving: boolean;
    onCommitEdit: () => void;
    onCancelEdit: () => void;
    shareId: string | null;
    onEdit: (e: DiaryEntry) => void;
    onShare: (e: DiaryEntry) => void;
  };
}) {
  const sphereLabel = SPHERES.find((s) => s.id === entry.sphere_id)?.label ?? entry.sphere_id;
  const emoji = SPHERE_EMOJI[entry.sphere_id] ?? "📖";
  const delta =
    entry.resistance_before !== null && entry.resistance_after !== null
      ? entry.resistance_before - entry.resistance_after
      : null;
  const isEditing = cardProps.editingId === entry.id;

  const scale = 1 - index * 0.04;
  const yOffset = index * 10;
  const opacity = index >= 2 ? 0.5 : 1 - index * 0.15;

  return (
    <motion.div
      key={entry.id}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10 - index,
        transformOrigin: "top center",
      }}
      initial={false}
      animate={{
        scale,
        y: yOffset,
        opacity,
        rotateZ: 0,
      }}
      exit={{ x: 300, opacity: 0, rotateZ: 8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      drag={isTop && !isEditing ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 120 || Math.abs(info.velocity.x) > 500) {
          onDismiss();
        }
      }}
      className="cursor-grab active:cursor-grabbing"
    >
      <div className="rounded-3xl border border-border/30 bg-[#FDFAF5] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
           style={{ minHeight: 300 }}>
        {/* Date header */}
        <div className="mb-4 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60">
            {new Date(entry.created_at).toLocaleDateString("ru-RU", { weekday: "long" })}
          </p>
          <p className="font-display text-lg text-foreground">
            {new Date(entry.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}
          </p>
          <p className="text-[11px] text-muted-foreground">{formatTime(entry.created_at)}</p>
        </div>

        <div className="mb-3 h-px bg-border/30" />

        {/* Sphere + resistance */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{emoji}</span>
            <span className="font-display text-sm text-foreground">{sphereLabel}</span>
          </div>
          {delta !== null && (
            <div className="flex items-center gap-1 rounded-full bg-muted/30 px-2.5 py-1 text-[11px]">
              <span className="text-muted-foreground">
                {entry.resistance_before} → {entry.resistance_after}
              </span>
              {delta > 0 && <span className="text-emerald-600 font-medium">−{delta}</span>}
            </div>
          )}
        </div>

        {/* Entry text */}
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              className="w-full resize-none rounded-xl border border-border/40 bg-background/60 px-3 py-2 text-sm leading-relaxed text-foreground outline-none focus:border-primary/50"
              rows={5}
              value={cardProps.editText}
              onChange={(e) => cardProps.setEditText(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={cardProps.onCommitEdit}
                disabled={cardProps.saving}
                className="flex items-center gap-1.5 rounded-xl bg-primary/90 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-primary"
              >
                <Check className="size-3" />
                {cardProps.saving ? "…" : "Сохранить"}
              </button>
              <button
                type="button"
                onClick={cardProps.onCancelEdit}
                className="flex items-center gap-1.5 rounded-xl bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
              >
                <X className="size-3" />
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">
            {entry.entry_text}
          </p>
        )}

        {/* Actions */}
        {!isEditing && (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => cardProps.onEdit(entry)}
              className="flex items-center gap-1.5 rounded-xl bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
            >
              <Pencil className="size-3" />
              Редактировать
            </button>
            <button
              type="button"
              onClick={() => cardProps.onShare(entry)}
              className="flex items-center gap-1.5 rounded-xl bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
            >
              {cardProps.shareId === entry.id ? (
                <><Check className="size-3 text-emerald-500" /> Скопировано</>
              ) : (
                <><Share2 className="size-3" /> Поделиться</>
              )}
            </button>
          </div>
        )}

        {/* Swipe hint on top card */}
        {isTop && !isEditing && (
          <p className="mt-4 text-center text-[10px] text-muted-foreground/40">
            ← свайпни для следующей →
          </p>
        )}
      </div>
    </motion.div>
  );
}

function DiaryScreen() {
  const navigate = useNavigate();
  const fetchEntries = useServerFn(getDiaryEntries);
  const saveEdit = useServerFn(updateDiaryEntry);
  const fetchAppConfig = useServerFn(getAppConfig);
  const fetchPremium = useServerFn(checkPremiumStatus);

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [currentDate, setCurrentDate] = useState(() => toDateKey(new Date()));
  const [direction, setDirection] = useState(0);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [expandedCardIndex, setExpandedCardIndex] = useState(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppConfig()
      .then((cfg) => {
        if (!cfg.isPremiumApp) {
          navigate({ to: "/home" as never });
          return;
        }
        fetchPremium()
          .then(({ isPremium: p }) => {
            setIsPremium(p);
            if (!p) {
              setLoading(false);
              return;
            }
            fetchEntries()
              .then((data) => {
                setEntries(data);
                if (data.length > 0) {
                  setCurrentDate(toDateKey(new Date(data[0].created_at)));
                }
              })
              .catch(() => {})
              .finally(() => setLoading(false));
          })
          .catch(() => setLoading(false));
      })
      .catch(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const entriesByDate = useMemo(() => {
    const map = new Map<string, DiaryEntry[]>();
    for (const e of entries) {
      const key = toDateKey(new Date(e.created_at));
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    return map;
  }, [entries]);

  const datesWithEntries = useMemo(
    () => new Set(entriesByDate.keys()),
    [entriesByDate],
  );

  const navigateDay = useCallback(
    (delta: number) => {
      setDirection(delta);
      const d = parseDateKey(currentDate);
      d.setDate(d.getDate() + delta);
      setCurrentDate(toDateKey(d));
    },
    [currentDate],
  );

  const navigateWeek = useCallback(
    (delta: number) => {
      setDirection(delta);
      const d = parseDateKey(currentDate);
      d.setDate(d.getDate() + delta * 7);
      setCurrentDate(toDateKey(d));
    },
    [currentDate],
  );

  const navigateMonth = useCallback(
    (delta: number) => {
      setDirection(delta);
      const d = parseDateKey(currentDate);
      d.setMonth(d.getMonth() + delta);
      setCurrentDate(toDateKey(d));
    },
    [currentDate],
  );

  const handleDrag = useCallback(
    (_: unknown, info: PanInfo) => {
      if (Math.abs(info.offset.x) < SWIPE_THRESHOLD) return;
      const delta = info.offset.x < 0 ? 1 : -1;
      if (viewMode === "day") navigateDay(delta);
      else if (viewMode === "week") navigateWeek(delta);
      else navigateMonth(delta);
    },
    [viewMode, navigateDay, navigateWeek, navigateMonth],
  );

  const startEdit = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setEditText(entry.entry_text);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };
  const commitEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    await saveEdit({ data: { id: editingId, entry_text: editText } }).catch(() => {});
    setEntries((prev) =>
      prev.map((e) => (e.id === editingId ? { ...e, entry_text: editText } : e)),
    );
    setSaving(false);
    setEditingId(null);
  };

  const handleShare = async (entry: DiaryEntry) => {
    const sphereLabel = SPHERES.find((s) => s.id === entry.sphere_id)?.label ?? entry.sphere_id;
    const text = `${SPHERE_EMOJI[entry.sphere_id] ?? "📖"} ${sphereLabel}\n\n${entry.entry_text}\n\n— Дневник Евы`;
    if (navigator.share) {
      await navigator.share({ text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text).catch(() => {});
      setShareId(entry.id);
      setTimeout(() => setShareId(null), 2000);
    }
  };

  const cardProps = {
    editingId,
    editText,
    setEditText,
    saving,
    onCommitEdit: commitEdit,
    onCancelEdit: cancelEdit,
    shareId,
    onEdit: startEdit,
    onShare: handleShare,
  };

  const cur = parseDateKey(currentDate);

  // ─── Day view — card stack ───
  const [topCardIndex, setTopCardIndex] = useState(0);

  useEffect(() => {
    setTopCardIndex(0);
  }, [currentDate]);

  const renderDay = () => {
    const dayEntries = entriesByDate.get(currentDate) ?? [];
    const remaining = dayEntries.slice(topCardIndex);
    const total = dayEntries.length;

    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={() => navigateDay(-1)} className="rounded-full p-2 text-muted-foreground transition hover:bg-muted/40 hover:text-foreground">
            <ChevronLeft className="size-5" />
          </button>
          <p className="font-display text-base capitalize text-foreground">{formatDayFull(cur)}</p>
          <button type="button" onClick={() => navigateDay(1)} className="rounded-full p-2 text-muted-foreground transition hover:bg-muted/40 hover:text-foreground">
            <ChevronRight className="size-5" />
          </button>
        </div>

        {total === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/40 py-16 text-center">
            <p className="text-3xl">🌿</p>
            <p className="font-display text-sm text-muted-foreground">Нет записей в этот день</p>
          </div>
        ) : remaining.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-3xl">✨</p>
            <p className="font-display text-sm text-muted-foreground">Все записи просмотрены</p>
            <button
              type="button"
              onClick={() => setTopCardIndex(0)}
              className="mt-2 rounded-xl bg-primary/10 px-4 py-2 text-xs text-primary transition hover:bg-primary/20"
            >
              Начать сначала
            </button>
          </div>
        ) : (
          <>
            {/* Counter */}
            <div className="mb-3 text-center">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {topCardIndex + 1} из {total}
              </span>
            </div>

            {/* Card stack */}
            <div className="relative mx-auto w-full max-w-md" style={{ minHeight: 360 }}>
              <AnimatePresence>
                {remaining.slice(0, 3).reverse().map((entry, reverseI) => {
                  const i = Math.min(remaining.length, 3) - 1 - reverseI;
                  const isTop = i === 0;
                  return (
                    <StackCard
                      key={entry.id}
                      entry={entry}
                      index={i}
                      isTop={isTop}
                      onDismiss={() => setTopCardIndex((prev) => prev + 1)}
                      cardProps={cardProps}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    );
  };

  // ─── Week view ───
  const renderWeek = () => {
    const monday = getMonday(cur);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
    const weekLabel = `${weekDays[0].toLocaleDateString("ru-RU", { day: "numeric", month: "short" })} — ${weekDays[6].toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" })}`;

    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={() => navigateWeek(-1)} className="rounded-full p-2 text-muted-foreground transition hover:bg-muted/40 hover:text-foreground">
            <ChevronLeft className="size-5" />
          </button>
          <p className="font-display text-sm text-foreground">{weekLabel}</p>
          <button type="button" onClick={() => navigateWeek(1)} className="rounded-full p-2 text-muted-foreground transition hover:bg-muted/40 hover:text-foreground">
            <ChevronRight className="size-5" />
          </button>
        </div>

        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={toDateKey(monday)}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDrag}
            className="grid grid-cols-7 gap-1.5"
          >
            {weekDays.map((d) => {
              const key = toDateKey(d);
              const dayEntries = entriesByDate.get(key) ?? [];
              const isToday = key === toDateKey(new Date());
              const hasEntries = dayEntries.length > 0;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (hasEntries) {
                      setExpandedDay(expandedDay === key ? null : key);
                      setExpandedCardIndex(0);
                    }
                    setCurrentDate(key);
                  }}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition ${
                    expandedDay === key
                      ? "border-primary/50 bg-primary/10 ring-1 ring-primary/30"
                      : isToday
                        ? "border-primary/50 bg-primary/5"
                        : hasEntries
                          ? "border-border/30 bg-card/60 hover:border-primary/30"
                          : "border-transparent bg-muted/20"
                  }`}
                >
                  <span className="text-[10px] uppercase text-muted-foreground">
                    {WEEKDAYS_SHORT[(d.getDay() + 6) % 7]}
                  </span>
                  <span className={`text-sm font-medium ${isToday ? "text-primary" : "text-foreground"}`}>
                    {d.getDate()}
                  </span>
                  {hasEntries ? (
                    <div className="flex flex-wrap justify-center gap-0.5">
                      {dayEntries.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className="size-1.5 rounded-full"
                          style={{
                            background:
                              e.sphere_id === "health" ? "#22c55e"
                              : e.sphere_id === "rest" ? "#a78bfa"
                              : e.sphere_id === "relationships" ? "#f472b6"
                              : e.sphere_id === "finance" ? "#38bdf8"
                              : e.sphere_id === "career" ? "#fbbf24"
                              : e.sphere_id === "growth" ? "#4ade80"
                              : e.sphere_id === "family" ? "#fb923c"
                              : e.sphere_id === "people" ? "#818cf8"
                              : "#94a3b8",
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="size-1.5" />
                  )}
                  {hasEntries && (
                    <p className="mt-0.5 line-clamp-2 text-[9px] leading-tight text-muted-foreground">
                      {SPHERES.find((s) => s.id === dayEntries[0].sphere_id)?.label ?? ""}
                    </p>
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Card stack for selected day */}
        {expandedDay && viewMode === "week" && (() => {
          const dayEntries = entriesByDate.get(expandedDay) ?? [];
          const remaining = dayEntries.slice(expandedCardIndex);
          const total = dayEntries.length;
          if (total === 0) return null;
          return (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground capitalize">
                  {formatDayFull(parseDateKey(expandedDay))}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{expandedCardIndex + 1} из {total}</span>
                  <button type="button" onClick={() => { setExpandedDay(null); setExpandedCardIndex(0); }}
                    className="rounded-full p-1 text-muted-foreground/60 hover:text-foreground">
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
              {remaining.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <p className="text-[10px] text-muted-foreground">Все просмотрены</p>
                  <button type="button" onClick={() => setExpandedCardIndex(0)}
                    className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs text-primary">Сначала</button>
                </div>
              ) : (
                <div className="relative mx-auto w-full max-w-md" style={{ minHeight: 340 }}>
                  <AnimatePresence>
                    {remaining.slice(0, 3).reverse().map((entry, reverseI) => {
                      const i = Math.min(remaining.length, 3) - 1 - reverseI;
                      return (
                        <StackCard key={entry.id} entry={entry} index={i} isTop={i === 0}
                          onDismiss={() => setExpandedCardIndex((p) => p + 1)} cardProps={cardProps} />
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          );
        })()}
      </div>
    );
  };

  // ─── Month view ───
  const renderMonth = () => {
    const year = cur.getFullYear();
    const month = cur.getMonth();
    const weeks = getMonthGrid(year, month);
    const monthLabel = cur.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={() => navigateMonth(-1)} className="rounded-full p-2 text-muted-foreground transition hover:bg-muted/40 hover:text-foreground">
            <ChevronLeft className="size-5" />
          </button>
          <p className="font-display text-sm capitalize text-foreground">{monthLabel}</p>
          <button type="button" onClick={() => navigateMonth(1)} className="rounded-full p-2 text-muted-foreground transition hover:bg-muted/40 hover:text-foreground">
            <ChevronRight className="size-5" />
          </button>
        </div>

        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={`${year}-${month}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDrag}
          >
            {/* Weekday headers */}
            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEKDAYS_SHORT.map((wd) => (
                <div key={wd} className="text-center text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  {wd}
                </div>
              ))}
            </div>

            {/* Days grid */}
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
                {week.map((d, di) => {
                  if (!d) return <div key={di} />;
                  const key = toDateKey(d);
                  const dayEntries = entriesByDate.get(key) ?? [];
                  const hasEntries = dayEntries.length > 0;
                  const isToday = key === toDateKey(new Date());
                  const isSelected = key === currentDate;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        if (hasEntries) {
                          setExpandedDay(expandedDay === key ? null : key);
                          setExpandedCardIndex(0);
                        }
                        setCurrentDate(key);
                      }}
                      className={`relative flex flex-col items-center rounded-lg py-2 transition ${
                        expandedDay === key
                          ? "bg-primary/10 ring-1 ring-primary/40"
                          : isToday
                            ? "bg-primary/5"
                            : hasEntries
                              ? "hover:bg-muted/40"
                              : ""
                      }`}
                    >
                      <span
                        className={`text-sm ${
                          isToday
                            ? "font-medium text-primary"
                            : hasEntries
                              ? "font-medium text-foreground"
                              : "text-muted-foreground/60"
                        }`}
                      >
                        {d.getDate()}
                      </span>
                      {hasEntries && (
                        <div className="mt-0.5 flex gap-0.5">
                          {dayEntries.slice(0, 3).map((e) => (
                            <span
                              key={e.id}
                              className="size-1.5 rounded-full"
                              style={{
                                background:
                                  e.sphere_id === "health" ? "#22c55e"
                                  : e.sphere_id === "rest" ? "#a78bfa"
                                  : e.sphere_id === "relationships" ? "#f472b6"
                                  : e.sphere_id === "finance" ? "#38bdf8"
                                  : e.sphere_id === "career" ? "#fbbf24"
                                  : e.sphere_id === "growth" ? "#4ade80"
                                  : e.sphere_id === "family" ? "#fb923c"
                                  : e.sphere_id === "people" ? "#818cf8"
                                  : "#94a3b8",
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Card stack for selected day in month view */}
        {expandedDay && viewMode === "month" && (() => {
          const dayEntries = entriesByDate.get(expandedDay) ?? [];
          const remaining = dayEntries.slice(expandedCardIndex);
          const total = dayEntries.length;
          if (total === 0) return null;
          return (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground capitalize">
                  {formatDayFull(parseDateKey(expandedDay))}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{expandedCardIndex + 1} из {total}</span>
                  <button type="button" onClick={() => { setExpandedDay(null); setExpandedCardIndex(0); }}
                    className="rounded-full p-1 text-muted-foreground/60 hover:text-foreground">
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
              {remaining.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <p className="text-[10px] text-muted-foreground">Все просмотрены</p>
                  <button type="button" onClick={() => setExpandedCardIndex(0)}
                    className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs text-primary">Сначала</button>
                </div>
              ) : (
                <div className="relative mx-auto w-full max-w-md" style={{ minHeight: 340 }}>
                  <AnimatePresence>
                    {remaining.slice(0, 3).reverse().map((entry, reverseI) => {
                      const i = Math.min(remaining.length, 3) - 1 - reverseI;
                      return (
                        <StackCard key={entry.id} entry={entry} index={i} isTop={i === 0}
                          onDismiss={() => setExpandedCardIndex((p) => p + 1)} cardProps={cardProps} />
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          );
        })()}
      </div>
    );
  };

  return (
    <FadeTransition k="diary">
      <div className="flex h-full flex-col overflow-y-auto pb-8">
        {/* Header */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate({ to: "/home" as never })}
            className="mb-4 flex size-9 items-center justify-center rounded-full border border-border/60 bg-card/70 text-foreground transition hover:border-primary/50"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <BookOpen className="size-6 text-primary" />
          </div>
          <h1 className="font-display text-3xl text-glow">Мой дневник</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Записи о твоём внутреннем пути
          </p>
          </div>
        </div>

        {loading && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">Загрузка…</p>
          </div>
        )}

        {!loading && isPremium === false && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center px-6">
            <span className="text-5xl">✨</span>
            <p className="font-display text-xl">Доступно в EVA+</p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              После каждого путешествия Ева будет записывать твой путь — личный дневник внутреннего роста.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/premium/paywall" as never })}
              className="mt-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-400/30 transition hover:from-amber-500 hover:to-amber-600"
            >
              Узнать о EVA+
            </button>
          </div>
        )}

        {!loading && isPremium && entries.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-6">
            <span className="text-5xl">📖</span>
            <p className="font-display text-lg">Дневник пока пуст</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Записи создаются автоматически для путешествий, пройденных с активной подпиской EVA+.
              Пройди первое путешествие — и здесь появится запись.
            </p>
            <div className="mt-6 w-full max-w-md rounded-2xl border border-dashed border-border/40 bg-card/40 p-5 opacity-60">
              <p className="mb-1 text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50">Пример записи</p>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-lg">💞</span>
                <span className="text-sm font-medium text-foreground/60">Отношения</span>
                <span className="text-[11px] text-muted-foreground/40">· 14:32</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/50 italic">
                Думая об отношениях, я поняла: спокойствие внутри — это я сама.
              </p>
              <p className="mt-2 text-xs text-foreground/40">
                Сопротивление снизилось с 7 до 4 — это ощутимый сдвиг.
              </p>
            </div>
          </div>
        )}

        {!loading && isPremium && entries.length > 0 && (
          <>
            {/* View mode tabs */}
            <div className="mx-auto mb-5 flex gap-1 rounded-xl border border-border/40 bg-card/40 p-1">
              {(["day", "week", "month"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => { setViewMode(mode); setExpandedDay(null); setExpandedCardIndex(0); }}
                  className={`rounded-lg px-4 py-1.5 text-xs font-medium transition ${
                    viewMode === mode
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode === "day" ? "День" : mode === "week" ? "Неделя" : "Месяц"}
                </button>
              ))}
            </div>

            {viewMode === "day" && renderDay()}
            {viewMode === "week" && renderWeek()}
            {viewMode === "month" && renderMonth()}
          </>
        )}
      </div>
    </FadeTransition>
  );
}
