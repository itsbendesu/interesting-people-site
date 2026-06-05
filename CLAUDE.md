# Interesting People 4 (IP4) — Application System

## What this is
Marketing site and application system for IP4, a curated conference. Applicants fill out a form, record a 90-second video (two prompts, 45s each), and reviewers score submissions in an admin panel.

## Tech stack
- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4 with `@theme inline` in `globals.css`
- **Fonts**: Geist Sans/Mono + Playfair Display (serif, via `--font-playfair` CSS variable)
- **Database**: PostgreSQL via Prisma 7 with `@prisma/adapter-pg`
- **Video storage**: Cloudflare R2 (production), local `public/uploads/` (dev)
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
  apply/page.tsx        # Application form (step 1: info)
  upload/[token]/       # Video recording page (step 2: record)
  confirmation/         # Post-submission confirmation (step 3)
  admin/                # Admin panel (login + submission review)
  privacy/              # Privacy policy
  api/
    apply/start         # POST: create pending application, return upload token
    apply/complete      # POST: finalize submission with video URL
    apply/[token]       # GET: fetch pending application by token
    upload/             # POST: video upload (local dev)
    upload/presign      # POST: get R2 presigned URL (production)
    upload/finalize     # POST: confirm R2 upload
    prompts/            # GET: fetch active prompts
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
- `Prompt` — video prompts shown during recording
- `PendingApplication` — created at form submit, holds a `token` for the upload page
- `Applicant` — finalized after video upload
- `Submission` — links applicant to video, has status (SUBMITTED/ACCEPTED/WAITLIST/REJECTED)
- `Review` — reviewer scores (curiosity, participation, emotional intelligence) on 1-5 scale

## Environment variables
- `DATABASE_URL` — PostgreSQL connection string
- `SESSION_SECRET` — iron-session secret (min 32 chars)
- R2 vars for production video storage (configured on Vercel since Feb 2026):
  - `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`

## Known issues / TODO
- Deprecated `config` export warning in `src/app/api/upload/route.ts` (harmless, could clean up)
- `public/uploads/` is gitignored from Vercel via `.vercelignore` (test videos)

## Deployment
- **Repo**: github.com/itsbendesu/interesting-people-site (main branch; renamed from IP4-application 2026-06-04)
- **Production URL**: interestingpeople.com (also ip4.ipevents.co)
- **Vercel project**: `folly/interesting-people` — auto-deploys on push to `main`
