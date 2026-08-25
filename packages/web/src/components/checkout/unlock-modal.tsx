import { useState } from "react";
import { Check, Copy, KeyRound, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { CheckoutButton } from "@/components/checkout/checkout-button";
import { verifyLicense } from "@/lib/license";
import { PAYMENTS_ENABLED } from "@/lib/flags";
import { cn } from "@/lib/utils";

interface UnlockModalProps {
  open: boolean;
  onClose: () => void;
  onActivated: (licenseKey: string) => void;
}

const FEATURES = [
  "Connect Vercel, Netlify and Railway",
  "Save diffs and share links with your team",
  "One-time payment, no subscription",
];

export function UnlockModal({ open, onClose, onActivated }: UnlockModalProps) {
  const [tab, setTab] = useState<"buy" | "existing">(PAYMENTS_ENABLED ? "buy" : "existing");
  const [keyInput, setKeyInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [issuedKey, setIssuedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePurchased = (licenseKey: string) => {
    setIssuedKey(licenseKey);
    onActivated(licenseKey);
  };

  const handleActivateExisting = async () => {
    const key = keyInput.trim().toUpperCase();
    if (!key) return;

    setChecking(true);
    setCheckError(null);
    const { valid, reason } = await verifyLicense(key);
    setChecking(false);

    if (!valid) {
      setCheckError(reason ?? "That license key wasn't recognized. Double-check it and try again.");
      return;
    }

    onActivated(key);
    onClose();
  };

  const copyKey = async () => {
    if (!issuedKey) return;
    await navigator.clipboard.writeText(issuedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const close = () => {
    onClose();
    setIssuedKey(null);
    setKeyInput("");
    setCheckError(null);
  };

  if (issuedKey) {
    return (
      <Modal open={open} onClose={close} title="You're unlocked" icon={<Check className="h-4 w-4" />}>
        <p className="text-sm leading-relaxed text-silver/70">
          Payment confirmed. Here's your license key — save it somewhere, you'll need it if you switch browsers or
          devices.
        </p>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-silver/10 bg-ink px-4 py-3 font-mono text-sm">
          <span className="truncate">{issuedKey}</span>
          <button
            onClick={copyKey}
            className="flex shrink-0 items-center gap-1.5 text-xs text-silver/60 hover:text-silver"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <Button className="mt-5 w-full" onClick={close}>
          Start using EnvDiff
        </Button>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={close} title="Unlock EnvDiff" icon={<KeyRound className="h-4 w-4" />}>
      {PAYMENTS_ENABLED ? (
        <div className="mb-5 flex rounded-full bg-ink p-1">
          <button
            onClick={() => setTab("buy")}
            className={cn(
              "flex-1 rounded-full py-1.5 text-xs font-medium transition-colors",
              tab === "buy" ? "bg-silver text-ink" : "text-silver/60 hover:text-silver"
            )}
          >
            Buy a license
          </button>
          <button
            onClick={() => setTab("existing")}
            className={cn(
              "flex-1 rounded-full py-1.5 text-xs font-medium transition-colors",
              tab === "existing" ? "bg-silver text-ink" : "text-silver/60 hover:text-silver"
            )}
          >
            I have a key
          </button>
        </div>
      ) : (
        <p className="mb-5 rounded-xl border border-silver/10 bg-ink px-4 py-3 text-sm leading-relaxed text-silver/70">
          Checkout is{" "}
          <span className="font-medium text-silver">coming soon</span> while we finish payment verification. If you
          already have a license key, activate it below.
        </p>
      )}

      {tab === "buy" && PAYMENTS_ENABLED ? (
        <div>
          <div className="mb-5 flex items-baseline gap-2 rounded-xl border border-silver/10 bg-ink px-4 py-3.5">
            <span className="text-2xl font-medium tracking-tight text-silver">₹1,499</span>
            <span className="text-xs text-silver/50">one-time</span>
          </div>
          <ul className="mb-5 space-y-2.5">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-silver/75">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-silver/50" />
                {f}
              </li>
            ))}
          </ul>
          <CheckoutButton onSuccess={handlePurchased} />
        </div>
      ) : (
        <div>
          <label className="mb-1.5 block text-xs text-silver/60">License key</label>
          <input
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleActivateExisting()}
            placeholder="ENVDIFF-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
            className="w-full rounded-lg border border-silver/10 bg-ink px-3 py-2.5 font-mono text-sm text-silver placeholder:text-silver/30 focus:border-silver/30 focus:outline-none"
          />
          {checkError && <p className="mt-2 text-xs text-red-400">{checkError}</p>}
          <Button className="mt-4 w-full" onClick={handleActivateExisting} disabled={checking || !keyInput.trim()}>
            {checking && <Loader2 className="h-4 w-4 animate-spin" />}
            Activate
          </Button>
        </div>
      )}
    </Modal>
  );
}
