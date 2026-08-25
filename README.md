# envDIFF.dev

Catch config drift before it breaks prod. Paste two `.env` files and compare them in the browser — no signup, nothing leaves your tab. Connect Vercel to pull values automatically, share a read-only link with your team, or gate a CI pipeline on it with the CLI.

**Current release:** [v0.3.0](./CHANGELOG.md#030--2026-08-25) · production branch: `gamma`

Live: [envdiff.dev](https://envdiff.dev)

## Structure

This is an npm workspaces monorepo — four packages, one shared core:

```
packages/
  core/    @envdiff/core   — diff logic, Vercel client, API client. Zero framework deps.
  web/     @envdiff/web    — the React/Vite site (envdiff.dev)
  worker/  @envdiff/worker — the Cloudflare Worker: API routes, D1, static asset serving
  cli/     @envdiff/cli    — the `envdiff` CI/CD command, published to npm
```

`web`, `worker`, and `cli` all depend on `core` for the actual diffing and API-calling logic — the diff algorithm and the Vercel client are written once and used everywhere. See [`packages/cli/README.md`](./packages/cli/README.md) for the CLI itself.

## Scripts

```bash
npm install                 # installs and links all workspace packages

npm run dev                 # web app, Vite dev server (:5173)
npm run dev:worker          # Worker locally (:8787) — run alongside `dev` for /api routes

npm run build                # builds core, then web (what gets deployed)
npm run build:cli            # builds core, then the CLI

npm run typecheck           # type-checks every package

npm run deploy               # build + deploy the Worker (serves the built web app + API)

npm run db:migrate:local     # apply D1 migrations to the local dev database
npm run db:migrate:remote    # apply D1 migrations to production
```

The web app talks to `/api/*` on the same origin. In local dev, `packages/web/vite.config.ts` proxies `/api` to `http://localhost:8787`, so run `npm run dev:worker` in one terminal and `npm run dev` in another.

## Why a monorepo

`core` is the one place the diff algorithm, the Vercel API client, and the EnvDiff API client are written. Before the CLI existed, that logic only had one consumer (the web app) and lived in `src/lib/`. Once a second real consumer showed up — the CLI needs the exact same diffing and Vercel-fetching logic, running in Node instead of a browser — duplicating it would mean fixing every bug twice. `core` has no browser-only or Node-only APIs (just `fetch`, which both environments provide natively), so it works unmodified in both.

## Adding a secret

Worker secrets (Razorpay keys) are set with wrangler, not env files:

```bash
cd packages/worker
npx wrangler secret put RAZORPAY_KEY_ID
npx wrangler secret put RAZORPAY_KEY_SECRET
```

For local development, copy `packages/worker/.dev.vars.example` to `packages/worker/.dev.vars` and fill in **test-mode** keys. That file is gitignored.
