import { useState } from "react";
import { Check, Copy, Loader2, Share2 } from "lucide-react";
import { toMeta, type DiffRow } from "@envdiff/core";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/license";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  licenseKey: string | null;
  rows: DiffRow[];
  leftLabel: string;
  rightLabel: string;
}

export function ShareModal({ open, onClose, licenseKey, rows, leftLabel, rightLabel }: ShareModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const close = () => {
    onClose();
    setShareUrl(null);
    setError(null);
  };

  const createLink = async () => {
    if (!licenseKey) return;
    setLoading(true);
    setError(null);

    try {
      const result = await api.createShare({
        licenseKey,
        leftLabel,
        rightLabel,
        rows: toMeta(rows),
      });
      // Built from the browser's own address, not the Worker's guess at its public
      // origin — in local dev the API (:8787) and the site (:5173) are different
      // ports, so the server can't reliably know what URL the user is actually on.
      setShareUrl(`${window.location.origin}/s/${result.shareId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create the link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Modal open={open} onClose={close} title="Share this diff" icon={<Share2 className="h-4 w-4" />}>
      {shareUrl ? (
        <div>
          <p className="mb-4 text-sm leading-relaxed text-silver/70">
            Anyone with this link can see which keys are missing or different — no values, no login required. It
            expires in 7 days.
          </p>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-silver/10 bg-ink px-4 py-3 font-mono text-sm">
            <span className="truncate">{shareUrl}</span>
            <button
              onClick={copyUrl}
              className="flex shrink-0 items-center gap-1.5 text-xs text-silver/60 hover:text-silver"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <Button className="mt-5 w-full" onClick={close}>
            Done
          </Button>
        </div>
      ) : (
        <div>
          <p className="mb-5 text-sm leading-relaxed text-silver/70">
            Creates a link with just the key names and their status — <span className="text-silver">match</span>,{" "}
            <span className="text-silver">different</span>, or <span className="text-silver">missing</span>. The
            actual values never leave your browser.
          </p>
          {error && <p className="mb-3 text-xs text-red-400">{error}</p>}
          <Button className="w-full" onClick={createLink} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create share link
          </Button>
        </div>
      )}
    </Modal>
  );
}
