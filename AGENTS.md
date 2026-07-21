# AGENTS.md

> For AI coding agents (Hermes-Agent, Claude Code, Cursor, OpenCode, etc.)

## Project

Streak Calendar - open-source habit tracking app with GitHub-style activity grids, timed tasks, and multi-calendar support.

## Core Development Rules

### Think Before Code

- Don't assume. Don't hide confusion. Surface tradeoffs.
- State assumptions. Uncertain? → ask.
- Multiple interpretations? → present, no silent pick.
- Simpler path exist? → say so. Push back.
- Unclear? → stop. Name confusion. Ask.

### Simplicity First

- Min code that solve problem. Nothing speculative.
- No features beyond specifications.
- No abstractions for single-use code.
- No "flexibility"/"configurability" not requested.
- No error handling for impossible cases.
- 200 lines could be 50? → rewrite.
- Test: senior eng call overcomplicated? Yes → simplify.

### Goal-Driven Execution

- Define success. Loop until verified.
- "Add validation" → write failing tests, make pass.
- "Fix bug" → write reproducing test, make pass.
- "Refactor X" → tests pass before and after.
- Multi-step? → state plan: [step] → verify: [check].

### Approach

- Think before acting. Read existing files before writing code.
- Concise output, thorough reasoning.
- Prefer editing over rewriting whole files.
- Don't re-read files unless changed.
- Test code before declaring done.
- Solutions simple and direct.
- User instructions always override this file.

### Efficiency

- Read before write. Each file once.
- Edit over rewrite. No write-delete-rewrite cycles.
- Test once, fix, verify once.
- Budget: 50 tool calls.
- Stuck? → ask. No dead ends.
- Never guess paths.

### Testing / Committing

- DON'T run checks. ALWAYS ASK USER for explicit confirmation before running any verification, linting, type-check, or build commands.
- DON'T commit changes without explicit user confirmation.
- Before ending task, ask whether to run checks and commit.
- If user confirms committing, generate Conventional Commits message summarizing diff concisely.
- `npm run lint` - ESLint
- `npm run format` - Prettier
- `npm run build` - Next.js production build
- `npm run dev` - development server

### Code Style

Reference: `.cursorrules` — read this for project-specific code conventions.

#### Naming Conventions

- Files (kebab-case) & React components (PascalCase)
- Variables/functions (camelCase) & Types/interfaces (PascalCase)
- Constants (UPPER_SNAKE_CASE)

#### Formatting

- Indentation: 2 spaces
- Line width: 100 characters
- Strings: Double quotes
- Semicolons: Always
- Trailing commas: None (ES5 compatibility)

#### React / Next.js Rules

- Minimize `'use client'` — favor React Server Components
- Wrap client components in `Suspense` with fallback
- Use dynamic loading for non-critical components
- Functional components with `function` keyword for pure functions
- Named exports for components
- No unnecessary curly braces in conditionals

#### TypeScript Rules

- Strict mode enabled
- No unused variables
- Prefer `interface` over `type` for object shapes
- No enums — use string literal unions or maps
- Branded IDs via `Id<T>` type for database entities
- Never use `!` non-null assertion

#### UI / Styling Rules

- shadcn/ui + Radix UI + Tailwind CSS
- Mobile-first responsive design
- Use semantic Tailwind tokens (`bg-card`, `text-muted-foreground`) — NOT hardcoded colors
- Dark mode via `next-themes` — no hardcoded light/dark classes
- `aria-label` required on every icon-only button
- Respect `prefers-reduced-motion`

### Security Rules (Critical)

> This project had a security audit with multiple auth bypass findings. These rules are non-negotiable.

- **Every Convex `query` and `mutation` MUST call `ctx.auth.getUserIdentity()` and verify `userId` ownership.** No exceptions. Even `get`-by-ID queries.
- **No `v.any()` in validation schemas.** Always validate input shape explicitly.
- **Middleware auth bypass:** Only `/_next/*` and known static extensions skip auth. Never use `pathname.includes('.')`.
- **Rate limits:** Add upper bounds on count parameters (e.g., `count > 100` → reject).
- **Import size caps:** Max ~50 calendars, ~200 habits, ~10K completions per import.

