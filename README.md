# Calorie Tracker

Mobile-first web app (Dutch UI) for logging daily food and drink intake by portion (grams or milliliters), tracking calories and macros against daily targets, and viewing trends over time.

**Status:** Phases 0–11 complete — build-ready for Netlify deploy. Full build history: [`execution-logs/`](execution-logs/).

## Features

| Area | Description |
|------|-------------|
| **Vandaag** (`/`) | Today's macro stats vs targets, searchable combobox add flow, portion preview, quick-add new food (create + log), today's consumption log modal |
| **Trends** (`/trends`) | Chart.js dual-axis line chart — 7 / 30 day rolling window, legend toggles, dashed target reference lines |
| **Instellingen** (`/settings`) | Edit all five daily targets (calories max; protein, fibres, fats, carbs min) |
| **Catalogus** (`/catalog`) | Searchable food catalog; add or edit via modals (no delete — historical references preserved) |
| **Auth** | Single-user password gate; `sessionStorage` session; reads open, writes require token; no logout |

Macros scale proportionally from catalog reference portions (`amount / referenceAmount`). Consumption stores `{ itemId, amount, unit }` only — no macro snapshots.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Astro 6 (SSR, `@astrojs/netlify`) |
| Client | Alpine.js 3 via `@astrojs/alpinejs` + `app.factory.js` |
| Styles | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Data | Astro Actions; in-memory (dev) / Netlify Blobs (prod) |
| Charts | Chart.js 4 (dynamic import on trends page) |
| Dates | dayjs (`date.service.js`) |
| Language | UI copy in `src/lib/copy/nl.js`; `<html lang="nl">` |

**Node:** `>=22.12.0` (see `netlify.toml`)

## Getting started

```bash
npm install
npm run dev      # http://localhost:4321 — in-memory persistence (resets on restart)
npm run build    # production SSR bundle → dist/
npm run preview  # preview production build locally
```

**Login:** password is configured server-only in [`src/lib/auth/password.server.js`](src/lib/auth/password.server.js). After login, `sessionStorage` holds `isLoggedIn` and `writeToken`.

### Verification

```bash
npm run build
node scripts/verify-phase-4.mjs   # domain, MRU sort, portion scaling, hydrate
node scripts/verify-phase-11.mjs  # guards, anti-patterns, blob smoke, checklist
```

## Routes

| Route | Auth | Page |
|-------|------|------|
| `/login` | Public (redirects to `/` when logged in) | Password login |
| `/` | Protected | Today — stats, add flow, modals |
| `/trends` | Protected | Trends chart |
| `/settings` | Protected | Daily targets |
| `/catalog` | Protected | Food catalog |

Protected routes use a client guard in [`AppLayout.astro`](src/layouts/AppLayout.astro).

## Project structure

```text
public/
  items.json          # seed catalog (5–10 example foods)
  consumption.json    # seed consumption (starts [])
  preferences.json    # seed daily targets

src/
  actions/            # Astro Actions (login, loadData, mutations + write token)
  components/
    auth/             # LoginForm
    catalog/          # CatalogList, CatalogRow, CatalogEditPanel
    forms/            # CatalogForm, QuickAddForm, PreferencesForm
    today/            # MacroBars, ItemCombobox, PortionInput, DayActions, …
    trends/           # PeriodToggle, TrendChart
    ui/               # BottomNav, Modal, Toast, Button, Input, ProgressBar
  layouts/            # BaseLayout, AppLayout, LoginLayout
  lib/
    app.factory.js    # Alpine entry: stores, page data, SSR hydrate
    auth/             # password (server), session (client), write-token guard
    charts/           # trendChart.client.js
    config/           # app metadata, environment (memory vs blob)
    copy/nl.js        # all Dutch UI strings
    data/             # repositories, seed loader, date service
    domain/           # portion scaling, consumption, trends, preferences
    pages/            # Alpine.data factories per page
    stores/           # appStore, modalStore
  pages/              # index, login, trends, settings, catalog
  styles/global.css   # Tailwind + @theme design tokens

scripts/
  verify-phase-4.mjs
  verify-phase-11.mjs

execution-logs/       # phase 0–11 task logs, DoD, summaries
```

## Architecture

- **Alpine stores:** `appStore` (data + UI + toasts), `modalStore` (modals/forms), `config` / `app` (metadata)
- **SSR → client:** protected pages inject `window.__APP_INITIAL__`; `appStore.hydrate()` merges once in `app.factory.js`
- **Writes:** all mutations via Astro Actions with `writeToken` from `sessionStorage`
- **Portion math:** single source in `src/lib/domain/portion.service.js`
- **Persistence:** memory repository in dev; Netlify Blobs (`items`, `consumption`, `preferences` keys) in production; seeds from `public/*.json` when empty
- **Midnight rollover:** `dayRollover.client.js` watches date change and calls `ensureToday`

### Conventions

- Expression-string Alpine props in `x-for` children (e.g. `title="item.name"` → `x-text={title}`)
- No Nanostores, manual `Alpine.start()`, `querySelector` state sync, `innerHTML` UI, or `alert()`
- UI strings only in `src/lib/copy/nl.js`

## Deploy (Netlify)

1. Connect repo to Netlify (build command and publish directory are auto-detected for Astro).
2. Ensure `NODE_VERSION` is 22 (`netlify.toml`).
3. Enable Netlify Blobs for the site — production uses blob persistence automatically via `getEnvironmentConfig()`.

No extra env vars required for the password; it lives in `password.server.js` (change before deploying to a shared environment).

## Documentation

| File | Purpose |
|------|---------|
| [`PROMPT.md`](PROMPT.md) | Full product + technical spec (English) |
| [`EXECUTION_PLAN.md`](EXECUTION_PLAN.md) | Phased build plan (phases 0–11 complete) |
| [`CHAT_SUMMARY.md`](CHAT_SUMMARY.md) | Handoff summary for AI / contributors |
| [`execution-logs/`](execution-logs/) | Per-phase task logs, DoD, and summaries |

## Build phases (summary)

| Phase | Delivered |
|-------|-----------|
| 0 | Astro + Netlify + Alpine + Tailwind scaffold |
| 1 | Seed JSON, domain services, Dutch copy, date helpers |
| 2 | Memory + blob repositories, seed-on-empty |
| 3 | Auth, eight Astro Actions, write-token protection |
| 4 | `appStore`, `modalStore`, factory, SSR hydrate, day rollover |
| 5 | Shared UI — BottomNav, Toast, Modal, layouts |
| 6 | Login page and route guards |
| 7 | Home — macro bars, combobox, portion add, modals |
| 8 | Catalog — list, add/edit modals, edit confirm |
| 9 | Settings — preferences form |
| 10 | Trends — Chart.js dual-axis, period toggle, target lines |
| 11 | QA — guards, anti-pattern audit, build + blob smoke |

See [`execution-logs/phase-11/phase-11-dod.md`](execution-logs/phase-11/phase-11-dod.md) for final verification criteria.
