import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  selected?: boolean;
  interactive?: boolean;
}

export function GlassCard({ className, children, selected, interactive, ...rest }: Props) {
  return (
    <div
      className={cn(
        "relative rounded-3xl border bg-card backdrop-blur-sm p-6 transition-all duration-300 shadow-card",
        selected
          ? "border-primary/70 shadow-[0_10px_40px_-10px_oklch(0.74_0.13_70/0.45)]"
          : "border-border",
        interactive && "cursor-pointer hover:border-primary/50 hover:-translate-y-0.5",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
