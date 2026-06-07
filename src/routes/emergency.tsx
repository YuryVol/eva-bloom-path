import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Phone, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/emergency")({
  component: EmergencyScreen,
  head: () => ({ meta: [{ title: "Экстренная помощь — ЕВА" }] }),
});

const LINES = [
  {
    category: "Единый экстренный номер",
    items: [{ name: "Скорая, пожарные, полиция", number: "112" }],
  },
  {
    category: "Психологическая помощь",
    items: [
      { name: "Телефон доверия (бесплатно, круглосуточно)", number: "8-800-2000-122" },
      { name: "Кризисная линия психологической помощи", number: "8-800-100-49-94" },
      { name: "Московская служба психологической помощи", number: "051" },
    ],
  },
  {
    category: "Медицинская и социальная помощь",
    items: [
      { name: "Скорая медицинская помощь", number: "103" },
      { name: "Полиция", number: "102" },
      { name: "Социальная служба экстренной помощи", number: "8-800-444-22-00" },
    ],
  },
  {
    category: "Помощь в кризисных ситуациях",
    items: [
      { name: "Помощь при насилии (Национальный центр)", number: "8-800-7000-600" },
      { name: "Телефон доверия для детей и подростков", number: "8-800-2000-122" },
    ],
  },
];

export default function EmergencyScreen() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate({ to: "/disclaimer" as never });
  };

  return (
    <main className="min-h-[100dvh] bg-[#F9F4EE] px-4 py-8">
      <div className="mx-auto max-w-md">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Назад
        </button>

        <h1 className="font-display text-3xl text-foreground">
          Экстренная помощь
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Все номера бесплатны и работают круглосуточно, если не указано иное.
        </p>

        <div className="mt-8 flex flex-col gap-6">
          {LINES.map((section) => (
            <div key={section.category}>
              <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                {section.category}
              </p>
              <div className="flex flex-col gap-2">
                {section.items.map((item) => (
                  <div
                    key={item.number}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/80 px-5 py-4 backdrop-blur-sm"
                  >
                    <p className="text-sm leading-snug text-foreground/80">
                      {item.name}
                    </p>
                    <a
                      href={`tel:${item.number.replace(/\D/g, "")}`}
                      className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-2 font-display text-base text-primary transition hover:bg-primary/20"
                    >
                      <Phone className="size-3.5" strokeWidth={2} />
                      {item.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs leading-relaxed text-muted-foreground/70">
          Если вам плохо — вы не одна. Помощь есть, и вы заслуживаете её.
        </p>
      </div>
    </main>
  );
}
