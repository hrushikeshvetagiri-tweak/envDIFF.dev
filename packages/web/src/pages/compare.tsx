import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SiVercel, SiNetlify, SiRailway } from "@icons-pack/react-simple-icons";
import { ArrowLeft, Lock, Share2, Wand2 } from "lucide-react";
import { EnvInput } from "@/components/compare/env-input";
import { DiffTable } from "@/components/compare/diff-table";
import { ConnectVercelModal } from "@/components/compare/connect-vercel-modal";
import { ShareModal } from "@/components/compare/share-modal";
import { UnlockModal } from "@/components/checkout/unlock-modal";
import { Button } from "@/components/ui/button";
import { useLicense } from "@/hooks/use-license";
import { diffEnv, parseEnv, summarize } from "@envdiff/core";
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

export function Compare() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [hideMatch, setHideMatch] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"connect" | "share" | null>(null);
  const { isLicensed, licenseKey, activate } = useLicense();

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

  const handleVercelClick = () => {
    if (isLicensed) {
      setConnectOpen(true);
    } else {
      setPendingAction("connect");
      setUnlockOpen(true);
    }
  };

  const handleShareClick = () => {
    if (isLicensed) {
      setShareOpen(true);
    } else {
      setPendingAction("share");
      setUnlockOpen(true);
    }
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

        <div className="grid grid-cols-4 divide-silver/10 lg:flex lg:flex-1 lg:flex-col lg:divide-y">
          <StatTile label="keys" value={stats.total} />
          <StatTile label="missing" value={stats.missing} emphasis={stats.missing > 0} />
          <StatTile label="different" value={stats.different} emphasis={stats.different > 0} />
          <StatTile label="matching" value={stats.match} />
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
            <Button
              size="sm"
              variant="outline"
              onClick={handleShareClick}
              disabled={rows.length === 0}
              title={isLicensed ? "Share this diff" : "Share this diff — unlock to use"}
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
              {!isLicensed && <Lock className="h-3 w-3 opacity-60" />}
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
              tone="ink"
              divider
              value={right}
              onChange={setRight}
              placeholder={"DATABASE_URL=postgres://prod-server:5432/mydb\nAPI_URL=https://api.example.com"}
              accessory={
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleVercelClick}
                    title={isLicensed ? "Connect Vercel" : "Connect Vercel — unlock to use"}
                    className="relative flex h-6 w-6 items-center justify-center text-silver/70 transition-colors hover:text-silver"
                  >
                    <SiVercel className="h-3.5 w-3.5" />
                    {!isLicensed && (
                      <Lock className="absolute -right-1 -bottom-1 h-2.5 w-2.5 rounded-full bg-charcoal p-px text-silver/50" />
                    )}
                  </button>
                  {[
                    { name: "Netlify", Icon: SiNetlify },
                    { name: "Railway", Icon: SiRailway },
                  ].map(({ name, Icon }) => (
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

      <ConnectVercelModal open={connectOpen} onClose={() => setConnectOpen(false)} onImport={setRight} />
      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        licenseKey={licenseKey}
        rows={rows}
        leftLabel="local"
        rightLabel="production"
      />
      <UnlockModal
        open={unlockOpen}
        onClose={() => setUnlockOpen(false)}
        onActivated={(key) => {
          activate(key);
          setUnlockOpen(false);
          if (pendingAction === "share") setShareOpen(true);
          else setConnectOpen(true);
          setPendingAction(null);
        }}
      />
    </div>
  );
}

function StatTile({ label, value, emphasis }: { label: string; value: number; emphasis?: boolean }) {
  return (
    <div className="flex flex-col justify-between border-silver/10 px-3 py-3 max-lg:border-r last:max-lg:border-r-0 lg:min-h-[4.75rem] lg:px-4 lg:py-4">
      <span className="font-mono text-[10px] tracking-[0.22em] text-silver/50 uppercase">{label}</span>
      <span
        className={cn(
          "font-mono text-xl leading-none tracking-tight lg:text-3xl",
          emphasis ? "text-white" : "text-silver/70"
        )}
      >
        {value}
      </span>
    </div>
  );
}
