import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SiVercel } from "@icons-pack/react-simple-icons";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  envVarsToText,
  listEnvVars,
  listProjects,
  VercelApiError,
  type VercelProject,
  type VercelTarget,
} from "@envdiff/core";

const TOKEN_STORAGE_KEY = "envdiff:vercel_token";

interface ConnectVercelModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (text: string) => void;
}

type Step = "token" | "project";

export function ConnectVercelModal({ open, onClose, onImport }: ConnectVercelModalProps) {
  const [step, setStep] = useState<Step>("token");
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) ?? "");
  const [projects, setProjects] = useState<VercelProject[]>([]);
  const [projectId, setProjectId] = useState("");
  const [target, setTarget] = useState<VercelTarget>("production");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("token");
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const handleConnect = async () => {
    if (!token.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const list = await listProjects(token.trim());
      localStorage.setItem(TOKEN_STORAGE_KEY, token.trim());
      setProjects(list);
      if (list.length > 0) setProjectId(list[0].id);
      setStep("project");
    } catch (err) {
      setError(err instanceof VercelApiError ? err.message : "Couldn't reach Vercel. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    try {
      const vars = await listEnvVars(token.trim(), projectId, target);
      onImport(envVarsToText(vars));
      onClose();
    } catch (err) {
      setError(err instanceof VercelApiError ? err.message : "Couldn't fetch environment variables.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Connect Vercel" icon={<SiVercel className="h-4 w-4" />}>
      {step === "token" && (
        <div>
          <p className="mb-4 text-sm leading-relaxed text-silver/70">
            Paste a Vercel access token. It's sent straight from your browser to Vercel — never through our
            servers.{" "}
            <a
              href="https://vercel.com/account/tokens"
              target="_blank"
              rel="noreferrer"
              className="text-silver underline underline-offset-2 hover:text-white"
            >
              Get a token
            </a>
          </p>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConnect()}
            type="password"
            placeholder="Vercel access token"
            className="w-full rounded-lg border border-silver/10 bg-ink px-3 py-2.5 font-mono text-sm text-silver placeholder:text-silver/30 focus:border-silver/30 focus:outline-none"
          />
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          <Button className="mt-5 w-full" onClick={handleConnect} disabled={loading || !token.trim()}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Connect
          </Button>
        </div>
      )}

      {step === "project" && (
        <div>
          {projects.length === 0 ? (
            <p className="text-sm text-silver/70">No projects found on this account.</p>
          ) : (
            <div className="space-y-4">
              <Select label="Project" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Environment"
                value={target}
                onChange={(e) => setTarget(e.target.value as VercelTarget)}
              >
                <option value="production">Production</option>
                <option value="preview">Preview</option>
                <option value="development">Development</option>
              </Select>

              {error && <p className="text-xs text-red-400">{error}</p>}
              <Button className="w-full" onClick={handleImport} disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Import variables
              </Button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
