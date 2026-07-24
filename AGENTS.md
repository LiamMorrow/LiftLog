# LiftLog — agent guide

Paths below are relative to the repository root.

## Where work happens

The vast majority of work is in **`app/`** — an **Expo ~57 / React Native 0.86 / React 19** app.
Stack: expo-router (file-based routes in `app/src/app/`), Redux Toolkit, React Native Paper (Material 3),
Drizzle ORM + expo-sqlite, Tolgee i18n, React Compiler, TypeScript ~6.

`backend/` is a **.NET / C# Web API** (end-to-end-encrypted feeds + AI planner). It **usually does not
need changing** to add app features — only touch it when the task is explicitly backend work.

### Directory map (`app/src/`)

- `app/` — expo-router routes (file-based; the URL structure of the app).
- `components/`
  - `presentation/foundation/` — our very core, reusable UI primitives: buttons, cards, forms,
    dialogs, list items, `editors/`. Single-file primitives live flat; multi-file
    ones (platform-split `.android.tsx` + shared `-props`) get a folder with an `index.tsx` barrel
    (e.g. `menu/`, `page-actions/`, `switch/`). Reach for these before building a new control.
  - `presentation/<feature>/` — presentational components for one feature area: `feed/`, `calendar/`,
    `stats/`, `workout/`, `workout-editor/`, `ai-planner/`, `summary/`. Dumb-ish; take props.
  - `smart/` — container components that wire presentation up to state/services (providers, dialogs,
    managers, e.g. `exercise-manager.tsx`, `feed-item.tsx`).
  - `layout/` — page scaffolding (`stack-with-header.tsx`, scroll containers).
- `store/` — Redux Toolkit slices, thunks, and the app store.
- `services/` — business logic and platform integrations (sessions, feed, sync, etc.).
- `models/` — domain models and typed shapes, incl. `models/storage/versions/` (persisted-state migrations).
- `db/`, `drizzle/` — Drizzle ORM schema and the SQLite layer.
- `hooks/` — shared React hooks. `utils/` — pure helpers. `i18n/` — Tolgee translations.
- `gen/` — generated code; don't hand-edit.

Platform-specific implementations use the `foo.tsx` + `foo.android.tsx` split (Metro picks the variant).

## Check `docs/` before starting

**Start every task by reading [`docs/index.md`](docs/index.md)** — it lists every doc with a one-line
description, so you can tell in one read whether a doc covers the area you're about to touch. Read the
ones that do; they explain the patterns and architecture you'll need.

When you add, remove, rename, or repurpose a doc, **update `docs/index.md` in the same change** so the
index stays trustworthy.

`docs/schemas/` holds **generated** JSON schemas (ai-plan, program-blueprint, workout-worker).
Regenerate with `npm run json-schema`; don't hand-edit.

## Commands (run from `app/`)

- **Test:** `npm test` (Vitest watch) / `npm run test:coverage`. Runner is **Vitest**, not Jest — with
  jsdom, `@testing-library/react`, and fast-check for property tests.
- **Typecheck:** `npm run typecheck` (`tsgo --noEmit`, the native-preview compiler — not plain `tsc`).
- **Lint:** `npm run lint` (`oxlint && eslint .`). The oxc toolchain (oxlint/oxfmt) is primary; ESLint
  runs only the react-compiler rule.
- **Format:** `npm run format` (`oxfmt --write .`) / `npm run format:check`.
- **E2E:** `npm run e2e` (Maestro; flows live in `app/.maestro/`).

Run typecheck and lint before considering a change done.

## Conventions

- Use **named exports** for new files (`export function Foo`), not default exports — even though older
  files use defaults. Don't bulk-convert existing files.
- react-native-paper is being **incrementally migrated to expo-ui** (SwiftUI on iOS / Jetpack Compose on
  Android) using a platform-split file convention: `foo.tsx` + `foo.android.tsx` + shared `foo-props.ts`.
  For native `Host`s, seed theming with `colors.seedColor` (not `colors.primary`), let native components
  own their slot colors, and use `@expo/material-symbols` XML icons inside Compose.
- Comments explain non-obvious code for a future reader — don't narrate the diff.
- Backend (C#): format with CSharpier (`dotnet csharpier .`) before committing.

An untracked `CLAUDE.local.md` at the repo root may add machine- or author-specific workflow rules.
