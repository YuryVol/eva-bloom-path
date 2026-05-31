import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "ember";
  size?: "md" | "lg";
}

export const GlowButton = forwardRef<HTMLButtonElement, Props>(function GlowButton(
  { className, variant = "primary", size = "lg", children, ...rest },
  ref,
) {
  const base =
    "relative inline-flex items-center justify-center rounded-full font-medium tracking-wide transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";
  const sizes = {
    md: "px-6 py-2.5 text-sm",
    lg: "px-10 py-4 text-base",
  };
  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:scale-[1.03] shadow-[0_8px_24px_oklch(0.74_0.13_70/0.35)] hover:shadow-[0_14px_40px_oklch(0.74_0.13_70/0.5)]",
    ember:
      "bg-accent text-accent-foreground hover:scale-[1.03] shadow-[0_8px_24px_oklch(0.78_0.08_150/0.35)] hover:shadow-[0_14px_40px_oklch(0.78_0.08_150/0.5)]",
    ghost:
      "bg-transparent border border-border text-foreground hover:bg-card hover:border-primary/40",
  };
  return (
    <button
      ref={ref}
      className={cn(base, sizes[size], variants[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
});
