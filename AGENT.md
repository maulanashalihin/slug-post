# SlugPost — Project Context

Framework: **Laju** (HyperExpress + Svelte 5 + Inertia.js) | DB: **better-sqlite3** (langsung, via `app/repositories/`) | Knex hanya devDeps untuk migrasi

## 🚀 Quick Commands

```bash
npm run dev         # Vite + nodemon (concurrent)
npm run build       # Vite build + tsc
npm run migrate     # Knex migrate:latest
npm run seed        # Knex seed:run
```

## 🧠 Critical: SSR vs Inertia Decision

| Route Type | Use | Method |
|-----------|-----|--------|
| Public + SEO | SSR (Eta) | `view("template", data)` |
| Public + No SEO | Inertia | `response.inertia("Page", data)` |
| Protected (auth) | Inertia | `response.inertia("Page", data)` |

## 📦 Project .llm-wiki (Detailed Knowledge)

Seluruh pengetahuan detail ada di `.llm-wiki/wiki/`:

- **entities/slugpost-platform** → project overview
- **concepts/laju-architecture** → arsitektur & middleware
- **concepts/route-structure** → semua routes
- **concepts/database-schema** → schema & auth flow
- **concepts/code-conventions** → controller patterns + repository pattern
- **concepts/svelte-inertia-pages** → Svelte 5 + Inertia patterns
- **concepts/eta-ssr-templates** → Eta template engine for SSR
- **concepts/dev-workflow** → commands & env vars

## ⚡ Key Conventions

- Controller: `export default new Controller()`, **no `this`**
- **Repository Pattern** — semua query di `app/repositories/` (posts, users, sessions, assets, dll)
  - Import: `import { posts } from "../repositories/posts"`
  - Pakai: `posts.findBySlug(slug)`, `posts.create({...})`, `posts.incrementView(id)`
  - `better-sqlite3` langsung: `db.prepare("SELECT ...").get(...)`
- Auth: `auth.ts` (required) / `optionalAuth.ts` (optional), cookie `auth_id`
- Svelte: JS only (no TS), runes (`$state`, `$props`), `use:inertia` directive
- Flash: `response.flash("success/error", msg)` → `let { flash } = $props()`
- Markdown rendering: server-side, `html: false` for XSS prevention
