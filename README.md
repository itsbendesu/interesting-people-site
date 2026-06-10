# Interesting People

A conference application platform where applicants submit a written application, and reviewers score and manage submissions.

> **Note (June 2026):** the video step was removed from all application flows. The video upload/recording documentation below is retained for historical reference; videos from earlier applicants remain stored in R2 and playable in the admin panel.

## Features

**Applicants:**
- Submit name, email, location/timezone, short bio, and optional links
- Choose from 7 thought-provoking prompts
- ~~Record a 90-second video in-browser OR upload a pre-recorded video~~ (removed June 2026)
- Direct-to-cloud upload with progress indicator

**Reviewers:**
- Review submissions (with video playback for legacy submissions)
- Score applicants on 3 dimensions (1-5 scale each):
  - **Curiosity vs Ego** - genuine curiosity vs ego-driven
  - **Participation vs Spectatorship** - active participant vs passive observer
  - **Emotional Intelligence** - EQ level
- Admins can set final status: Accepted, Waitlist, Rejected

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** iron-session (cookie-based)
- **Video Storage (legacy):** Cloudflare R2 (S3-compatible) — playback of old submissions only

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL running locally
- Cloudflare account (for R2 storage)

### Setup

```bash
# 1. Install dependencies
cd interesting-people
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials (see below)

# 3. Create the database
createdb interesting_people

# 4. Push schema and seed data
npm run db:push
npm run db:seed

# 5. Start development server
npm run dev
```

Open in browser:
- **Application:** http://localhost:3000
- **Admin Login:** http://localhost:3000/admin/login

### Default Admin

- **Email:** `admin@example.com`
- **Password:** `admin123`

---

## Cloudflare R2 Setup

### 1. Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) > R2
2. Click "Create bucket"
3. Name it `interesting-people-videos`
4. Choose a location close to your users

### 2. Enable Public Access

1. Go to your bucket > Settings
2. Under "Public access", click "Allow Access"
3. Copy the public URL (e.g., `https://pub-xxx.r2.dev`)

### 3. Create API Token

1. Go to R2 > "Manage R2 API Tokens"
2. Click "Create API Token"
3. Give it a name like "interesting-people-app"
4. Permissions: **Object Read & Write**
5. Specify bucket: `interesting-people-videos`
6. Copy the Access Key ID and Secret Access Key

### 4. Configure CORS (Optional)

If you get CORS errors, add this to your bucket's CORS policy:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

### 5. Environment Variables

```bash
# .env
R2_ENDPOINT="https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="your-access-key-id"
R2_SECRET_ACCESS_KEY="your-secret-access-key"
R2_BUCKET_NAME="interesting-people-videos"
R2_PUBLIC_URL="https://pub-xxx.r2.dev"
```

Find your Account ID in the Cloudflare dashboard URL or R2 overview page.

---

## Video Upload Flow (removed June 2026 — historical)

```
┌──────────┐    1. Request presigned URL    ┌──────────┐
│  Client  │ ─────────────────────────────► │  Server  │
│          │ ◄───────────────────────────── │          │
└──────────┘    2. Return upload URL + key  └──────────┘
     │
     │ 3. PUT video directly to R2
     ▼
┌──────────┐
│    R2    │
└──────────┘
     │
     │ 4. Upload complete
     ▼
┌──────────┐    5. Finalize submission      ┌──────────┐
│  Client  │ ─────────────────────────────► │  Server  │
│          │ ◄───────────────────────────── │          │
└──────────┘    6. Verify & save to DB      └──────────┘
```

### Validation

