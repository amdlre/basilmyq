# basilmyq.com

Personal portfolio and full CMS for [basilmyq.com](https://basilmyq.com).

Built with Next.js 16 (App Router, Turbopack, React 19), TypeScript in strict mode,
Tailwind CSS v4, shadcn/ui, Prisma + PostgreSQL, and `next-intl` with Arabic (default)
and English, both fully bidirectional.

The engineering rules that govern every change live in [`AGENTS.md`](./AGENTS.md).
The full specification lives in [`SPEC.md`](./SPEC.md).

## Getting started

```bash
cp .env.example .env.local   # then fill in the values
npm install
npm run dev
```

The site is served from `/ar` and `/en`; `/` redirects to the default locale.

### Database

Set `DATABASE_URL` in `.env.local`, then:

```bash
npm run db:push    # create the tables
npm run db:seed    # load starter content
npm run db:studio  # browse it
```

> **The seed is sample data, not a CV.** Every employer, client, credential and
> testimonial in `prisma/seed.ts` is a deliberately generic placeholder — no quote was
> said by anyone and nothing is attributed to a real company or person. It exists only to
> give the dashboard realistically shaped rows. Replace all of it from the dashboard once
> Phase 4 is in place.

## Scripts

| Script               | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `npm run dev`        | Development server                         |
| `npm run build`      | Production build                           |
| `npm run start`      | Serve the production build                 |
| `npm run typecheck`  | `tsc --noEmit`                             |
| `npm run lint`       | ESLint                                     |
| `npm run format`     | Prettier write                             |
| `npm run db:push`    | Push the Prisma schema to the database     |
| `npm run db:migrate` | Create and apply a migration (development) |
| `npm run db:deploy`  | Apply migrations (production)              |
| `npm run db:seed`    | Seed the database                          |
| `npm run db:studio`  | Prisma Studio                              |

Before finishing any phase: `npm run typecheck && npm run lint && npm run build`.

## Build phases

- [x] **Phase 0** — Foundation: design system, theming, i18n + RTL, tooling
- [x] **Phase 1** — Database schema and seed
- [ ] **Phase 2** — Single-admin authentication
- [ ] **Phase 3** — Shared component engine (`DataTable`, `PageShell`, `FormSheet`, …)
- [ ] **Phase 4** — Dashboard modules
- [ ] **Phase 5** — Public site
- [ ] **Phase 6** — SEO, performance, accessibility
- [ ] **Phase 7** — Deployment to Coolify
