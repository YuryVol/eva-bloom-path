import { memo } from "react";

type Theme = "safe" | "shadow" | "relief" | "tension" | "light" | "growth";

const gradients: Record<Theme, string> = {
  safe: "var(--gradient-aurora)",
  shadow: "var(--gradient-shadow)",
  relief: "var(--gradient-relief)",
  tension: "var(--gradient-tension)",
  light: "var(--gradient-light)",
  growth: "var(--gradient-aurora)",
};

/**
 * Calm, warm parchment background with a soft animated glow.
 * No harsh particles — keeps the wellness/therapeutic feel.
 */
export const AmbientBackground = memo(function AmbientBackground({ theme = "safe" }: { theme?: Theme }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 animate-aurora"
        style={{ background: gradients[theme] }}
      />
      {/* warm candle glow */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, oklch(0.92 0.1 70 / 0.45), transparent 55%)",
        }}
      />
      {/* soft paper grain */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
});
