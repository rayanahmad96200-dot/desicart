# DesiCart

A Pakistani e-commerce storefront selling gadgets and accessories (smartwatches, earbuds, power banks, speakers, etc.), with a built-in Node.js admin panel for managing the product catalog.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server on port 3000
- `pnpm --filter @workspace/desicart run dev` — run the React storefront on port 5000
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional env: `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `PORT`

## Stack

- pnpm workspaces, Node.js 24 (Replit) / Node.js 22 (Hostinger), TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (core API); JSON file store (admin product catalog)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Admin: EJS templates served by Express at `/admin-panel/*`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (ESM bundle → `dist/index.mjs`)

## Where things live

```
artifacts/
  api-server/
    src/
      admin/
        db.ts          ← JSON-file product store (no native deps)
        routes.ts      ← all /admin-panel/* routes (login, dashboard, CRUD)
        views/         ← EJS templates (_header, _footer, login, dashboard, add_product, edit_product)
      app.ts           ← Express app setup (sessions, EJS engine, admin router, static files)
    data/
      products.json    ← product catalog (auto-created with seed data on first run)
    uploads/           ← uploaded product images (served at /admin-panel/static/uploads/)
    dist/
      index.mjs        ← Hostinger entry point
  desicart/            ← React + Vite storefront (port 5000 in dev)
packages/
  db/                  ← Drizzle ORM schema + PostgreSQL client
  api-spec/            ← OpenAPI spec + Orval codegen output
  api-zod/             ← generated Zod schemas
```

## Architecture decisions

- **No native SQLite** — `better-sqlite3` doesn't compile in Replit (no node-gyp/node headers). The admin product store uses a plain JSON file (`data/products.json`) instead. This is zero-dependency, works everywhere, and is fine for catalogs of < 1000 products.
- **Single Node.js process for Hostinger** — Express serves the React static build + EJS admin panel + REST API all from one process. Hostinger entry: `artifacts/api-server/dist/index.mjs`.
- **Path resolution is cwd-aware** — dev runs from `artifacts/api-server/` (Replit workflow), Hostinger runs from repo root. Both `db.ts` and `routes.ts` detect which context they're in via a regex on `process.cwd()`.
- **Vite proxy in dev** — the React dev server (port 5000) proxies `/admin-panel/*` and `/api/*` to the Express server (port 3000) so CORS is never an issue.
- **ejs / express-session / multer externalized** — these are left out of the esbuild bundle and resolved from `node_modules` at runtime (required for EJS file lookup and multer disk storage).

## Product

- Storefront: hero banner carousel (one slide per product), category nav, product grid, product detail pages, WhatsApp order button.
- Admin panel at `/admin-panel/login` (default: admin / desicart2024) — add, edit, delete products with image upload.
- Products API at `/admin-panel/api/products` — consumed by the React storefront.

## User preferences

- Hostinger-compatible: single Node.js app, build command `pnpm run build`, entry `artifacts/api-server/dist/index.mjs`, Node 22.x, pnpm.
- No native Node addons (no better-sqlite3, sharp, etc.) — use pure JS alternatives.

## Gotchas

- Always rebuild (`pnpm --filter @workspace/api-server run build`) after changing server-side TypeScript — the workflow auto-builds on start, but manual testing needs a fresh build.
- `data/products.json` is the live product catalog. Back it up before wiping the repo.
- Uploaded images go to `artifacts/api-server/uploads/`. Include this folder in the Hostinger deployment.
- On Hostinger, set `SESSION_SECRET` to a long random string. Default is `desicart-secret-change-me`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
