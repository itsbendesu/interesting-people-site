# Interesting People 4 (IP4) — Application System

## What this is
Marketing site and application system for IP4, a curated conference. Applicants fill out a multi-step form and reviewers score submissions in an admin panel. **The video step was removed in June 2026** — applications no longer include a video. Videos from earlier applicants are retained and still playable in the admin panel (sentinel `videoUrl` values mark no-video submissions: `no-video`, `friend-invite`, `alumni-outreach`).

## Tech stack
- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4 with `@theme inline` in `globals.css`
- **Fonts**: Geist Sans/Mono + Playfair Display (serif, via `--font-playfair` CSS variable)
- **Database**: PostgreSQL via Prisma 7 with `@prisma/adapter-pg`
- **Video storage (legacy)**: Cloudflare R2 holds videos from pre-June-2026 applications; admin playback only, no new uploads
- **Auth**: iron-session for admin panel
- **Validation**: Zod v4
- **Deployment**: Vercel (auto-deploys from `main` branch)

## Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production (runs prisma generate first)
npm run test:run     # Run tests once
npm run db:migrate   # Run Prisma migrations
npm run db:push      # Push schema to DB without migration
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

## Deploying
**Deploy by pushing to `main`.** The Vercel project (`folly/interesting-people`) auto-deploys every push to `main`. **Do not run `vercel --prod` from local** — CLI deploys and git-triggered deploys have collided before (May 2026: a CLI-deployed alumni page was overwritten when a separate git push auto-deployed an older tree). Pushing to git is the single source of truth.

## Project structure
```
src/app/
  page.tsx              # Marketing home page (hero, testimonials, FAQ, etc.)
  apply/page.tsx        # Application wizard (basics → details → story → submit)
  upload/[token]/       # Legacy link finalizer — lets holders of old video-step links submit without one
  confirmation/         # Post-submission confirmation
  admin/                # Admin panel (login + submission review)
  privacy/              # Privacy policy
  api/
    apply/start         # POST: create pending application, return token
    apply/complete      # POST: finalize submission (no video; legacy video fields still accepted)
    apply/[token]       # GET: fetch pending application by token
    prompts/            # GET: fetch active prompts (legacy — prompts were for the video step)
    admin/              # Admin auth, submissions, reviews, stats, export
    health/             # GET: health check
```

## Design notes
- Violet/purple accent color (`violet-600` for CTAs, `violet-400` for decorative elements)
- Playfair Display serif font for headings (use `font-serif` class)
- Dark sections use slate-900/950 backgrounds with white text
- Design references: carta.com, tiny.com, estewartandassociates.com, neverenough.com/ip3
- Tailwind v4 quirk: font families must be defined in `@theme inline` in `globals.css` — do NOT add manual `.font-serif` CSS classes as they conflict with Tailwind's auto-generated utility

## Database schema (Prisma)
- `Reviewer` — admin users who score submissions
- `Prompt` — legacy video prompts (Submission.promptId still references one)
- `PendingApplication` — created at form submit, holds a `token` used to finalize
- `Applicant` — finalized at submission
- `Submission` — has status (SUBMITTED/ACCEPTED/WAITLIST/REJECTED); `videoUrl` is a real URL only for legacy submissions, otherwise a sentinel (`no-video`, `friend-invite`, `alumni-outreach`)
- `Review` — reviewer scores (curiosity, participation, emotional intelligence) on 1-5 scale

## Environment variables
- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — iron-session secret (min 32 chars)
- R2 vars for production video storage (configured on Vercel since Feb 2026):
  - `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

## Known issues / TODO
- `public/uploads/` is gitignored from Vercel via `.vercelignore` (old test videos)

## Deployment
- **Repo**: github.com/itsbendesu/interesting-people-site (main branch; renamed from IP4-application 2026-06-04)
- **Production URL**: interestingpeople.com (also ip4.ipevents.co)
- **Vercel project**: `folly/interesting-people` — auto-deploys on push to `main`
