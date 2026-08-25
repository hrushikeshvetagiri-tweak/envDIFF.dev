# EnvDiff — Project Reference Document

> Single source of truth for the EnvDiff idea: what it is, why it's worth building, how it's priced, what it integrates with, how it's built, and where it could go. Keep this as the one document to come back to.

**Status:** Idea stage, not yet built.
**Last updated:** 2026-08-24

---

## Table of Contents

1. [The Idea, in One Line](#1-the-idea-in-one-line)
2. [The Problem](#2-the-problem)
3. [The Solution](#3-the-solution)
4. [Why Now (AI Agents Context)](#4-why-now-ai-agents-context)
5. [Product Form Factor](#5-product-form-factor)
6. [Naming](#6-naming)
7. [Platform Integrations](#7-platform-integrations)
8. [Privacy & Security Model](#8-privacy--security-model)
9. [Pricing Strategy](#9-pricing-strategy)
10. [Technical Architecture](#10-technical-architecture)
11. [Distribution Strategy (MCP, CLI, Extensions)](#11-distribution-strategy-mcp-cli-extensions)
12. [Full Vision — Growth Stages](#12-full-vision--growth-stages)
13. [Competitive Landscape](#13-competitive-landscape)
14. [Related Idea Considered & Parked: Webhook Inspector](#14-related-idea-considered--parked-webhook-inspector)
15. [Open Decisions / Next Steps](#15-open-decisions--next-steps)

---

## 1. The Idea, in One Line

A tool that compares environment variables between two places (e.g. your local `.env` and your Vercel/Netlify/Railway production settings) and shows exactly what's missing or different — so config bugs get caught before deploy, not after.

Inspired by two solo-built, one-time-payment dev tools by the same maker (Dmytro Virych — 21 products shipped):
- **Envly** — native macOS `.env` file manager, $9 one-time, collects no data, pulls from Vercel/Netlify/Railway/Fly.io.
- **Localdock** — named localhost URLs for dev servers, $9 one-time, macOS menubar app, built partly to fix problems caused by running multiple AI coding agents in parallel.

Both share a playbook: narrow real pain point → no subscription → no account → privacy-first → built solo → marketed by building in public on X. EnvDiff follows the same playbook, as a website instead of a native app.

---

## 2. The Problem

Developers keep environment variables in multiple places — a local `.env` file, and separately in each hosting provider's dashboard (Vercel, Netlify, Railway, etc.). Over time these drift apart:

- A new variable gets added locally for a new feature, but never added in production → the deploy breaks or the feature silently fails.
- A variable meant to differ between environments (like `API_URL`) accidentally stays the same in both → dev settings leak into production.

**Concrete example:**

Local `.env`:
```
DATABASE_URL=postgres://localhost:5432/mydb
STRIPE_KEY=sk_test_abc123
API_URL=http://localhost:3000
NEW_FEATURE_FLAG=true
SENDGRID_KEY=SG.xxxxx
```

Vercel production:
```
DATABASE_URL=postgres://prod-server:5432/mydb
STRIPE_KEY=sk_test_abc123
API_URL=http://localhost:3000        ← should be a real URL, isn't
SENDGRID_KEY=SG.xxxxx
                                       ← NEW_FEATURE_FLAG missing entirely
```

Nobody re-reads 20-40 lines of secrets by hand before every deploy — these bugs slip through and get discovered in production, the worst possible time.

---

## 3. The Solution

Paste (or connect) two sources of environment variables. The tool instantly shows a table:

| Key | Local | Vercel | Status |
|---|---|---|---|
| DATABASE_URL | postgres://localhost | postgres://prod-server | ⚠️ different (expected) |
| NEW_FEATURE_FLAG | true | — | 🔴 missing in Vercel |
| API_URL | localhost:3000 | localhost:3000 | 🔴 should differ but doesn't |

Two ways to get the data in:
- **Paste mode** — copy-paste both `.env` files as text. No login, no API needed. Free.
- **Connect mode** — link a provider account (Vercel, Netlify, Railway, etc.) and it fetches the values automatically instead of manual copy-paste. Paid feature.

The comparison logic itself is identical either way — "connect" only saves the copy-paste step.

---

## 4. Why Now (AI Agents Context)

This problem is arguably getting *worse*, not better, because of AI coding agents:

- Running multiple Claude Code / Cursor sessions in parallel means multiple agents can independently edit `.env` files, spin up servers, or change config — environments drift faster than when one person edited one file by hand. (Localdock's own pitch calls this out directly.)
- **Honest counter-argument:** a technical user could just ask their AI agent to "fetch my Vercel env vars and diff them against my local .env" and get a one-off script for free. EnvDiff doesn't do something impossible without it — its real value is convenience, repeatability, and shareability with teammates who aren't running an agent, not a unique capability.

**Net:** real value-add, not a moat. Fits a low-effort, cheap-to-build experiment rather than a big recurring-revenue bet.

---

## 5. Product Form Factor

**Decision: a website, not a native app or browser extension.**

- No installation, opens with a URL, works instantly.
- Matches existing stack (Cloudflare Workers, Lemon Squeezy) — no new tooling to learn.
- Makes "team-shareable" trivial (send a link) — a native macOS app fundamentally can't do this the same way.
- A browser extension only makes sense if the tool needed to reach into local files/other apps automatically — it doesn't; paste or API-connect covers it.

---

## 6. Naming

Candidates considered:

| Name | Reasoning |
|---|---|
| **Driftcheck** (top pick) | "Config drift" is the real DevOps term for this exact problem — self-explanatory to any technical audience, credible, easy to say. `driftcheck.dev` / `.app` likely available. |
| EnvParity | Very descriptive ("are your environments in parity"), slightly longer. |
| NoDrift | Short, punchy, "fixes it" framing. |
| Varsync | Implies keeping variables in sync, useful if auto-sync features are added later. |
| Envdiff | Most literal (like `git diff` for env files), used as working name throughout planning so far; domain `envdiff.dev` referenced in conversation. |

**Action item:** check live domain availability before committing.

---

## 7. Platform Integrations

Not all providers let you read a value back once it's set — some are **write-only for secrets** by design (same pattern as password managers). This changes what the tool can honestly promise per platform.

### Read-back capability, verified

| Platform | Full value diff? | Notes |
|---|---|---|
| **Vercel** | ✅ Yes | Most vars fully readable via API (`decrypt=true`). Exception: vars marked "Sensitive" become write-only after creation, readable only during builds. |
| **Netlify** | ✅ Yes | Full read access via API/CLI (`netlify env:get`). |
| **Railway** | ✅ Yes | Full read access via GraphQL API. |
| **Heroku** | ✅ Yes | Config vars, fully readable via API. |
| **AWS Amplify** | ✅ Yes | Readable via API. |
| **DigitalOcean App Platform** | ✅ Yes | Readable via API. |
| **Cloudflare Workers/Pages** | ⚠️ Mixed | **Plain (non-secret) vars are readable** via API/dashboard. **Secrets are write-only** — you can list secret *names* but never read the value back once set. |
| **Fly.io** | ⚠️ Existence-only | Secrets are write-only by design — `fly secrets list` shows name + a hash, never the plaintext value. |
| **GitHub Actions secrets** | ⚠️ Existence-only | Write-only, same as Fly.io — API can confirm a secret exists but never returns its value. |
| **GitLab CI/CD variables** | ⚠️ Existence-only (for masked vars) | Similar write-protected pattern to GitHub for masked/protected variables. |
| **Render** | ❓ Unverified | Found `PUT` endpoints for setting vars; no confirmed `GET`-value endpoint in docs — test directly before committing. |
| **Supabase Edge Functions** | ❓ Unverified | Likely write-only for secrets, needs direct verification. |
| **Deno Deploy** | ❓ Unverified | Env vars, readable via API — needs direct verification. |
| **Docker Compose `.env`** | ✅ N/A (no API) | Just another local file format to parse alongside plain `.env` — no integration work beyond a parser. |

### What this means for the product

For write-only platforms (Fly.io, GitHub Actions, GitLab, and Cloudflare/Vercel *secrets specifically*), the tool can only say **"this key is missing"**, never **"this value doesn't match."** Still genuinely useful — missing keys are the more common bug — but must not be marketed as a full value-diff everywhere. Label existence-only integrations clearly in the UI.

### Recommended build order

1. **Vercel → Netlify → Railway** (full value-diff, strongest version of the product, ships fastest)
2. **Paste-only support for plain `.env` and Docker Compose `.env`** (zero API work, broadens reach immediately)
3. **Cloudflare Workers/Pages** (dogfood own stack; existence-only for secrets, full diff for plain vars)
4. **GitHub Actions** (existence-only, huge overlap with target audience)
5. Remaining platforms (Heroku, AWS Amplify, DigitalOcean, Fly.io, GitLab, Render, Supabase, Deno Deploy) — added based on actual user demand, not upfront.

---

## 8. Privacy & Security Model

Envly's whole pitch leans hard on privacy: *"collects no data · no account,"* everything stays on the user's Mac, values render as dots by default. A website is a fundamentally different trust model — the server *could* see data at some point — but it doesn't have to break the privacy story if designed deliberately.

| Feature | Where data flows | Privacy level |
|---|---|---|
| **Paste + compare (free)** | Comparison logic runs entirely in the browser (client-side JS). Pasted secrets never hit the server. | As private as Envly — "your secrets never leave your browser." |
| **Connect Vercel/Netlify (paid)** | Two options: (a) browser calls the provider's API directly using the user's own token — server never sees it; (b) request routed through our server (needed for OAuth "click to connect" flows) — values pass through briefly, not stored. | (a) fully private; (b) honest disclosure needed. |
| **Share with a teammate** | Requires the server to persist *something* so both people can open the link. | Store metadata only (which keys are missing/different) by default, not the actual secret values, unless the user explicitly opts in. Auto-expire shared links (Localdock's public-tunnel links expire in 1 hour — same pattern). |

**Rule for marketing copy:** never claim "we literally cannot see your secrets" the way Envly can (that's only true for a fully local app). The honest, still-strong claim is **"we never store your secret values"** — be explicit in the FAQ about exactly what does and doesn't touch the server, mirroring Envly's own transparent FAQ style. That kind of honesty is part of why a page like Envly's is trusted.

---

## 9. Pricing Strategy

**Recommendation: one-time payment, not a subscription, for the core product.**

### Reasoning

- This is a tool used occasionally (when debugging a broken deploy), not daily. A small monthly charge ($2-3/mo) for something used a couple times a year leads to fast cancellations, forgotten charges, and disputed payments.
- Small subscriptions also suffer disproportionate involuntary churn — failed card renewals silently kill recurring revenue without an explicit cancel.
- One-time payment matches the buyer psychology of this exact product category (Envly/Localdock both deliberately chose one-time over subscription specifically to differentiate from Doppler ($18/mo) and EnvKey ($10/mo)).

### Recommended structure

| Tier | Price | What's included |
|---|---|---|
| **Free** | $0 | Paste-and-compare, no login, client-side only. The growth/viral hook. |
| **Paid (core)** | **$15–19 one-time** | Connect Vercel/Netlify/Railway, save diffs, share links with teammates. |
| **Monitoring add-on** | **$4–6/month, optional** | Continuous background checks that alert (Slack/email/webhook) the moment environments drift — this is the one feature that's genuinely ongoing work, so it's the one part worth recurring revenue. Everything else stays one-time. |

### Why one-time ≠ "no revenue"

Revenue still grows — just from **new customers arriving** (via free-tool virality) rather than the same customers paying repeatedly. Example: 500 people discover it this year, 5% buy at $15 → $375. If it grows to 3,000 discoveries next year at the same 5% conversion → $2,250. Real, growing revenue, powered by reach rather than retention.

---

## 10. Technical Architecture

**Principle: keep the API as the single source of truth. Every future "platform" (web UI, MCP server, CLI, extension) is a thin client that calls the same backend — not a reimplementation.** This avoids needing a monorepo for a long time.

### Phase 0 — This weekend
- One Cloudflare Worker + D1, one plain repo.
- Free paste-and-compare (client-side diff), no login.

### Phase 1 — Once there's real usage
- Same single repo. Add provider connections, Lemon Squeezy checkout, saved/shared diffs.
- Still no reason to restructure — it's one app growing bigger.

### Phase 2 — If it's working: add the MCP server
- Thin package that just calls the existing Worker API. No real logic of its own.
- Can live as its own small repo/folder — no monorepo tooling needed yet, nothing shared to manage.

### Phase 3 — Only once there are 3+ front doors (web, MCP, CLI, VS Code extension) needing the same core logic
- **This** is when a monorepo (pnpm workspaces / Turborepo) earns its cost — pull the shared diff logic and types into one package all clients depend on.
- Not before — monorepo tooling is real overhead with zero benefit when there's only one deployable thing.

**Bottom line: don't set up a monorepo now.** Build Phase 0 as a normal single repo.

---

## 11. Distribution Strategy (MCP, CLI, Extensions)

| Channel | Purpose | Monetize directly? |
|---|---|---|
| **Website** | Core product | ✅ Yes — this is where the money stays. |
| **MCP server** | Free, thin client Claude Code/Cursor can call directly instead of writing a throwaway diff script. Turns the "AI agent could just do this" objection into a growth channel — Localdock already validates this move for the same audience. | ❌ No — free, treat as distribution/trust-building. |
| **CLI** | Enables CI/CD pipeline use (e.g. "fail this deploy if a required env var is missing in production") — a meaningfully different, higher-value use case for teams. | Bundled into paid tiers, not sold separately. |
| **VS Code extension** | More build effort, notoriously hard to monetize directly (users expect free extensions). | Skip for v1 — revisit only if users specifically ask. |

---

## 12. Full Vision — Growth Stages

1. **The hook (free)** — paste two `.env` files, see the diff. Drives trial and sharing.
2. **The paid core** — connect Vercel/Netlify/Railway, save, share. One-time payment.
3. **More platforms** — add integrations one at a time based on actual demand (see [Section 7](#7-platform-integrations)).
4. **It watches for you** — background monitoring + alerts (Slack/email/webhook) on drift. The natural subscription tier, because it's ongoing work.
5. **Plugs into existing workflows** — free MCP server; CLI for CI/CD gating (block a deploy if required vars are missing).
6. **Small-team product** — multiple projects per account, multiple teammates, a change log. Justifies a team-priced tier above the solo price.
7. **The ceiling** — at full scale, this resembles a much cheaper, simpler Doppler/EnvKey alternative. Not something to plan around from day one.

**Realistic take:** most tools like this settle happily at Stage 2–3 as solid side income for modest upkeep — a good outcome for a solo-founder revenue tool. Stages 4–7 are "if it clearly works and people keep asking," not a starting plan.

---

## 13. Competitive Landscape

No dominant free competitor found for env-var diffing specifically at time of research (2026-08-24) — this is a meaningful gap, unlike the webhook-inspector space (see [Section 14](#14-related-idea-considered--parked-webhook-inspector)).

Adjacent/partial competitors to be aware of (not direct env-diff tools, but occupy nearby territory):
- **Doppler**, **EnvKey**, **Infisical**, **1Password**, **AWS Secrets Manager** — dedicated secret managers. Anyone already using one has already solved config drift a different way; not integration targets, more like adjacent competitors for teams with more mature setups.

---

## 14. Related Idea Considered & Parked: Webhook Inspector

**Idea:** unique URL catches any webhook (Stripe, GitHub, etc.), shows/replays payloads. Worker + D1, no auth beyond the URL itself. Estimated a weekend build. Considered pricing: $9 one-time or a few dollars/month for history retention (the storage/retention piece is genuinely ongoing work, unlike the core diff tool — a rare case where recurring pricing fits naturally).

**Why parked:** this market is already crowded, unlike env-diffing.

| Existing tool | Notes |
|---|---|
| **Webhook.site** | Dominant free option — instant URL, 100 free requests/7-day expiry, paid from $7.50/mo for permanent URLs + replay. |
| **Beeceptor**, **RequestBin**, **HookListener** | Similar catch-and-inspect tools, several with permanent free URLs. |
| **ngrok** | Different angle (tunnels local server publicly) but has an inspector + replay, $8/mo. |
| **Hookdeck** | Enterprise-grade routing/transformation/monitoring — not really solo-dev territory anymore. |
| **Codehooks** | Open-source, self-hostable version of the same idea. |

**Decision:** deprioritized in favor of EnvDiff, which has a clearer gap. Revisit only with a genuinely different angle (e.g., provider-aware pretty-printing for Stripe/GitHub specifically, or bundled as a feature inside a larger tool) rather than "another catcher URL."

---

## 15. Open Decisions / Next Steps

- [ ] Confirm domain availability for **Driftcheck** (top name pick) and fallback **Envdiff**.
- [ ] Verify Render, Supabase Edge Functions, and Deno Deploy API read-access behavior directly (docs were inconclusive).
- [ ] Build Phase 0: free paste-and-compare page, client-side only diff logic, no login.
- [ ] Write the privacy FAQ upfront (per [Section 8](#8-privacy--security-model)) before adding any "connect" integrations — decide honestly what touches the server for each feature before shipping it, not after.
- [ ] Set up Lemon Squeezy checkout for the one-time paid tier once Phase 1 (provider connections) is ready.
- [ ] Decide OAuth vs. user-pasted-token approach for Vercel/Netlify/Railway connections (affects whether values ever touch the server).
