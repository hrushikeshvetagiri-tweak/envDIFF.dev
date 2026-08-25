import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, icon, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-2xl border border-silver/15 bg-charcoal text-silver shadow-[0_24px_60px_-16px_rgba(0,0,0,0.7)]",
          className
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.06] to-transparent" />

        <div className="relative flex items-center justify-between gap-3 border-b border-silver/10 px-6 py-4">
          <div className="flex items-center gap-3">
            {icon && (
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ink text-silver">{icon}</span>
            )}
            <h2 className="font-mono text-sm tracking-[0.2em] text-silver/70 uppercase">{title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-silver/50 transition-colors hover:bg-white/10 hover:text-silver"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative p-6">{children}</div>
      </div>
    </div>
  );
}
