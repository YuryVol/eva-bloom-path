import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Send, Mail, MessageSquare, Link2, Share2 } from "lucide-react";

const EVA_SHARE_URL = "https://eva-emotions.lovable.app/";

export function buildShareMessage(includeProgress = false) {
  const title = "Eva — мягкая практика внутреннего пути";
  const baseText =
    "Я прошла короткую практику в Eva: выбрала цель, заметила сопротивление и сделала один маленький шаг. Попробуй тоже — это спокойный способ вернуться к себе.";
  const progressText = "Сегодня я завершила один маленький внутренний путь в Eva.";
  return {
    title,
    text: includeProgress ? `${progressText}\n\n${baseText}` : baseText,
    url: EVA_SHARE_URL,
  };
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ open, onOpenChange }: ShareDialogProps) {
  const [includeProgress, setIncludeProgress] = useState(false);
  const shareData = buildShareMessage(includeProgress);

  const encodedText = encodeURIComponent(`${shareData.text}\n\n${shareData.url}`);
  const encodedUrl = encodeURIComponent(shareData.url);
  const encodedTitle = encodeURIComponent(shareData.title);
  const encodedTextOnly = encodeURIComponent(shareData.text);

  const telegramHref = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTextOnly}`;
  const emailHref = `mailto:?subject=${encodedTitle}&body=${encodedText}`;
  const smsHref = `sms:?&body=${encodedText}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
      toast.success("Ссылка скопирована");
    } catch {
      toast.error("Не удалось скопировать. Попробуй выбрать другой способ.");
    }
  };

  const handleMore = async () => {
    if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
      try {
        await (navigator as Navigator).share(shareData);
      } catch {
        /* user cancelled */
      }
    } else {
      toast("Системное меню недоступно на этом устройстве");
    }
  };

  const baseBtn =
    "flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-background/40 px-4 py-4 text-sm font-display text-foreground transition-all hover:bg-background/70 hover:border-primary/50";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[28px] border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-glow">
            Поделиться с другом
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Отправь мягкое приглашение в Eva — без личных деталей твоей практики.
          </DialogDescription>
        </DialogHeader>

        <label className="flex items-start gap-3 rounded-2xl border border-border/40 bg-background/30 p-3 cursor-pointer">
          <Checkbox
            checked={includeProgress}
            onCheckedChange={(v) => setIncludeProgress(v === true)}
            className="mt-0.5"
          />
          <span className="text-sm text-foreground">
            Добавить мой краткий результат
            <span className="block text-xs text-muted-foreground mt-1">
              Только нейтральная фраза без подробностей.
            </span>
          </span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          <a href={telegramHref} target="_blank" rel="noopener noreferrer" className={baseBtn}>
            <Send className="h-4 w-4" /> Telegram
          </a>
          <a href={emailHref} className={baseBtn}>
            <Mail className="h-4 w-4" /> Email
          </a>
          <a href={smsHref} className={baseBtn}>
            <MessageSquare className="h-4 w-4" /> SMS
          </a>
          <button type="button" onClick={handleCopy} className={baseBtn}>
            <Link2 className="h-4 w-4" /> Скопировать ссылку
          </button>
        </div>

        <button
          type="button"
          onClick={handleMore}
          className="mt-2 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
        >
          <Share2 className="h-3 w-3" /> Ещё варианты
        </button>
      </DialogContent>
    </Dialog>
  );
}

export async function handleNativeShare(
  includeProgress: boolean,
  openFallback: () => void,
) {
  const shareData = buildShareMessage(includeProgress);
  if (typeof navigator !== "undefined" && (navigator as Navigator).share) {
    try {
      await (navigator as Navigator).share(shareData);
      return;
    } catch {
      openFallback();
      return;
    }
  }
  openFallback();
}
