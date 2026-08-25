import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-charcoal text-silver border-silver/20",
  accent: "bg-silver text-ink border-silver",
  good: "border-silver/20 bg-transparent text-silver",
  warn: "border-silver/25 bg-charcoal text-silver",
  bad: "bg-navy text-silver border-navy",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: keyof typeof tones;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium tracking-tight",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
