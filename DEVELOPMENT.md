# Development Guide

This guide explains how to run Arkivo locally, how the main systems fit together, and what to check before shipping changes.

## Requirements

- Bun
- Node.js compatible with Next.js 16
- PostgreSQL database, usually Neon for parity with production
- Clerk application
- Cloudinary account
- Google Gemini API key

The project uses Bun scripts and a Bun lockfile. Prefer Bun for install, scripts, and local development.

## Local Setup

Install dependencies:

```bash
bun install
```

Create `.env.local`:

```bash
DATABASE_URL=
MIGRATION_DATABASE_URL=

NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GEMINI_API_KEY=
```

Run migrations:

```bash
bun run db:migrate
```

Start the dev server:

```bash
bun run dev
```

Open `http://localhost:3000`.

## Environment Variables

### Database

`DATABASE_URL` is used by runtime database queries.

`MIGRATION_DATABASE_URL` is used by `bun run db:migrate` when present. If it is not set, migrations use `DATABASE_URL`.

### Public App URL

`NEXT_PUBLIC_APP_URL` controls absolute URLs used by metadata, sitemap, structured data, and social previews. Use `http://localhost:3000` locally and the deployed canonical domain in production.

### Clerk

`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is safe for the browser.

`CLERK_SECRET_KEY` must stay server-side.

The fallback redirect variables should normally point to `/dashboard`.

### Cloudinary

Cloudinary credentials are used by server API routes to sign direct browser uploads and delete temporary assets.

Supported receipt upload types:

- `image/jpeg`
- `image/png`
- `image/webp`

Maximum receipt image size is currently 10 MB.

### Gemini

`GEMINI_API_KEY` is used by `lib/ai/client.ts` through the Vercel AI SDK.

## Common Commands

```bash
bun run dev
bun run typecheck
bun run lint
bun run build
bun run start
bun run format
bun run db:migrate
```

Use `bun run build` after changes to:

- Route files.
- Layout files.
- Metadata routes.
- Server components.
- API routes.
- Environment-sensitive code.
- Next.js config.

## Architecture Overview

```text
Landing/Auth
  -> Clerk session
  -> Protected dashboard
  -> Cloudinary signed upload
  -> Gemini extraction
  -> Zod validation
  -> User review
  -> Drizzle write
  -> Analytics invalidation
  -> Dashboard refresh
