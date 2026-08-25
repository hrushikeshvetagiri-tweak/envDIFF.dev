import type { ReactNode } from "react";
import { parseEnv } from "@envdiff/core";
import { cn } from "@/lib/utils";

interface EnvInputProps {
  label: string;
  kicker: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  accessory?: ReactNode;
  tone: "ink" | "navy" | "charcoal";
  divider?: boolean;
}

const tones = {
  ink: "bg-ink text-silver",
  navy: "bg-navy text-silver",
  charcoal: "bg-charcoal text-silver",
};

export function EnvInput({
  label,
  kicker,
  value,
  onChange,
  placeholder,
  accessory,
  tone,
  divider,
}: EnvInputProps) {
  const count = Object.keys(parseEnv(value)).length;

  return (
    <div className={cn("flex min-h-0 flex-col", tones[tone], divider && "lg:border-l lg:border-white/10")}>
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-baseline gap-3 font-mono text-[11px] tracking-[0.28em] uppercase">
          <span className="opacity-50">{kicker}</span>
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-3">
          {count > 0 && (
            <span className="font-mono text-[11px] tracking-wide opacity-50">
              {count} key{count === 1 ? "" : "s"}
            </span>
          )}
          {accessory}
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        className="min-h-52 w-full flex-1 resize-none bg-transparent px-4 pb-4 font-mono text-[13px] leading-relaxed text-silver placeholder:text-silver/30 focus:outline-none lg:min-h-0"
      />
    </div>
  );
}
