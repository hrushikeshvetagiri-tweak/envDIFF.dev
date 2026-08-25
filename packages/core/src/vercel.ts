const API_BASE = "https://api.vercel.com";

export class VercelApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "VercelApiError";
  }
}

export interface VercelProject {
  id: string;
  name: string;
}

export interface VercelEnvVar {
  id: string;
  key: string;
  value?: string;
  type: "plain" | "encrypted" | "sensitive" | "secret";
  target: string[];
}

async function vercelFetch<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.error?.message ??
      (res.status === 403 ? "That token was rejected — check it's valid and not expired." : `Vercel API error (${res.status})`);
    throw new VercelApiError(message, res.status);
  }

  return res.json();
}

export async function listProjects(token: string): Promise<VercelProject[]> {
  const data = await vercelFetch<{ projects: VercelProject[] }>(token, "/v9/projects?limit=100");
  return data.projects;
}

export type VercelTarget = "production" | "preview" | "development";

export async function listEnvVars(
  token: string,
  projectId: string,
  target: VercelTarget
): Promise<VercelEnvVar[]> {
  const data = await vercelFetch<{ envs: VercelEnvVar[] }>(
    token,
    `/v9/projects/${projectId}/env?decrypt=true`
  );
  return data.envs.filter((e) => e.target.includes(target));
}

/** Renders fetched Vercel env vars back into .env text so it can feed the diff logic. */
export function envVarsToText(vars: VercelEnvVar[]): string {
  return vars
    .map((v) => {
      if (v.value !== undefined) return `${v.key}=${v.value}`;
      // Sensitive-type vars: Vercel never returns the value, even with decrypt=true.
      return `# ${v.key}=<write-only, Vercel won't return the value>`;
    })
    .join("\n");
}

/** Finds a Vercel project by exact name or id — used by the CLI, which takes one flag either way. */
export function findProject(projects: VercelProject[], nameOrId: string): VercelProject | undefined {
  return projects.find((p) => p.id === nameOrId || p.name === nameOrId);
}
