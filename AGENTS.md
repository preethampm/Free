# AGENTS.md — Votu

## Project Identity

**Name**: votu (always lowercase)
**Tagline**: Rate what matters.
**Domain**: votu.pppppppppp.live
**Deployment**: Vercel (auto-deploy on push to `main`)

Votu is a live event feedback platform. Organizers create events with items and rating criteria, attendees scan QR codes to rate on the spot, organizers see real-time leaderboards.

---

## Build / Lint / Test Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (flat config, v9)
npm run generate-qr  # Generate QR code PNGs (legacy)
npx tsc --noEmit     # Type checking (no npm script)
```

**Always run `npm run lint` after changes.** Run `npm run build` before finishing to catch type errors.

**No test framework configured.** No Jest, Vitest, or Playwright. No test files exist.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.1 |
| UI | React | 19.2.4 |
| Styling | Tailwind CSS v4 | ^4 |
| Database & Auth | Supabase | ^2.100.0 |
| Auth helper | @supabase/ssr | ^0.9.0 |
| Language | TypeScript | ^5 (strict) |
| QR generation | qrcode | ^1.5.4 |
| Screenshot | html2canvas | ^1.4.1 |
| Fonts | Geist Sans + Geist Mono | next/font/google |

---

## Project Structure

```
/
├── app/
│   ├── auth/             # Auth callback route handler
│   ├── create/           # Create event page
│   ├── dashboard/        # Event list page
│   ├── e/[eventSlug]/    # Attendee event & rating pages
│   ├── login/            # Login page
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Tailwind + CSS variables
│   └── page.tsx          # Landing page
├── src/
│   ├── components/       # Shared UI components (kebab-case)
│   │   ├── ui/           # Base UI components
│   │   ├── copy-link-button.tsx
│   │   └── qr-card.tsx
│   └── lib/supabase/
│       ├── client.ts     # Client component Supabase client
│       └── server.ts     # Server component Supabase client
├── proxy.ts              # Auth middleware (replaces middleware.ts)
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── package.json
└── public/votu_logo.svg  # Brand logo
```

---

## Path Aliases

```
@/* → ./*  (project root)
```

Use `@/` for all internal imports:
```ts
import { createClient } from '@/src/lib/supabase/client'
import { Button } from '@/src/components/ui/button'
```

No barrel files. Import directly from source files.

---

## Import Order

1. React / React-related
2. Next.js (`next/navigation`, `next/link`)
3. Third-party (`@supabase/ssr`, `html2canvas`)
4. Project imports via `@/`

---

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

---

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

---

## Tailwind CSS (v4)

No `tailwind.config.js`. Configuration in CSS file using `@import "tailwindcss"` and `@theme inline`.

**Brand colors**: `#1D9E75` (primary), `#04342C` (dark), `#E1F5EE` (light), `#0F6E56` (mid), `#5DCAA5` (accent)

- Primary button: `bg-[#1D9E75] text-[#E1F5EE] hover:bg-[#0F6E56]`
- Secondary button: `border border-[#1D9E75] text-[#1D9E75] hover:bg-[#E1F5EE]`
- Focus style: `focus:outline-none focus:border-[#1D9E75]`
- Active press: `active:scale-[0.98]`
- Borders over shadows: `border border-[#1D9E75]/20 rounded-2xl`
- Max border radius on cards: `rounded-2xl`

---

## Supabase Patterns

**Two clients** — same function name `createClient()`, different imports:
```ts
// Client components
import { createClient } from '@/src/lib/supabase/client'

// Server components / route handlers
import { createClient } from '@/src/lib/supabase/server'
```

**Query style**:
- Explicit columns: `.select('id, name, slug')` — never `*`
- Use `.single()` for expecting one row
- Use `Promise.all([...])` for parallel queries
- Use `{ count: 'exact', head: true }` for counting

**Auth**:
- Server: `await supabase.auth.getUser()`
- Login: `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Protected routes via `proxy.ts`

---

## Next.js 16 Notes

- **`proxy.ts` replaces `middleware.ts`** — exported function must be named `proxy`
- **Viewport** must be exported separately from metadata:
  ```ts
  export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 1 }
  ```
- Turbopack is the default bundler in dev
- Cross-origin requests blocked by default in dev — add `allowedDevOrigins` to `next.config.ts` if needed

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Stored in `.env.local` (gitignored). Never commit secrets.

---

## Error Handling

- Destructure Supabase responses: `const { data, error } = await supabase...`
- Log errors: `console.error('Context:', error)`
- Set loading/submitting state to false on failure
- Redirect to safe page if data not found: `router.push('/')`

---

## User Flows

**Organizer**: Sign in → `/dashboard` → Create event → Add items/criteria → Download QR codes → Monitor leaderboard → Export CSV

**Attendee**: Scan QR → `/e/[eventSlug]/[itemSlug]` → Enter name/phone → Rate criteria → Leave feedback → View results at `/e/[eventSlug]/results`
