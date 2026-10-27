import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  placeholder?: string;
  /** Initial text if prefilling */
  initialValue?: string;
  /** Called when user saves. Receives the text. */
  onSave?: (text: string) => void;
  /** If true, offers a "Delete forever" option after saving */
  allowDelete?: boolean;
  /** Min rows for the textarea */
  minRows?: number;
  saveLabel?: string;
  deleteLabel?: string;
}

type Status = "editing" | "saved" | "deleted";

export function JournalEntry({
  placeholder = "Пиши всё, что приходит. Здесь нет правильных слов.",
  initialValue = "",
  onSave,
  allowDelete = true,
  minRows = 5,
  saveLabel = "Сохранить в дневнике",
  deleteLabel = "Удалить навсегда",
}: Props) {
  const [text, setText] = useState(initialValue);
  const [status, setStatus] = useState<Status>("editing");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = () => {
    onSave?.(text);
    setStatus("saved");
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setText("");
    setStatus("deleted");
    setConfirmDelete(false);
  };

  const handleEdit = () => {
    setStatus("editing");
    setConfirmDelete(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  // Auto-resize textarea
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence mode="wait">
        {status === "editing" && (
          <motion.div
            key="editing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleChange}
              placeholder={placeholder}
              rows={minRows}
              className="w-full resize-none rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none transition-colors"
              style={{ minHeight: `${minRows * 1.6}rem` }}
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={text.trim().length === 0}
              className="self-center rounded-full bg-primary px-8 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_6px_20px_oklch(0.74_0.13_70/0.35)] transition hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saveLabel}
            </button>
          </motion.div>
        )}

        {status === "saved" && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{text}</p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleEdit}
                className="text-xs text-muted-foreground/60 underline-offset-2 transition hover:text-muted-foreground hover:underline"
              >
                Редактировать
              </button>
              {allowDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className={`text-xs underline-offset-2 transition hover:underline ${
                    confirmDelete
                      ? "text-rose-400 hover:text-rose-500"
                      : "text-muted-foreground/40 hover:text-muted-foreground"
                  }`}
                >
                  {confirmDelete ? "Точно удалить?" : deleteLabel}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {status === "deleted" && (
          <motion.div
            key="deleted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-border/40 bg-muted/30 px-4 py-6 text-center"
          >
            <p className="text-sm text-muted-foreground">Запись удалена навсегда.</p>
            <button
              type="button"
              onClick={handleEdit}
              className="mt-2 text-xs text-muted-foreground/50 underline-offset-2 transition hover:text-muted-foreground hover:underline"
            >
              Написать снова
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
