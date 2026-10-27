import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GlassCard } from "@/components/eva/GlassCard";
import { GlowButton } from "@/components/eva/GlowButton";
import { FadeTransition } from "@/components/eva/FadeTransition";

export const Route = createFileRoute("/_authenticated/partners/psychologist")({
  component: PsychologistPage,
});

function PsychologistPage() {
  const navigate = useNavigate();

  return (
    <FadeTransition k="psychologist">
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-12">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Живой психолог
        </p>
        <h1 className="mt-4 text-center font-display text-3xl text-glow">
          Иногда самый сильный шаг — позволить живому человеку быть рядом
        </h1>
        <p className="mt-4 text-center text-sm leading-relaxed text-muted-foreground">
          Это не слабость. Это выбор — быть с собой.
        </p>

        <GlassCard className="mt-8 w-full p-6">
          <p className="font-display text-base text-foreground">
            Мы подбираем партнёрский сервис
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            В этой точке EVA скоро предложит проверенных специалистов — живых психологов
            из сервисов «Ясно», Alter или Zigmund.online. Партнёрство сейчас в процессе
            оформления.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Если тебе нужна поддержка прямо сейчас — можешь самостоятельно обратиться
            на yasno.me, alter.ru или zigmund.online.
          </p>
        </GlassCard>

        <div className="mt-8">
          <GlowButton onClick={() => navigate({ to: "/home" as never })}>
            Вернуться в EVA
          </GlowButton>
        </div>

        <p className="mt-6 text-center text-[10px] text-muted-foreground/60">
          Это партнёрский материал. EVA не получает оплату за переходы.
        </p>
      </div>
    </FadeTransition>
  );
}
