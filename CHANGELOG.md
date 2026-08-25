# Changelog

All notable changes to **envDIFF** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] — 2026-08-25

### Added

- Converted to an npm workspaces monorepo: `packages/core` (shared diff logic, Vercel client, API client), `packages/web`, `packages/worker`, `packages/cli`.
- Shareable diff links: `POST /api/share/create` + `GET /api/share/:id`, a `Share` button on the compare tool, and a public read-only view at `/s/:shareId`. Links carry key names and status only — never values — and expire after 7 days.
- `@envdiff/cli` — a CI-oriented command (`envdiff check`) that fails a pipeline step on env drift. Free for local-file-vs-local-file comparisons and `--required` key checks; connecting to a live provider (Vercel first) requires a license. Also ships `envdiff license set/show/remove` for local config.
- `POST /api/license/check` — a CLI-safe license validity check that, unlike `/api/license/verify`, does not register a device activation. Needed because CI runners are ephemeral and would otherwise burn through the 2-device cap within a couple of pipeline runs.
- D1 migration for `shared_diffs`.
- Hero chip highlighting that Vercel integration is live.

### Changed

- `worker/index.ts` split into route modules (`routes/checkout.ts`, `routes/license.ts`, `routes/share.ts`) with shared `lib/http.ts` helpers, ahead of the endpoint count roughly doubling.
- Root `README.md` documents the monorepo layout and the reasoning for it.
- Pro license keys lengthened to 47 characters (`ENVDIFF-` + eight 4-char groups).
- Checkout enabled via `PAYMENTS_ENABLED` (`true` for this release).
- Gamma workflow updated for monorepo paths (`packages/worker` migrate + deploy).

## [0.2.0] — 2026-08-25

### Added

- Cloudflare Worker API for checkout and licensing (`/api/checkout/*`, `/api/license/verify`) with Razorpay order create + signature verify.
- D1 schema for orders, licenses, and per-license device activations (max 2 devices).
- One-time EnvDiff unlock flow in pricing (₹1,499) with checkout / unlock modals and local license persistence.
- Vercel project connect on the compare tool (paste token → pick project → load env vars).
- Vite `/api` proxy to local Wrangler for dual `npm run dev` + `worker:dev` development.

### Changed

- Pricing currency shown in INR; EnvDiff plan is purchasable (no longer “coming soon”).
- Integrations section marks **Vercel** as live; other providers remain coming soon.
- Gamma production workflow now typechecks the worker and applies remote D1 migrations before deploy.
- Compare UI polish (diff row tones, optional env-panel divider).

## [0.1.0] — 2026-08-25

### Added

- Landing site for envDIFF with product sections (problem, how it works, integrations, privacy, pricing, FAQ).
- In-browser `.env` compare tool at `/compare` — client-side diff, no signup, values stay in the tab.
- Cloudflare Worker hosting (`envdiff-worker`) with SPA asset serving on **envdiff.dev** and **www.envdiff.dev**.
- Manual production deploy workflow (`.github/workflows/gamma.yml`) for the `gamma` branch.
- Coming-soon markers on paid plans (“Get EnvDiff”, “Notify me at launch”) and provider integration chips.

### Changed

- Navbar logo returns to the top of the home page (clears section hashes and scrolls smoothly).
- Package version set to `0.1.0` for the first public production cut.

[0.3.0]: https://github.com/admin-envdiff/envDIFF.dev/releases/tag/v0.3.0
[0.2.0]: https://github.com/admin-envdiff/envDIFF.dev/releases/tag/v0.2.0
[0.1.0]: https://github.com/admin-envdiff/envDIFF.dev/releases/tag/v0.1.0
