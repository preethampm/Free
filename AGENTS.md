# AGENTS.md — Votu

## Project Identity

**Name**: Votu (always lowercase in UI and copy)
**Tagline**: Rate what matters.
**Domain**: votu.pppppppppp.live (subdomain, subject to change)
**Deployment**: Vercel (auto-deploy on push to `main`)
**Repository**: https://github.com/preethampm/Free

Votu is a self-service live event feedback platform. Organizers create events with custom items and rating criteria, attendees scan QR codes to rate items on the spot, and organizers see real-time leaderboards and per-criterion breakdowns.

---

## Brand & Design System

### Colors

| Token | Hex | Usage |
|---|---|---|
| Primary | `#1D9E75` | Buttons, accents, highlights, underlines |
| Dark | `#04342C` | Hero backgrounds, dark sections, dark pill |
| Light | `#E1F5EE` | Page backgrounds, surfaces, light text on dark |
| Mid | `#0F6E56` | Taglines, secondary text on dark backgrounds |
| Accent text | `#5DCAA5` | Labels, tags, muted text on dark |

### Typography

- **Font**: Geist Sans + Geist Mono (loaded via `next/font/google`)
- **Wordmark**: "votu" — lowercase, `font-weight: 500`
- **Hero headlines**: 64–80px, `font-weight: 700`, `letter-spacing: -0.03em`
- **Section headings**: 36–48px, `font-weight: 600`
- **Body**: 16–18px, `font-weight: 400`, `line-height: 1.7`
- **Labels/tags**: uppercase, `letter-spacing: 0.1em`, 12px

### UI Style

- Dark-first design — key screens use `#04342C` background
- Premium agency aesthetic — bold type, generous whitespace, editorial feel
- Border radius: 12–16px on cards, 8px on buttons
- Subtle card borders at low opacity — no heavy shadows
- Teal-tinted cards for QR code display
- Leaderboard top 3 visually distinct (podium treatment)
- Mobile-first on all attendee-facing pages
- Desktop-friendly on organizer pages

### Logo

The Votu logo consists of:
- **Icon mark**: teal rounded square with 3 QR corner markers + a checkmark in the bottom-right
- **Wordmark**: "votu" in lowercase, font-weight 500, with a teal underline accent on the "o"
- **Tagline**: "Rate what matters." in mid-teal below the wordmark
- **Logo file**: `votu_logo.svg` in the project root

---

## Build / Lint Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (flat config, v9)
npm run generate-qr  # Generate QR code PNGs (legacy, not used currently)
```

**Type checking**: `npx tsc --noEmit` (no npm script — run manually)

**Always run `npm run lint` after changes.** Run `npm run build` before finishing to catch type errors.

**No test framework configured.** No Jest, Vitest, or Playwright. No test files exist.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.1 |
| UI library | React | 19.2.4 |
| Styling | Tailwind CSS v4 | ^4 |
| Database & Auth | Supabase | @supabase/supabase-js ^2.100.0 |
| Auth helper | @supabase/ssr | ^0.9.0 |
| Language | TypeScript | ^5 (strict mode) |
| QR generation | qrcode | ^1.5.4 |
| Screenshot | html2canvas | ^1.4.1 |
| Fonts | Geist Sans + Geist Mono | via next/font/google |
| Bundler (dev) | Turbopack | default in Next.js 16 |
| Linter | ESLint | ^9 (flat config) |

---

## Project Structure

```
/
├── app/                  # Next.js App Router pages and layouts
│   ├── auth/             # Auth callback route handler
│   ├── e/[eventSlug]/    # Attendee-facing event and rating pages
│   ├── create/           # Organizer: create event
│   ├── dashboard/        # Organizer: event list
│   └── layout.tsx        # Root layout
├── src/
│   ├── components/       # Shared UI components (kebab-case filenames)
│   └── lib/
│       └── supabase/
│           ├── client.ts # Supabase client for client components
│           └── server.ts # Supabase client for server components
├── scripts/
│   └── generate-qr.js    # Legacy QR generation script
├── proxy.ts              # Auth middleware (replaces middleware.ts in Next.js 16)
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
├── package.json
└── votu_logo.svg         # Brand logo file
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

---

## Import Order

1. React / React-related
2. Next.js (`next/navigation`, `next/link`)
3. Third-party (`@supabase/ssr`, `html2canvas`)
4. Project imports via `@/`

No barrel files. Import directly from source files.

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

## Tailwind CSS Rules

Votu uses **Tailwind CSS v4** — no `tailwind.config.js`. Configuration lives in the CSS file using `@import "tailwindcss"` and `@theme inline` blocks.

**Color usage**: use the brand palette defined above. The original project used black/white/gray only — the redesign introduces teal as the primary accent throughout.

- Primary button: `bg-[#1D9E75] text-[#E1F5EE] hover:bg-[#0F6E56]`
- Secondary button: `border border-[#1D9E75] text-[#1D9E75] hover:bg-[#E1F5EE]`
- Focus style: `focus:outline-none focus:border-[#1D9E75]`
- Active press: `active:scale-[0.98]`
- Transitions: `transition-all`
- Disabled state: `bg-gray-200 text-gray-400 cursor-not-allowed`
- Borders over shadows: `border border-[#1D9E75]/20 rounded-2xl`
- Max border radius on cards: `rounded-2xl` (16px)

---

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

---

## Next.js 16 Notes

- **`proxy.ts` replaces `middleware.ts`** — exported function must be named `proxy`
- **Viewport** must be exported separately from metadata:
  ```ts
  export const viewport: Viewport = { width: 'device-width', initialScale: 1, maximumScale: 1 }
  ```
- Turbopack is the default bundler in dev

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Stored in `.env.local` (gitignored). Also set in Vercel dashboard under Project → Settings → Environment Variables. Never commit secrets.

---

## Deployment

**Platform**: Vercel
**Trigger**: Auto-deploy on push to `main`
**Build command**: `npm run build` (auto-detected by Vercel)
**Output**: `.next/`

### Post-deploy checklist

1. Add Vercel deployment URL to Supabase → Authentication → URL Configuration → Redirect URLs
2. Confirm all environment variables are set in Vercel dashboard
3. Test Google OAuth sign-in on the live URL
4. Test QR code scan flow end to end on mobile

### Custom domain

Subdomain `votu.pppppppppp.live` — configure in Vercel under Project → Settings → Domains. Add a CNAME record pointing to `cname.vercel-dns.com` in your DNS provider.

---

## Error Handling

- Destructure Supabase responses: `const { data, error } = await supabase...`
- Log errors: `console.error('Context:', error)`
- Set loading/submitting state to false on failure
- Redirect to safe page if data not found: `router.push('/')`
- No global error boundary configured

---

## Key User Flows

### Organizer flow
1. Sign in with Google → `/dashboard`
2. Create event → `/create` → generates event slug
3. Add items and criteria to event
4. Download QR codes (one per item) via `npm run generate-qr` or in-app
5. Monitor live leaderboard during event
6. Export CSV results after event

### Attendee flow
1. Scan QR code at item → `/e/[eventSlug]/[itemSlug]`
2. Enter name and phone number (used to track completion across items)
3. Rate each criterion for the item
4. Leave optional written feedback
5. Progress tracked — must rate all items for votes to count
6. View live leaderboard at `/e/[eventSlug]/results`
