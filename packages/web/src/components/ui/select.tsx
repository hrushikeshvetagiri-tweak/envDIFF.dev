import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className, children, ...props }: SelectProps) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs text-silver/60">{label}</span>}
      <span className="relative block">
        <select
          className={cn(
            "w-full appearance-none rounded-lg border border-silver/10 bg-ink px-3 py-2.5 pr-9 font-mono text-sm text-silver transition-colors focus:border-silver/30 focus:outline-none",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-silver/40" />
      </span>
    </label>
  );
}