### Git Workflow

- **NEVER commit directly to `main`** — all changes via PRs
- Work on feature branches: `feature/`, `fix/`, `refactor/`, `docs/`
- Open PRs targeting `main`

### Best Practices

- Follow existing code patterns
- Responses concise (1-3 sentences)
- Comments explain "why" not "what"
- Update `changelog.md` for notable changes. Follow [Keep a Changelog](https://keepachangelog.com/) sections: Added, Changed, Deprecated, Removed, Fixed, Security

## Changelog Maintenance

**For all PRs/commits affecting functionality:**

- Update `changelog.md` under `[Unreleased]`
- Categories: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`, `Breaking Changes`
- List changes with implementation details

### Project Structure

```
convex/                  # Convex backend (schema, mutations, queries, scheduled functions)
  auth.config.ts         # Clerk auth configuration
  calendar_sync.ts       # Import/export logic
  calendars.ts           # Calendar CRUD + cascade delete
  habits.ts              # Habit CRUD + completion tracking + timer scheduling
  migrations.ts          # Schema migrations
  schema.ts              # Database schema (calendars, habits, completions)
src/
  app/
    [locale]/            # Internationalized routes (next-intl)
      about/             # About page
      calendar/          # Main calendar view
      calendars/         # Calendar management
        [calendarId]/    # Calendar detail
      habits/            # Habit management
        [habitId]/       # Habit detail
      pricing/           # Pricing page
    globals.css          # Global styles + CSS variables
    layout.tsx           # Root layout
    providers.tsx        # App providers (IntlProvider, ThemeProvider, etc.)
  components/
    analytics/           # Google Analytics + Vercel analytics
    calendar/             # Calendar components (grid, row, yearly, day cells, dialogs)
      details/           # Calendar detail sub-components (edit, delete, habits list)
    habit/                # Habit components (details, analytics, statistics, edit)
      details/           # Habit detail sub-components (edit, delete, activity calendar)
    ui/                   # shadcn/ui primitives + custom controls (timer, confetti, toast)
  hooks/                  # Custom React hooks (calendar data, dialog state, import/export)
  i18n/                   # Internationalization config + metadata
  lib/                    # Utilities (metadata, request, routing, settings)
  messages/               # Translation JSON files (en, ar, de, es, fr, he, hi, ru, zh)
  utils/                  # Color utilities, completion helpers
  middleware.ts            # Clerk auth middleware
  types.ts                # TypeScript types (Calendar, Habit, Completion, branded Id)
```

## Known Issues (From Security Audit)

> Addressed on branch `fix/security-audit-top10`.

| # | Issue | Severity | File(s) |
|---|-------|----------|---------|
| 1 | `cancelScheduledIncrement` — no auth check | Critical | `convex/habits.ts` |
| 2 | `habits.get()` / `calendars.get()` — no ownership check | Critical | `convex/habits.ts`, `convex/calendars.ts` |
| 3 | Timer negative delay — no clamp | Critical | `convex/habits.ts` |
| 4 | Middleware bypass — `pathname.includes('.')` too broad | Major | `src/middleware.ts` |
| 5 | `importData` — `v.any()` fallback disables validation | Major | `convex/calendar_sync.ts` |
| 6 | `markComplete` — unbounded count param | Major | `convex/habits.ts` |
| 7 | Non-atomic cascade delete (N+1 queries) | Major | `convex/calendars.ts`, `convex/habits.ts` |
| 8 | Timezone mixing (UTC frontend, local backend) | Major | `convex/habits.ts`, `src/hooks/use-calendar-data.ts` |
| 9 | Tailwind v4 dep with v3 config — half-migrated | Major | `package.json`, `tailwind.config.ts` |
| 10 | Dual package managers (npm + pnpm lock files) | Major | `package-lock.json`, `pnpm-lock.yaml` |
