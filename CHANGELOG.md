# Changelog

All notable changes to **envDIFF** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.1.0]: https://github.com/admin-envdiff/envDIFF.dev/releases/tag/v0.1.0
