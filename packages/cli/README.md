# envdiff

Catch config drift in CI — fail a deploy before it ships with a missing or wrong environment variable, instead of finding out from a crash report.

Free to compare two local files. Connecting to a live provider (Vercel, with more on the way) needs a one-time [EnvDiff](https://envdiff.dev) license — the same one that unlocks the web app.

## Install

```bash
npm install -g @envdiff/cli
```

Or skip the install and use `npx @envdiff/cli` directly in a pipeline.

## Quick start

Compare two local files — free, no license, no network call beyond reading the files:

```bash
envdiff check --local .env --against .env.production
```

Pull straight from Vercel instead:

```bash
envdiff license set ENVDIFF-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX   # once, saves it to ~/.envdiff/config.json
envdiff check --local .env --vercel-project my-app --vercel-token $VERCEL_TOKEN
```

Or check that a fixed list of keys exists, with nothing to compare against:

```bash
envdiff check --local .env --required DATABASE_URL,STRIPE_KEY,JWT_SECRET
```

## In CI (GitHub Actions example)

```yaml
- name: Check env vars before deploy
  run: npx @envdiff/cli check --local .env.example --vercel-project my-app
  env:
    VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
    ENVDIFF_LICENSE: ${{ secrets.ENVDIFF_LICENSE }}
```

`envdiff check` exits `1` when drift is found (per `--fail-on`) and `0` when it's clean — that's what fails the pipeline step. It exits `2` for a setup problem (bad license, unreachable Vercel, missing file), so you can tell "your config is broken" apart from "the check itself couldn't run."

## `envdiff check`

| Flag | Default | What it does |
|---|---|---|
| `--local <path>` | `.env` | The file to check |
| `--against <path>` | — | Compare against another local file. Free, no license. |
| `--vercel-project <idOrName>` | — | Pull the comparison side from a Vercel project. Requires a license. |
| `--vercel-env <target>` | `production` | `production`, `preview`, or `development` |
| `--vercel-token <token>` | `$VERCEL_TOKEN` | Vercel access token |
| `--license <key>` | `$ENVDIFF_LICENSE` or the saved one | Required only when using `--vercel-project` |
| `--required <keys>` | — | Comma-separated keys that must exist in `--local`. No second source needed. |
| `--fail-on <mode>` | `missing` | `missing`, `different`, `any`, or `none` (report only, never fail) |
| `--api <url>` | `https://envdiff.dev` | Override the API base — useful against a local dev Worker |
| `--json` | — | Machine-readable output instead of a table |

## `envdiff license`

```bash
envdiff license set <key>     # validate and save a license locally
envdiff license show          # print the saved key, masked
envdiff license remove        # clear it
```

The license is stored in `~/.envdiff/config.json` (mode `0600`). In CI, skip this and pass `--license`/`ENVDIFF_LICENSE` per-run instead — most CI runners are ephemeral, so there's nothing to persist between builds anyway.

## Privacy

Only key *names* and *statuses* (`match` / `different` / `missing`) are ever printed or exported. Provider tokens go straight from your machine to the provider's own API — never through EnvDiff's servers. See [envdiff.dev](https://envdiff.dev) for the full privacy write-up.
