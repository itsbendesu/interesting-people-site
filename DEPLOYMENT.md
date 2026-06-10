# Deployment Guide

This guide covers deploying Interesting People to production using Vercel, managed Postgres, and Cloudflare R2.

## Prerequisites

- Vercel account
- Managed Postgres (Neon or Supabase)
- Cloudflare account with R2 enabled
- Domain name (optional but recommended)

---

## 1. Database Setup

### Option A: Neon (Recommended)

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string (use the "pooled" connection for serverless)
4. Format: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

### Option B: Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database > Connection string
4. Use the "Connection pooling" string for serverless
5. Format: `postgresql://postgres.[ref]:password@aws-0-region.pooler.supabase.com:6543/postgres`

### Run Migrations

```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-production-connection-string"

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed initial data
npm run db:seed
```

---

## 2. Object Storage Setup (Cloudflare R2)

### Create R2 Bucket

1. Go to Cloudflare Dashboard > R2
2. Create a new bucket named `interesting-people-videos` *(legacy — new applications no longer upload videos; R2 only serves old submissions)*
3. Note your Account ID from the URL

### Configure Public Access

1. Go to bucket Settings > Public access
2. Enable "Allow Access" via R2.dev subdomain
3. Copy the public URL (e.g., `https://pub-xxx.r2.dev`)

### Create API Token

1. Go to R2 > Manage R2 API Tokens
2. Create token with permissions:
   - Object Read
   - Object Write
3. Copy Access Key ID and Secret Access Key

### Configure CORS

1. Go to bucket Settings > CORS policy
2. Add this configuration:

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["Content-Type", "Content-Length"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

For development, add `http://localhost:3000` to AllowedOrigins.

---

## 3. Vercel Deployment

### Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Vercel will auto-detect Next.js

### Configure Environment Variables

Add these in Vercel Project Settings > Environment Variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Postgres connection string |
| `SESSION_SECRET` | Yes | Min 32 chars, generate with `openssl rand -base64 32` |
| `ADMIN_PASSWORD` | Yes | Password for admin login |
| `R2_ENDPOINT` | Yes | `https://<account-id>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | Yes | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | Yes | R2 API token secret |
| `R2_BUCKET_NAME` | Yes | Your bucket name |
| `R2_PUBLIC_URL` | Yes | Public URL for bucket |
| `ENABLE_EMAIL_VERIFICATION` | No | Set to `true` to enable |
| `ACCEPTED_CAP` | No | Max acceptances (default: 150) |
| `LOG_LEVEL` | No | `debug`, `info`, `warn`, `error` |
| `NEXT_PUBLIC_APP_URL` | No | Your production URL |

### Build Settings

Vercel should auto-detect, but verify:
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Deploy

1. Push to your main branch
2. Vercel will automatically deploy
3. Run database migrations (see above)

---

## 4. Security Checklist

### Authentication & Sessions

- [ ] `SESSION_SECRET` is unique and at least 32 characters
- [ ] `ADMIN_PASSWORD` is strong (16+ chars, mixed case, numbers, symbols)
- [ ] Session cookies are `httpOnly` and `secure` in production
- [ ] Consider implementing OAuth for production (Google, GitHub)

### Object Storage

- [ ] R2 bucket is NOT fully public (use presigned URLs)
- [ ] CORS is configured with specific allowed origins (not `*`)
- [ ] Presigned URLs expire in 1 hour or less
- [ ] File type validation on both client and server
- [ ] File size limit enforced (500MB max)
- [ ] Video duration validated (120s max)

### Database

- [ ] Using connection pooling for serverless
- [ ] SSL/TLS enabled (`?sslmode=require`)
- [ ] Database user has minimal required permissions
- [ ] No raw SQL queries (using Prisma ORM)

### API Security

- [ ] All admin routes check authentication
- [ ] Status changes restricted to ADMIN role
- [ ] Rate limiting on application submissions
- [ ] Rate limiting on email verification resends
- [ ] Input validation with Zod on all endpoints
- [ ] Honeypot field for bot detection

### Content Security

- [ ] Video content type validated (mp4, webm, mov only)
- [ ] No executable file uploads allowed
- [ ] Videos served from separate domain (R2)

---

## 5. Production Upload Configuration

### Presigned URL Settings

The current configuration in `/src/lib/r2.ts`:

```typescript
// Presigned URL expiry (default: 1 hour)
const PRESIGN_EXPIRY = parseInt(process.env.R2_PRESIGN_EXPIRY || "3600");

// Allowed file types
const ALLOWED_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

// Max file size: 500MB
const MAX_FILE_SIZE = 500 * 1024 * 1024;
```

### File Validation Flow

1. **Client-side**: Validates type, size, and duration before upload
2. **Presign endpoint**: Validates type and size before generating URL
3. **Complete endpoint**: Verifies file exists in R2 before creating submission

---

## 6. Database Migrations

### Initial Production Setup

```bash
# From your local machine with DATABASE_URL set to production
npx prisma migrate deploy
```

### Future Migrations

1. Create migration locally:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```

2. Commit the migration files in `prisma/migrations/`

3. Deploy to production:
   ```bash
   npx prisma migrate deploy
   ```

### Rollback (if needed)

Prisma doesn't support automatic rollback. Options:
1. Create a new migration that undoes changes
2. Restore from database backup
3. Manual SQL to undo changes

---

## 7. Observability

### Request Logging

The app includes a logging utility at `/src/lib/logger.ts`. Logs are written to stdout and captured by Vercel.

View logs in Vercel Dashboard > Project > Logs.

### Error Tracking (Optional)

To add Sentry:

1. Install: `npm install @sentry/nextjs`
2. Run setup: `npx @sentry/wizard@latest -i nextjs`
3. Add `SENTRY_DSN` environment variable

### Health Check

The app exposes a health endpoint at `/api/health` for monitoring.

---

## 8. Post-Deployment Checklist

- [ ] Run database migrations
- [ ] Create initial admin reviewer account
- [ ] Add at least one active prompt
- [ ] Test full application flow
- [ ] Test video upload and playback
- [ ] Test admin review flow
- [ ] Verify CORS is working
- [ ] Check error tracking is receiving events
- [ ] Set up uptime monitoring (optional)

### Create Admin Account

```bash
# Connect to production database
npx prisma studio

# Or use SQL:
INSERT INTO "Reviewer" (id, email, name, role)
VALUES (gen_random_uuid(), 'admin@yourdomain.com', 'Admin', 'ADMIN');
```

### Add Prompts

```bash
# Via Prisma Studio or SQL:
INSERT INTO "Prompt" (id, text, active)
VALUES
  (gen_random_uuid(), 'What''s something you changed your mind about recently, and why?', true),
  (gen_random_uuid(), 'Describe a time you were completely wrong about something.', true);
```

---

## Troubleshooting

### "PrismaClientInitializationError"

- Check DATABASE_URL is set correctly
- Ensure SSL is enabled for cloud databases
- Verify connection pooling URL is used

### CORS Errors on Upload

- Check R2 CORS configuration includes your domain
- Ensure protocol matches (https in prod)
- Check browser console for specific error

### Videos Not Playing

- Verify R2_PUBLIC_URL is correct
- Check bucket public access is enabled
- Ensure video was fully uploaded

### Session Issues

- Verify SESSION_SECRET is set
- Check cookies are being set (secure flag in prod)
- Clear cookies and try again
