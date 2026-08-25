import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SiVercel, SiNetlify, SiRailway } from "@icons-pack/react-simple-icons";
import { ArrowLeft, Wand2 } from "lucide-react";
import { EnvInput } from "@/components/compare/env-input";
import { DiffTable } from "@/components/compare/diff-table";
import { Button } from "@/components/ui/button";
import { diffEnv, parseEnv, summarize } from "@/lib/env-diff";
import { cn } from "@/lib/utils";

const EXAMPLE_LEFT = `DATABASE_URL=postgres://localhost:5432/mydb
STRIPE_KEY=sk_test_abc123
API_URL=http://localhost:3000
NEW_FEATURE_FLAG=true
SENDGRID_KEY=SG.xxxxx`;

const EXAMPLE_RIGHT = `DATABASE_URL=postgres://prod-server:5432/mydb
STRIPE_KEY=sk_test_abc123
API_URL=http://localhost:3000
SENDGRID_KEY=SG.xxxxx`;

const providers = [
  { name: "Vercel", Icon: SiVercel },
  { name: "Netlify", Icon: SiNetlify },
  { name: "Railway", Icon: SiRailway },
];

export function Compare() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [hideMatch, setHideMatch] = useState(false);

  const rows = useMemo(() => diffEnv(parseEnv(left), parseEnv(right)), [left, right]);
  const stats = useMemo(() => summarize(rows), [rows]);
  const visible = useMemo(
    () => (hideMatch ? rows.filter((r) => r.status !== "match") : rows),
    [rows, hideMatch]
  );

  const loadExample = () => {
    setLeft(EXAMPLE_LEFT);
    setRight(EXAMPLE_RIGHT);
  };

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ink text-silver lg:flex-row">
      <aside className="flex shrink-0 flex-col bg-navy lg:w-56">
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:flex-col lg:items-stretch lg:justify-start">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/favicon.svg"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="select-none font-mono text-[1.05rem] font-bold lowercase tracking-tight">
              .envdiff
            </span>
          </Link>
          <Link
            to="/"
            className="hidden items-center gap-1.5 font-mono text-[11px] tracking-[0.2em] text-silver/50 uppercase transition-colors hover:text-silver lg:flex"
          >
            <ArrowLeft className="h-3 w-3" />
            Site
          </Link>
          <Link
            to="/"
            className="grid h-8 w-8 place-items-center text-silver/70 lg:hidden"
            aria-label="Back to site"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-4 lg:flex lg:flex-1 lg:flex-col">
          <StatTile label="keys" value={stats.total} className="bg-charcoal text-silver" />
          <StatTile label="missing" value={stats.missing} className="bg-paper text-ink" />
          <StatTile label="different" value={stats.different} className="bg-charcoal text-silver" />
          <StatTile label="matching" value={stats.match} className="bg-ink text-silver" />
        </div>

        <p className="hidden px-4 py-4 font-mono text-[11px] leading-relaxed tracking-wide text-silver/45 lg:block">
          Paste stays in this tab. Nothing is posted.
        </p>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 bg-charcoal px-4 py-3">
          <div>
            <p className="font-mono text-[11px] tracking-[0.28em] text-silver/50 uppercase">Workspace</p>
            <h1 className="text-sm font-medium tracking-tight sm:text-base">Local vs production</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHideMatch((v) => !v)}
              className={cn(
                "h-8 rounded-full px-3 font-mono text-[12px] tracking-tight transition-colors",
                hideMatch ? "bg-silver text-ink" : "bg-ink/60 text-silver/70 hover:text-silver"
              )}
            >
              {hideMatch ? "Drift only" : "All keys"}
            </button>
            <Button size="sm" onClick={loadExample}>
              <Wand2 className="h-3.5 w-3.5" />
              Load example
            </Button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-rows-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:overflow-hidden">
          <div className="grid min-h-0 lg:grid-cols-2">
            <EnvInput
              kicker="01"
              label="Local"
              tone="ink"
              value={left}
              onChange={setLeft}
              placeholder={"DATABASE_URL=postgres://localhost:5432/mydb\nAPI_URL=http://localhost:3000"}
            />
            <EnvInput
              kicker="02"
              label="Production"
              tone="navy"
              value={right}
              onChange={setRight}
              placeholder={"DATABASE_URL=postgres://prod-server:5432/mydb\nAPI_URL=https://api.example.com"}
              accessory={
                <div className="flex items-center gap-1">
                  {providers.map(({ name, Icon }) => (
                    <button
                      key={name}
                      disabled
                      title={`Connect ${name} — coming soon`}
                      className="flex h-6 w-6 items-center justify-center text-silver/35"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              }
            />
          </div>
          <DiffTable rows={visible} leftLabel="local" rightLabel="production" />
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className={cn("flex flex-col justify-between px-3 py-3 lg:min-h-[4.75rem] lg:px-4 lg:py-4", className)}>
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase opacity-60">{label}</span>
      <span className="font-mono text-xl leading-none tracking-tight lg:text-3xl">{value}</span>
    </div>
  );
}
