import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Clock, ShieldCheck } from "lucide-react";
import type { ShareData } from "@envdiff/core";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/license";

function statusLabel(status: string, leftLabel: string, rightLabel: string): string {
  switch (status) {
    case "match":
      return "match";
    case "different":
      return "different";
    case "missing-right":
      return `missing in ${rightLabel}`;
    case "missing-left":
      return `missing in ${leftLabel}`;
    default:
      return status;
  }
}

function timeUntil(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "expired";
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `in ${days} day${days === 1 ? "" : "s"}`;
  const hours = Math.floor(ms / 3_600_000);
  return `in ${Math.max(hours, 1)}h`;
}

export function ShareView() {
  const { shareId } = useParams<{ shareId: string }>();
  const [data, setData] = useState<ShareData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shareId) return;
    setLoading(true);
    api
      .getShare(shareId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load this link."))
      .finally(() => setLoading(false));
  }, [shareId]);

  return (
    <div className="min-h-dvh bg-ink text-silver">
      <header className="border-b border-silver/10 px-6 py-4">
        <Link to="/" className="select-none font-mono text-[1.05rem] font-bold lowercase tracking-tight">
          .envDIFF
        </Link>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-16">
        {loading && <p className="text-sm text-silver/50">Loading…</p>}

        {!loading && error && (
          <div>
            <h1 className="text-xl font-medium tracking-tight">This link isn't available</h1>
            <p className="mt-2 text-sm text-silver/60">{error}</p>
            <Link to="/compare" className="mt-6 inline-block">
              <Button size="sm">
                Compare your own .env files
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        )}

        {!loading && data && (
          <div>
            <div className="mb-6 flex items-center justify-between gap-3">
              <h1 className="text-xl font-medium tracking-tight">
                {data.leftLabel} <span className="text-silver/40">→</span> {data.rightLabel}
              </h1>
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-silver/45 uppercase">
                <Clock className="h-3 w-3" />
                expires {timeUntil(data.expiresAt)}
              </span>
            </div>

            <div className="mb-6 flex items-center gap-2 rounded-lg border border-silver/10 bg-charcoal px-3.5 py-2.5 text-xs text-silver/60">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              Key names and status only — no values were ever sent or stored.
            </div>

            <div className="overflow-hidden rounded-xl border border-silver/10">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-silver/10 bg-charcoal font-mono text-[11px] text-silver/45 uppercase">
                    <th className="px-4 py-3 font-medium">key</th>
                    <th className="px-4 py-3 text-right font-medium">status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.key} className="border-b border-silver/10 font-mono text-[13px] last:border-b-0">
                      <td className="px-4 py-3 text-silver">{row.key}</td>
                      <td className="px-4 py-3 text-right text-silver/70 uppercase">
                        {statusLabel(row.status, data.leftLabel, data.rightLabel)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Link to="/compare" className="mt-8 inline-block">
              <Button size="sm">
                Compare your own .env files
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
