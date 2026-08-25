# envDIFF.dev

Catch config drift before it breaks prod. Paste two `.env` files and compare them in the browser — no signup, nothing leaves your tab.

**Current release:** [v0.1.0](./CHANGELOG.md#010--2026-08-25) · production branch: `gamma`

## Stack

React + TypeScript + Vite · Cloudflare Workers

## Scripts

```bash
npm install
npm run dev
npm run build
npm run deploy   # build + deploy to Cloudflare Worker (envdiff-worker)
```

Live: [envdiff.dev](https://envdiff.dev)
