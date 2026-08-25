import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { DiffRow } from "@/lib/env-diff";
import { looksSecret } from "@/lib/env-diff";
import { cn } from "@/lib/utils";

interface DiffTableProps {
  rows: DiffRow[];
  leftLabel: string;
  rightLabel: string;
}

const statusConfig = {
  match: { label: "match", row: "border-l-2 border-l-transparent" },
  different: { label: "different", row: "border-l-2 border-l-silver/40 bg-white/[0.02]" },
  "missing-right": { label: "missing in prod", row: "border-l-2 border-l-silver bg-white/[0.03]" },
  "missing-left": { label: "missing in local", row: "border-l-2 border-l-silver bg-white/[0.03]" },
};

function RevealButton({ revealed, onClick }: { revealed: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-silver/40 transition-colors hover:text-silver"
      aria-label={revealed ? "Hide value" : "Reveal value"}
    >
      {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
    </button>
  );
}

function Cell({ value, revealed, secret }: { value: string | null; revealed: boolean; secret: boolean }) {
  if (value === null) {
    return <span className="text-silver/35">—</span>;
  }
  if (secret && !revealed) {
    return <span className="tracking-widest text-silver/45">••••••••</span>;
  }
  return <span className="text-silver/80">{value || <span className="text-silver/35">(empty)</span>}</span>;
}

export function DiffTable({ rows, leftLabel, rightLabel }: DiffTableProps) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const toggle = (key: string) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-ink">
      <div className="flex shrink-0 items-center justify-between bg-charcoal px-4 py-3 font-mono text-[11px] tracking-[0.28em] text-silver uppercase">
        <span className="opacity-55">Diff</span>
        <span className="opacity-55">
          {leftLabel} → {rightLabel}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6 py-16 text-center">
          <p className="max-w-xs font-mono text-[13px] leading-relaxed text-silver/45">
            Paste both sides. The table fills in as you type — still in this browser.
          </p>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto">
          <div className="divide-y divide-silver/10 lg:hidden">
            {rows.map((row) => {
              const secret = looksSecret(row.key);
              const isRevealed = revealed.has(row.key);
              const cfg = statusConfig[row.status];
              return (
                <article key={row.key} className={cn("px-4 py-3 font-mono text-[13px]", cfg.row)}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-silver">{row.key}</p>
                    <div className="flex shrink-0 items-center gap-2">
                      {secret && (row.left !== null || row.right !== null) && (
                        <RevealButton revealed={isRevealed} onClick={() => toggle(row.key)} />
                      )}
                      <span className="text-[11px] tracking-[0.16em] text-silver/70 uppercase">{cfg.label}</span>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-3 text-silver/80">
                    <div>
                      <p className="text-[10px] tracking-[0.2em] text-silver/40 uppercase">{leftLabel}</p>
                      <Cell value={row.left} revealed={isRevealed} secret={secret} />
                    </div>
                    <div>
                      <p className="text-[10px] tracking-[0.2em] text-silver/40 uppercase">{rightLabel}</p>
                      <Cell value={row.right} revealed={isRevealed} secret={secret} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <table className="hidden w-full border-collapse text-left text-sm lg:table">
            <thead className="sticky top-0 z-10 bg-ink">
              <tr className="font-mono text-[11px] tracking-[0.2em] text-silver/45 uppercase">
                <th className="px-4 py-3 font-medium">key</th>
                <th className="px-4 py-3 font-medium">{leftLabel}</th>
                <th className="px-4 py-3 font-medium">{rightLabel}</th>
                <th className="px-4 py-3 text-right font-medium">status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const secret = looksSecret(row.key);
                const isRevealed = revealed.has(row.key);
                const cfg = statusConfig[row.status];
                return (
                  <tr
                    key={row.key}
                    className={cn(
                      "border-t border-silver/10 font-mono text-[13px] transition-colors hover:bg-white/5",
                      cfg.row
                    )}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-silver">{row.key}</td>
                    <td className="px-4 py-3">
                      <Cell value={row.left} revealed={isRevealed} secret={secret} />
                    </td>
                    <td className="px-4 py-3">
                      <Cell value={row.right} revealed={isRevealed} secret={secret} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {secret && (row.left !== null || row.right !== null) && (
                          <RevealButton revealed={isRevealed} onClick={() => toggle(row.key)} />
                        )}
                        <span className="font-mono text-[11px] tracking-[0.16em] text-silver/70 uppercase">
                          {cfg.label}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
