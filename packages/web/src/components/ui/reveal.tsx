import type { ReactNode } from "react";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "span";
}

export function Reveal({ children, delay = 0, className, as = "div" }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>(0.12);
  const Tag = as;

  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
      className={cn(
        "transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]",
        inView ? "translate-y-0 scale-100 opacity-100 blur-0" : "translate-y-10 scale-[0.98] opacity-0 blur-[6px]",
        className
      )}
    >
      {children}
    </Tag>
  );
}
