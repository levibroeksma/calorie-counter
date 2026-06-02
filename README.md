# Calorie Counter

Mobile-first web app (Dutch UI) for logging daily food and drink intake by portion (grams or milliliters), tracking calories and macros against daily targets, and viewing trends over time.

## Features

| Area | Route | Description |
|------|-------|-------------|
| **Vandaag** | `/` | Daily macro progress bars vs targets; searchable combobox (MRU-sorted); portion preview; add consumption; quick-add new food; today's log modal; remove with confirm dialog |
| **Trends** | `/trends` | Chart.js dual-axis line chart — 7 / 30 day rolling window; dashed target reference lines per macro |
| **Instellingen** | `/settings` | Edit five daily targets (calories max; protein, fibres, fats, carbs min) |
| **Catalogus** | `/catalog` | Searchable food catalog; add or edit via modals with edit confirmation (no delete — historical references preserved) |
| **Auth** | `/login` | Single-user password gate; `sessionStorage` session; reads open, writes require token; no logout |

**Data rules:** macros scale proportionally from catalog reference portions (`amount / referenceAmount`). Consumption stores `{ itemId, amount, unit }` only — no macro snapshots.

**Loading UX:** skeleton placeholders until `appStore` finishes its initial `loadData` fetch.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Astro 6 (SSR, `@astrojs/netlify`) |
| Client | Alpine.js 3 via `@astrojs/alpinejs` + `@alpinejs/anchor` |
| Styles | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Data | Astro Actions; in-memory (dev) / Netlify Blobs (prod) |
| Charts | Chart.js 4 (dynamic import on trends page) |
| Dates | dayjs with Dutch locale (`date.service.js`) |
| Language | UI copy in `src/lib/copy/nl.js`; `<html lang="nl">` |

**Node:** `>=22.12.0` (see `package.json` and `netlify.toml`)

## Getting started

```bash
npm install
npm run dev      # http://localhost:4321 — in-memory persistence (resets on restart)
npm run build    # production SSR bundle → dist/
npm run preview  # preview production build locally
```

### Login

Auth secrets are read from environment variables (see [`.env.example`](.env.example)):

```bash
cp .env.example .env   # then edit APP_PASSWORD and WRITE_TOKEN
```

After login, `sessionStorage` holds `isLoggedIn` and `writeToken`. **Use strong, unique values before deploying to any shared environment.**

### Dev tip (Chart.js)

If trends fails with a Vite optimize-deps error, restart the dev server or clear `node_modules/.vite`. Chart.js is pre-bundled in `astro.config.mjs`.

## Routes

| Route | Auth | Page |
|-------|------|------|
| `/login` | Public (redirects to `/` when logged in) | Password login |
| `/` | Protected | Today — stats, add flow, modals |
| `/trends` | Protected | Trends chart |
| `/settings` | Protected | Daily targets |
| `/catalog` | Protected | Food catalog |

Protected routes use a client guard in [`AppLayout.astro`](src/layouts/AppLayout.astro).

## Astro Actions

| Action | Auth | Purpose |
|--------|------|---------|
| `login` | Public | Validate password; return write token |
| `loadData` | Open | Load items, consumption, preferences, today |
| `ensureToday` | Write token | Create today's consumption day if missing |
| `addConsumption` | Write token | Log a portion |
| `removeConsumption` | Write token | Remove a log entry |
| `createItem` | Write token | Add catalog item (+ optional consumption) |
| `updateItem` | Write token | Edit catalog item |
| `updatePreferences` | Write token | Save daily targets |

## Seed data

On first load (empty store), data is seeded from:

```text
public/
  items.json         # 8 example foods
  consumption.json   # starts as []
  preferences.json   # default daily targets
  favicon.svg
```

## Project structure

```text
src/
  actions/              # Astro Actions + shared server helpers
  components/
    auth/               # LoginForm
    catalog/            # CatalogList, CatalogRow, CatalogEditPanel
    forms/              # CatalogForm, QuickAddForm, PreferencesForm
    today/              # MacroBars, ItemCombobox, PortionInput, DayActions, …
    trends/             # PeriodToggle, TrendChart
    ui/                 # BottomNav, Modal, Toast, ConfirmDialog, Skeleton, …
  icons/
  layouts/              # BaseLayout, AppLayout, LoginLayout
  lib/
    app.factory.js      # Alpine entry: stores, page components, initial load
    auth/               # password (server), session (client), write-token guard
    charts/             # trendChart.client.js
    config/             # app metadata, environment (memory vs blob)
    copy/nl.js          # all Dutch UI strings
    data/               # repositories, seed loader, date service
    domain/             # portion scaling, consumption, trends, preferences
    pages/              # Alpine.data / x-data factories per page
    stores/             # appStore, modalStore, day rollover watcher
  pages/                # index, login, trends, settings, catalog
  styles/global.css     # Tailwind + @theme design tokens

astro.config.mjs        # Netlify adapter, Alpine entrypoint, Tailwind, Chart.js optimizeDeps
netlify.toml            # NODE_VERSION = 22
tsconfig.json           # path aliases (@components, @lib, …)
```

## Architecture

```text
Browser (Alpine)
  appStore ──loadData / mutations──► Astro Actions
                                         │
                                         ▼
                                   getRepository()
                                    /          \
                            memory (dev)    Netlify Blobs (prod)
                                    \          /
                                     seed from public/*.json when empty
```

- **Alpine stores:** `appStore` (data, UI, toasts), `modalStore` (modals/forms), `config` / `app` (metadata)
- **Initial load:** `app.factory.js` calls `appStore.loadInitialData()` → `loadData` action; components show skeletons until `appStore.hydrated`
- **Writes:** mutations via Astro Actions with `writeToken` from `sessionStorage`
- **Portion math:** single source in `src/lib/domain/portion.service.js`
- **Midnight rollover:** `dayRollover.client.js` polls local date + visibility changes → `ensureToday`
- **Modals with forms:** use Alpine `x-if` so form bindings mount only after `modalStore.open()` sets `form`

### Conventions

- UI strings only in `src/lib/copy/nl.js`
- Expression-string Alpine props in `x-for` children (e.g. `title="item.name"` → `x-text={title}`)
- Astro frontmatter: data only (imports, `nl`, SSR values) — no class helpers
- Path aliases: `@components/*`, `@lib/*`, `@ui/*`, etc. (see `tsconfig.json`)

## Deploy (Netlify)

1. Connect [GitHub repo](https://github.com/levibroeksma/calorie-counter) to Netlify.
2. Build command and publish directory are auto-detected for Astro (`astro build` → `dist/`).
3. Ensure Node 22 (`netlify.toml` sets `NODE_VERSION = "22"`).
4. Enable Netlify Blobs — production persistence is selected automatically via `getEnvironmentConfig()`.
5. In **Site configuration → Environment variables**, add:
   - `APP_PASSWORD` — login password
   - `WRITE_TOKEN` — server-side token returned on login; must match what the client sends on writes

   Use the same keys as in [`.env.example`](.env.example). Astro reads them at runtime via `astro:env/server` (not inlined at build time).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server with in-memory data |
| `npm run build` | Production SSR build |
| `npm run preview` | Preview production build locally |