| Check | Client | Server |
|-------|--------|--------|
| File type (mp4/mov/webm) | ✓ | ✓ |
| File size (max 500MB) | ✓ | ✓ |
| Duration (max 120s) | ✓ | - |
| Upload exists in R2 | - | ✓ |
| Email not duplicate | - | ✓ |

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/prompts` | GET | List active prompts |
| `/api/upload/presign` | POST | Get presigned upload URL |
| `/api/upload/finalize` | POST | Verify upload & create submission |
| `/api/upload` | POST | Legacy: direct upload to server |
| `/api/applications` | POST | Legacy: create submission |
| `/api/admin/auth` | GET/POST/DELETE | Reviewer auth |
| `/api/admin/submissions` | GET | List submissions (filterable) |
| `/api/admin/submissions/[id]` | GET/PATCH | Get/update submission |
| `/api/admin/reviews` | POST | Submit review |

### Presign Request

```typescript
POST /api/upload/presign
{
  "contentType": "video/mp4",
  "contentLength": 52428800,
  "fileName": "response.mp4",
  "email": "applicant@example.com",
  "durationSec": 85
}
```

### Presign Response

```typescript
{
  "uploadUrl": "https://bucket.r2.cloudflarestorage.com/...",
  "key": "videos/applicant_example_com/1234567890.mp4",
  "publicUrl": "https://pub-xxx.r2.dev/videos/...",
  "expiresAt": "2024-01-15T12:30:00.000Z",
  "constraints": {
    "maxSizeMB": 500,
    "maxDurationSec": 120,
    "allowedTypes": ["video/mp4", "video/quicktime", "video/webm"]
  }
}
```

### Finalize Request

```typescript
POST /api/upload/finalize
{
  "key": "videos/applicant_example_com/1234567890.mp4",
  "publicUrl": "https://pub-xxx.r2.dev/videos/...",
  "durationSec": 85,
  "applicant": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "location": "San Francisco, CA",
    "timezone": "America/Los_Angeles",
    "bio": "Software engineer...",
    "links": ["https://github.com/jane"]
  },
  "promptId": "prompt-3"
}
```

---

## Project Structure

```
interesting-people/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing
│   │   ├── apply/page.tsx            # Application form
│   │   ├── confirmation/page.tsx     # Success
│   │   ├── admin/
│   │   │   ├── login/page.tsx        # Login
│   │   │   ├── page.tsx              # Dashboard
│   │   │   └── submissions/[id]/     # Review detail
│   │   └── api/
│   │       ├── prompts/              # List prompts
│   │       ├── upload/
│   │       │   ├── presign/          # Get upload URL
│   │       │   ├── finalize/         # Complete submission
│   │       │   └── route.ts          # Legacy upload
│   │       ├── applications/         # Legacy submission
│   │       └── admin/                # Admin APIs
│   ├── components/
│   │   ├── VideoRecorder.tsx         # Browser recording
│   │   ├── VideoUploader.tsx         # Drag/drop upload
│   │   └── VideoPlayer.tsx           # Playback
│   └── lib/
│       ├── prisma.ts                 # Prisma client
│       ├── session.ts                # Session config
│       ├── storage.ts                # Legacy file storage
│       └── r2.ts                     # R2 client + helpers
└── public/uploads/                   # Legacy local uploads
```

---

## Database Schema

```prisma
model Submission {
  id               String           @id
  applicantId      String           @unique
  promptId         String
  videoUrl         String           // R2 public URL
  videoDurationSec Int
  status           SubmissionStatus // SUBMITTED | ACCEPTED | WAITLIST | REJECTED
  createdAt        DateTime
  reviews          Review[]

  @@index([status])
  @@index([createdAt(sort: Desc)])
  @@index([status, createdAt(sort: Desc)])
}
```

---

## Video Prompts (seeded)

1. Tell us about a time you changed your mind about something important.
2. What's the most interesting rabbit hole you've gone down recently?
3. Describe a project you're proud of that most people don't know about.
4. What question do you wish more people would ask you?
5. Tell us about someone who has significantly influenced your thinking.
6. What's a contrarian belief you hold that others might disagree with?
7. If you could have dinner with anyone, living or dead, who and why?

---

## Production Checklist

- [ ] Set `SESSION_SECRET` to a secure random value
- [ ] Set `ADMIN_PASSWORD` environment variable
- [ ] Configure R2 bucket with proper CORS
- [ ] Enable R2 public access or set up custom domain
- [ ] Use proper OAuth/magic links for auth
- [ ] Add rate limiting to upload endpoints
- [ ] Set up video transcoding pipeline (optional)
- [ ] Configure CDN caching for video delivery
