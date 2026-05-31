import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
}

export function PrivacyModal({ open, onClose, title = "Безопасность и конфиденциальность" }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm md:items-center"
      onClick={onClose}
    >
      <div
        className="relative max-h-[80vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-2xl text-glow">{title}</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>Мы бережно относимся к вашим данным и эмоциональному состоянию.</p>
          <p>ЕВА:</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>не ставит диагнозы,</li>
            <li>не заменяет психотерапию,</li>
            <li>не принимает медицинских решений,</li>
            <li>не использует ваши ответы для автоматической психологической диагностики.</li>
          </ul>
          <p>Данные используются только для работы приложения и сохранения прогресса.</p>
          <p>Вы можете прекратить использование сервиса в любой момент.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-full border border-border bg-card/60 px-6 py-3 text-sm transition hover:border-primary/50 hover:bg-card"
        >
          Понятно
        </button>
      </div>
    </div>
  );
}
