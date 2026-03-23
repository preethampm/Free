# AGENTS.md — Feedback Platform

## Project Overview

A self-service feedback platform built with Next.js 16. Organizers create events with custom items and criteria, attendees scan QR codes to rate items, and organizers see real-time leaderboards.

## Build / Lint Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (flat config, v9)
npm run generate-qr  # Generate QR code PNGs (legacy, not used currently)
```

**Type checking**: `npx tsc --noEmit` (no npm script — run manually)

**No test framework configured.** No Jest, Vitest, or Playwright. No test files exist.

**Always run `npm run lint` after changes.** Run `npm run build` before finishing to catch type errors.

## Tech Stack

- **Next.js 16.2.1** — App Router, Turbopack dev, `proxy.ts` (NOT `middleware.ts`)
- **React 19.2.4**
- **Tailwind CSS v4** — `@import "tailwindcss"`, `@theme inline` block, NO `tailwind.config.js`
- **Supabase** — `@supabase/ssr` for auth, `@supabase/supabase-js` for queries
- **TypeScript** — strict mode enabled
- **Fonts** — Geist Sans + Geist Mono via `next/font/google`

## Path Aliases

```
@/* → ./*  (project root)
```

Use `@/` for all internal imports:
```ts
import { createClient } from '@/src/lib/supabase/client'
import { Button } from '@/src/components/ui/button'
```

## Import Order

1. React / React-related
2. Next.js (`next/navigation`, `next/link`)
3. Third-party (`@supabase/ssr`, `html2canvas`)
4. Project imports via `@/`

No barrel files. Import directly from source files.

## Component Patterns

### Server vs Client

| Pattern | Directive | Use When |
|---|---|---|
| Server component | (none) | No interactivity, data fetching |
| Client component | `'use client'` | Event handlers, state, effects |
| Server action | `'use server'` | Mutations called from client |

**Default exports for pages**: `export default function PageName()`
**Named exports for components**: `export function Button()`

### Props Typing

Inline object type in function signature. No separate `Props` interface:
```ts
export function Button({
  children,
  onClick,
  variant = 'primary',
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}) { ... }
```

### Data Interfaces

Defined at top of page files, not exported, PascalCase:
```ts
interface Event {
  id: string
  name: string
  slug: string
}
```

## Naming Conventions

| What | Convention | Example |
|---|---|---|
| Page files | `page.tsx` | `app/create/page.tsx` |
| Component files | `kebab-case.tsx` | `score-grid.tsx`, `qr-card.tsx` |
| Lib/utility files | `kebab-case.ts` | `slug.ts`, `client.ts` |
| Dynamic routes | `[param]` folders | `app/e/[eventSlug]/page.tsx` |
| Route handlers | `route.ts` | `app/auth/callback/route.ts` |
| Components | PascalCase | `Button`, `ScoreGrid`, `QRCard` |
| Functions | camelCase | `createClient`, `handleCreate` |
| Variables | camelCase | `eventName`, `submitting` |
| Interfaces | PascalCase | `Event`, `LeaderboardRow` |

## Tailwind CSS Rules

- **No colors except black, white, and gray.** No gradients, no colored accents.
- Primary button: `bg-black text-white hover:bg-gray-800`
- Secondary button: `border border-gray-300 text-black hover:bg-gray-50`
- Borders over shadows: `border border-gray-200 rounded-lg` (max `rounded-lg`)
- Focus style: `focus:outline-none focus:border-black`
- Active press: `active:scale-[0.98]`
- Transitions: `transition-all`
- Disabled state: `bg-gray-200 text-gray-400 cursor-not-allowed`

## Supabase Patterns

**Two clients** — same function name `createClient()`, different import paths:
```ts
// Client components
import { createClient } from '@/src/lib/supabase/client'

// Server components / route handlers
import { createClient } from '@/src/lib/supabase/server'
```

**Query style**:
- Explicit columns: `.select('id, name, slug')` — never `*` in app code
- Use `.single()` for expecting one row
- Use `Promise.all([...])` for parallel queries
- Use `{ count: 'exact', head: true }` for counting
- Use `.upsert(rows, { onConflict: '...' })` for upserts

**Auth**:
- Server: `await supabase.auth.getUser()`
- Login: `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Protected routes via `proxy.ts` — update `protectedRoutes` array

## Next.js 16 Notes

- **`proxy.ts` replaces `middleware.ts`** — exported function must be named `proxy`
- **Viewport** must be exported separately from metadata:
  ```ts
  export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 1 }
  ```
- Turbopack is the default bundler in dev

## Error Handling

- Destructure Supabase responses: `const { data, error } = await supabase...`
- Log errors: `console.error('Context:', error)`
- Set loading/submitting state to false on failure
- Redirect to safe page if data not found: `router.push('/')`
- No global error boundary configured

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Stored in `.env.local` (gitignored). Never commit secrets.