```

## App Router Layout

The app uses route groups:

- `app/(auth)` for sign-in and sign-up.
- `app/(dashboard)` for authenticated product surfaces.

The dashboard is protected by Clerk middleware in `proxy.ts`. API routes still perform their own auth checks because UI middleware is not a security boundary for API data.

## Authentication Flow

`lib/auth.ts` resolves the current Clerk user and calls `findOrCreateUser`. The internal user table stores the Clerk user ID as the local user ID.

When adding protected API routes:

1. Call `getCurrentUser`.
2. Return `401` or an unauthorized response when no user exists.
3. Call `setRlsUserContext(user.id)` before user-scoped database queries.
4. Scope queries to the current user.

## Receipt Ingestion Flow

### 1. Sign Upload

`POST /api/uploads/cloudinary`

Request body:

```json
{
  "filename": "receipt.jpg",
  "contentType": "image/jpeg",
  "size": 120000
}
```

The route validates file metadata and returns signed Cloudinary upload parameters.

### 2. Upload to Cloudinary

The browser uploads directly to Cloudinary with the signed parameters. The server never receives the raw upload in this step.

### 3. Ingest Image

`POST /api/ingest`

Request body:

```json
{
  "imageUrl": "https://res.cloudinary.com/...",
  "filename": "receipt.jpg",
  "publicId": "arkivo/receipts/..."
}
```

The route fetches the image, sends it to Gemini, validates the structured response, normalizes the total, and returns parsed receipt data plus the Cloudinary public ID.

### 4. Review and Save

`POST /api/receipts`

The reviewed receipt payload is validated by `reviewedReceiptSaveSchema`. Manual receipts require merchant, total, currency, date, and category. AI-assisted receipts must contain meaningful receipt content.

After save, the route deletes the temporary Cloudinary asset when a public ID is present and invalidates analytics cache for the user.

## AI Extraction

Receipt extraction lives in `lib/ai/client.ts`.

The prompt asks Gemini to:

- Extract only visible/inferable values.
- Use `null` for missing fields.
- Return numbers as numbers.
- Prefer final payable total labels.
- Ignore tendered cash and change fields unless they are the only final payable amount.
- Use `YYYY-MM-DD` dates.
- Use 24-hour times.
- Default currency to EUR when no other currency is visible.
- Expect German receipt wording.

The output is parsed through a strict Zod schema before it reaches the UI.

## Receipt Normalization

`lib/receipts/normalize-total.ts` handles common total issues. Use this helper instead of adding one-off total correction logic in UI or API code.

Total normalization currently happens after AI extraction and before receipt creation.

## Database Workflow

Schema lives in `lib/db/schema.ts`.

Migration SQL lives in `drizzle/`.

Run migrations:

```bash
bun run db:migrate
```

When changing schema:

1. Update `lib/db/schema.ts`.
2. Add a migration in `drizzle/`.
3. Run `bun run db:migrate`.
4. Update query helpers in `lib/db/queries`.
5. Update validators and UI types if needed.
6. Run `bun run typecheck`.

## Query Layer

Database queries are organized by domain:

- `lib/db/queries/users.ts`
- `lib/db/queries/receipts.ts`
- `lib/db/queries/analytics.ts`

Keep SQL and Drizzle-specific logic in query helpers where possible. API routes should focus on auth, validation, calling query helpers, and shaping responses.

## Analytics Cache

Analytics endpoints use `lib/cache/user-analytics-cache.ts`.

Write paths must invalidate user analytics after creating, updating, or deleting receipts:

- `POST /api/receipts`
- `PATCH /api/receipts/[id]`
- `DELETE /api/receipts/[id]`

If you add a new write path that changes receipt data, invalidate this cache.

## Validation

Validation lives in `lib/validators`.

Use validation for:

- API request bodies.
- AI outputs.
- User-edited receipt payloads.
- Partial receipt updates.

Do not trust client-side validation alone. UI validation improves user experience, but API validation is required.

## Metadata, SEO, and PWA

SEO and app metadata are in:

- `app/layout.tsx`
- `app/page.tsx`
- `app/manifest.ts`
- `app/robots.ts`
- `app/sitemap.ts`

The OG image is `public/og-image.png` and should remain 1200 by 630 for broad social preview compatibility.

Dashboard, auth, and offline routes should not be indexed.

## Styling and UI

Shared UI primitives live in `components/ui`.

Feature components are grouped by surface:

- `components/dashboard`
- `components/receipts`
- `components/settings`
- `components/stats`

For dashboard-style UI:

- Prefer dense, scannable layouts.
- Keep controls close to the data they affect.
- Use existing button, input, table, tabs, and chart patterns.
- Include loading and empty states.
- Avoid broad visual redesigns inside feature PRs.

## API Response Shape

Most API routes return:

```json
{
  "success": true,
  "data": {}
}
```

or:

```json
{
  "success": false,
  "error": "Message"
}
```

Keep new routes consistent unless there is a strong reason to do otherwise.

## Debugging

### Build Fails on Fonts

The app uses `next/font/google`. Production builds need network access to fetch font assets unless they are already cached.

### Unauthorized API Responses

Check:

- Clerk environment variables.
- Local Clerk application configuration.
- Whether the browser has an active session.
- Whether the route calls `getCurrentUser`.

### Upload Fails

Check:

- Cloudinary credentials.
- File type is JPEG, PNG, or WebP.
- File size is below 10 MB.
- The browser receives the signed upload response.

### Ingestion Fails

Check:

- `GEMINI_API_KEY`.
- The Cloudinary image URL is fetchable.
- The uploaded file is a valid image.
- Gemini output still conforms to the Zod schema.

### Analytics Looks Stale

Check whether the write path calls `invalidateUserAnalyticsCache(user.id)` after modifying receipt data.

## Pre-Ship Checklist

Run:

```bash
bun run typecheck
bun run lint
bun run build
```

Also verify manually when relevant:

- Sign in and sign out.
- Upload a receipt.
- Save the reviewed receipt.
- Edit a saved receipt.
- Delete a receipt.
- Check dashboard totals.
- Check category and time-series charts.
- Test mobile layout for changed views.

## Production Notes

- Use production Clerk keys and production redirect URLs.
- Use a production Neon database.
- Use production Cloudinary credentials.
- Set `NEXT_PUBLIC_APP_URL` to the canonical deployed URL.
- Keep API secrets out of client-exposed variables.
- Run migrations before deploying code that depends on new schema.
