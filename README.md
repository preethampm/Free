# Free - Fest Voting System

## Project Overview
A public voting system for a fest with 15 startup stalls. Users scan QR codes at each stall, rate them 0-10, and votes are only counted if the user has rated ALL 15 stalls.

## Tech Stack
- **Framework**: Next.js 16 (App Router) with TypeScript
- **Database + Auth**: Supabase (Postgres + Auth + Realtime)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (planned)

## Project Structure
```
free/
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts        # OAuth callback handler - DONE
│   ├── login/
│   │   └── page.tsx            # Google login page - DONE
│   ├── stall/
│   │   └── [slug]/
│   │       └── page.tsx        # Stall rating page - DONE
│   ├── dashboard/
│   │   └── page.tsx            # User progress page - TODO
│   ├── admin/
│   │   └── results/
│   │       └── page.tsx        # Admin leaderboard - TODO
│   ├── layout.tsx
│   └── page.tsx
├── src/
│   └── lib/
│       └── supabase/
│           ├── client.ts       # Browser Supabase client - DONE
│           └── server.ts       # Server Supabase client - DONE
├── proxy.ts                    # Route protection (replaces middleware.ts in Next.js 16) - DONE
└── .env.local                  # Supabase credentials - DONE
```

## Important Next.js 16 Note
In Next.js 16, `middleware.ts` is renamed to `proxy.ts` and the exported function must be named `proxy` (not `middleware`). Example:
```ts
export async function proxy(request: NextRequest) { ... }
```

## Supabase Setup

### Database Tables
1. **stalls** - 15 stalls pre-seeded with slugs stall-01 to stall-15
   - id, name, description, slug, created_at

2. **profiles** - extends auth.users
   - id (references auth.users), full_name, phone, completed_at (null until all 15 rated), created_at

3. **ratings** - user votes
   - id, user_id, stall_id, score (0-10), created_at
   - UNIQUE constraint on (user_id, stall_id) — prevents duplicate votes

4. **leaderboard** - Postgres VIEW (not a real table)
   - Only counts ratings from users where completed_at IS NOT NULL
   - Returns: stall_id, stall_name, slug, total_votes, average_score, total_score

### Supabase Client Files

**src/lib/supabase/client.ts** (for client components):
```ts
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**src/lib/supabase/server.ts** (for server components):
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

## Auth
- Google OAuth via Supabase Auth
- Phone OTP (India/MSG91) — planned, not yet implemented
- On new user signup, a trigger auto-creates a row in `profiles`
- Protected routes: /dashboard, /admin (handled in proxy.ts)
- Login page: /login
- OAuth callback: /auth/callback

## Core Business Logic

### Voting Rules
1. User must be logged in to rate a stall
2. Each user can rate each stall ONLY ONCE (enforced by DB unique constraint)
3. A user's votes are only counted in final results if they have rated ALL 15 stalls
4. When a user submits their 15th rating, set profiles.completed_at = now()
5. The leaderboard view automatically filters for completed users only

### Rating Submission Flow
1. User scans QR → lands on /stall/stall-07
2. If not logged in → redirect to /login?redirectTo=/stall/stall-07
3. Check if user already rated this stall → show "already rated" if yes
4. Show 0-10 slider → user submits
5. Insert into ratings table
6. Count user's total ratings — if 15, update profiles.completed_at
7. Show updated progress: "X/15 stalls rated"

## Pages To Build

### /dashboard (TODO)
- Show user's progress: X/15 stalls rated
- Progress bar
- List of all 15 stalls showing which ones are rated and which are not
- If completed, show congratulations message

### /admin/results (TODO)
- Password protected (check for ADMIN_PASSWORD env variable or Supabase role)
- Real-time leaderboard using Supabase Realtime
- Table: stall name | average score | total votes | total score
- Sorted by average score descending
- CSV export button
- Show count of how many users have completed all 15 ratings

## QR Codes (TODO)
- Each stall URL: https://yourdomain.com/stall/stall-01 through stall-15
- Generate using a script: scripts/generate-qr.js using the `qrcode` npm package
- Output 15 PNG files, one per stall

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ADMIN_PASSWORD=your_admin_password  (to be added)
```

## Current Status
- [x] Next.js project created
- [x] Supabase packages installed (@supabase/supabase-js, @supabase/ssr)
- [x] Supabase client files created (src/lib/supabase/client.ts, server.ts)
- [x] proxy.ts created (route protection)
- [x] Database schema created (stalls, profiles, ratings, leaderboard view)
- [x] 15 stalls seeded (stall-01 to stall-15)
- [x] Auth trigger created (auto-creates profile on signup)
- [x] Google OAuth configured
- [x] /auth/callback route created
- [x] /login page created
- [x] /stall/[slug] page created
- [ ] /dashboard page
- [ ] /admin/results page
- [ ] QR code generation script
- [ ] Fix Google OAuth login (Database error on new user signup - auth settings issue in Supabase)
- [ ] Deploy to Vercel
- [ ] Add real stall names (currently Stall 1 to Stall 15)

## Known Issues
- Google OAuth login returns "Database error saving new user" — needs Supabase Auth settings fix:
  Go to Authentication > Settings, turn OFF email confirmations, ensure "Allow new users to sign up" is ON