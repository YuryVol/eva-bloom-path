import { useState } from "react";
import { StepWizard } from "./StepWizard";
import { JournalEntry } from "./JournalEntry";
import { GlassCard } from "@/components/eva/GlassCard";
import type { PracticeProps } from "@/types/practice";

const PROMPTS = [
  "Я давно хотела сказать тебе...",
  "Я злюсь на тебя за то, что...",
  "Я благодарна тебе за...",
  "Мне было больно, когда...",
  "Я хочу, чтобы ты знал(а)...",
  "Я прощаю тебя за...",
];

export default function FamilyLetter({ onComplete, onSkip }: PracticeProps) {
  const [recipient, setRecipient] = useState("");
  const [chosenPrompt, setChosenPrompt] = useState("");
  const [letterSaved, setLetterSaved] = useState(false);

  const steps = [
    {
      key: "intro",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Семья · Расслабление</p>
          <h2 className="font-display text-3xl text-glow">Письмо близкому</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Есть слова, которые ждут своего момента. Не обязательно отправлять это письмо.
            Здесь важно — написать. Дать словам выйти наружу.
          </p>
          <GlassCard className="p-4">
            <p className="text-sm italic text-foreground/80">
              «Иногда нам нужно сказать что-то не для того, чтобы другой услышал, — а чтобы мы сами перестали нести это в себе.»
            </p>
          </GlassCard>
        </div>
      ),
    },
    {
      key: "recipient",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">Кому ты хочешь написать? Это может быть живой человек, ушедший, или даже ты сама в прошлом.</p>
          <input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Имя или «себе в 15 лет»..."
            className="rounded-2xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:outline-none"
          />
          <p className="text-sm text-muted-foreground mt-2">Выбери первую строку или начни сам(а):</p>
          <div className="flex flex-col gap-2">
            {PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setChosenPrompt(p)}
                className={`rounded-2xl border px-4 py-2.5 text-left text-sm transition-all ${
                  chosenPrompt === p
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border/60 bg-card/40 text-muted-foreground hover:border-border"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      ),
      nextDisabled: recipient.trim().length === 0,
    },
    {
      key: "write",
      content: (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Дорог{recipient.endsWith("а") ? "ая" : "ой"}{" "}
            <span className="font-medium text-foreground">{recipient}</span>,
          </p>
          {chosenPrompt && (
            <p className="text-sm italic text-foreground/70">{chosenPrompt}</p>
          )}
          <JournalEntry
            placeholder="Пиши всё, что приходит. Можно беспорядочно, можно коротко. Здесь нет правил."
            onSave={() => setLetterSaved(true)}
            allowDelete={true}
            minRows={6}
            saveLabel="Сохранить письмо"
          />
        </div>
      ),
      nextDisabled: false,
      nextLabel: "Завершить",
    },
    {
      key: "close",
      content: (
        <div className="flex flex-col gap-5 text-center">
          <div className="text-5xl">✉️</div>
          <p className="font-display text-2xl text-glow">Письмо написано</p>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-xs mx-auto">
            Ты дала словам выйти. Это уже работа — даже если ты никогда не отправишь это письмо.
            Как ты себя чувствуешь?
          </p>
          <GlassCard className="p-4 text-left">
            <p className="text-sm italic text-foreground/80">
              «Писать — значит встречаться с собой.»
            </p>
          </GlassCard>
        </div>
      ),
      nextLabel: "Завершить",
    },
  ];

  return <StepWizard steps={steps} onComplete={onComplete} onSkip={onSkip} />;
}
