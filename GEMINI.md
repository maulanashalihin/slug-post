# GEMINI.md - SlugPost (Markdown Publisher)

## Project Overview
**SlugPost** (built with the **Laju** framework) is a high-performance, full-stack TypeScript web application for instant markdown publishing. It allows users to share markdown content as beautiful web pages with custom URLs, requiring no registration while providing secure "edit tokens" for content management.

### Main Technologies
- **Backend:** [HyperExpress](https://github.com/kartikk221/hyper-express) (high-performance web server), [Knex.js](https://knexjs.org) (SQL query builder), [BetterSQLite3](https://github.com/WiseLibs/better-sqlite3) (embedded database).
- **Frontend:** [Svelte 5](https://svelte.dev), [Inertia.js](https://inertiajs.com) (modern monolith architecture), [TailwindCSS](https://tailwindcss.com).
- **Templating:** [Eta](https://eta.js.org) (server-side rendering for non-Inertia pages).
- **Markdown:** [markdown-it](https://github.com/markdown-it/markdown-it) with `highlight.js` and `markdown-it-anchor`.
- **Language:** TypeScript throughout.

### Architecture
SlugPost follows an MVC-inspired architecture adapted for the Inertia.js stack:
- **`server.ts`**: Entry point that boots the HyperExpress server and registers global middlewares (CORS, Inertia).
- **`app/controllers/`**: Contains request handlers (e.g., `PostController`, `AuthController`).
- **`app/services/`**: Core business services including Database (`DB.ts`), View Rendering (`View.ts`), and Auth.
- **`routes/web.ts`**: Centralized route definitions for SEO, Public, Post, S3, and Auth.
- **`resources/js/`**: Frontend source using Svelte 5 and Inertia.
- **`resources/views/`**: Server-side Eta templates (e.g., `post.html`, `inertia.html`).
- **`migrations/`**: Knex database schema migrations.

---

## Building and Running

### Prerequisites
- **Node.js**: 18+
- **Database**: SQLite (local `dev.sqlite3`)

### Key Commands
- **Install Dependencies:**
  ```bash
  npm install
  ```
- **Environment Setup:**
  ```bash
  cp .env.example .env
  # Configure PORT, APP_URL, etc.
  ```
- **Database Migrations:**
  ```bash
  npx knex migrate:latest
  ```
- **Development Server:**
  ```bash
  npm run dev
  # Runs Vite (for assets) and Nodemon (for the server) concurrently.
  ```
- **Production Build:**
  ```bash
  npm run build
  # Compiles assets with Vite and transpiles TypeScript with TSC.
  ```

---

## Development Conventions

### Routing & Controllers
- All routes are defined in `routes/web.ts`.
- Use `response.inertia(page, props)` for Svelte-based pages.
- Use `view(template, data)` from `app/services/View` for server-rendered HTML pages.
- Group logic into controllers within `app/controllers/`.

### Database & Migrations
- Use **Knex** for all database operations via the `DB` service (`app/services/DB.ts`).
- New schema changes MUST be implemented via migrations in the `migrations/` directory:
  ```bash
  npx knex migrate:make migration_name
  ```

### Frontend Development
- **Svelte 5:** Utilize the latest Svelte 5 syntax and runes (`$state`, `$derived`, etc.).
- **Styling:** Use **TailwindCSS** utility classes. Avoid custom CSS unless necessary.
- **Components:** Place reusable components in `resources/js/Components/` and full pages in `resources/js/Pages/`.

### Markdown Rendering
- Markdown is rendered server-side using `markdown-it` in `PostController.ts`.
- Security: `html: false` is set in the markdown-it configuration to prevent XSS.

### Testing
- Refer to `skills/testing-guide.md` for specific testing instructions (if applicable).
- Benchmark results are available in `benchmark/result.md`.
