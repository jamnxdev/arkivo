# Arkivo

Arkivo is an AI-powered receipt and business document workspace. It uploads receipt images, extracts structured expense data with Gemini, lets users review and correct the result, stores the records in PostgreSQL, and turns saved receipts into searchable analytics.

The project is built as a modern Next.js App Router application with authenticated dashboard routes, typed API handlers, Drizzle-managed database access, Cloudinary-backed image ingestion, and a small analytics layer for spending summaries, categories, and time series.

## Why Arkivo Exists

Receipts are usually scattered across camera rolls, inboxes, and drawers. Manual entry is slow, error-prone, and hard to audit later. Arkivo focuses on a practical workflow:

1. Upload a receipt image.
2. Extract merchant, date, total, currency, category, line items, and tax data.
3. Review and correct the extracted record.
4. Save it to a user-owned receipt archive.
5. Analyze spending by total, category, and time period.

The app is intentionally structured so the extraction layer, persistence layer, and UI can evolve independently.

## Current Status

Arkivo is an active MVP. The end-to-end flow is in place:

- Clerk-authenticated user sessions.
- Cloudinary upload signing and cleanup.
- Gemini vision extraction through the Vercel AI SDK.
- Zod validation for extracted and user-reviewed receipt data.
- Drizzle ORM queries against Neon/PostgreSQL.
- Receipt create, update, list, and delete endpoints.
- Analytics endpoints for summary, category breakdown, and time series.
- Dashboard, receipt capture, receipt list, settings, and stats views.
- PWA metadata, manifest, sitemap, robots, Open Graph, and Twitter metadata.

Some areas are still intentionally lightweight, especially edit ergonomics, advanced validation UX, richer test coverage, and production observability.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router, React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4, shadcn-style components |
| Auth | Clerk |
| Database | Neon PostgreSQL |
| ORM | Drizzle ORM and Drizzle Kit |
| AI | Vercel AI SDK with Google Gemini |
| Uploads | Cloudinary signed uploads |
| Validation | Zod |
| Charts | Recharts and local chart primitives |
| Package manager | Bun |
| Linting | ESLint with Next.js config |

## Core Flow

```text
User uploads receipt image
  -> app/api/uploads/cloudinary signs the upload
  -> Browser uploads image to Cloudinary
  -> app/api/ingest fetches the image
  -> Gemini extracts structured JSON
  -> Zod validates the extraction result
  -> User reviews and edits the receipt
  -> app/api/receipts saves the reviewed record
  -> Analytics cache invalidates
  -> Dashboard and stats update
```

## Features

### Receipt Capture

- Accepts receipt image uploads.
- Uses signed Cloudinary upload parameters instead of exposing Cloudinary secrets to the browser.
- Limits receipt files to supported image formats and a maximum size.
- Sends uploaded images through Gemini vision extraction.
- Normalizes totals to reduce common receipt parsing mistakes.
- Deletes temporary Cloudinary assets after the receipt is saved.

### Receipt Management

- Stores receipts per authenticated user.
- Supports manual and AI-assisted receipt records.
- Allows updates to merchant, date, total, currency, category, line items, tax, and metadata.
- Deletes receipts and invalidates analytics data.

### Analytics

- Summary endpoint for high-level spending metrics.
- Category endpoint for spending breakdowns.
- Time-series endpoint for dashboard and stats charts.
- Per-user in-memory cache with explicit invalidation on write paths.

### Authentication and Data Ownership

- Clerk protects dashboard UI routes.
- API routes resolve the current Clerk user and map it to an internal `users` table.
- Database access sets a row-level security context before user-scoped queries.

### SEO and PWA

- App metadata includes canonical URL, Open Graph tags, Twitter card tags, and app icons.
- `public/og-image.png` is used for rich social previews.
- Public sitemap only includes the canonical landing page.
- Dashboard and auth surfaces opt out of indexing.
- Web app manifest and offline page are included.

## Project Structure

```text
app/
  (auth)/                 Clerk sign-in and sign-up pages
  (dashboard)/            Protected dashboard routes
  api/                    App Router API endpoints
  layout.tsx              Root layout, metadata, providers
  page.tsx                Public landing page
  manifest.ts             Web app manifest
  robots.ts               Robots metadata route
  sitemap.ts              Sitemap metadata route

components/
  dashboard/              Dashboard-specific sections
  receipts/               Receipt page content
  settings/               Settings page content
  stats/                  Analytics/statistics UI
  charts/                 Local chart primitives
  ui/                     Shared UI primitives

lib/
  ai/                     Gemini extraction client
  cache/                  User analytics cache
  db/                     Drizzle schema, queries, RLS helpers
  env/                    Environment variable access
  receipts/               Receipt normalization helpers
  storage/                Cloudinary signing/deletion helpers
  validators/             Zod schemas and validation helpers

drizzle/
  *.sql                   Database migrations
  meta/                   Drizzle migration metadata
```

## Routes

### Public Routes

| Route | Purpose |
| --- | --- |
| `/` | Public landing page. Redirects authenticated users to `/dashboard`. |
| `/sign-in` | Clerk sign-in page. |
| `/sign-up` | Clerk sign-up page. |
| `/offline` | PWA fallback page. |
| `/manifest.webmanifest` | Generated web app manifest. |
| `/robots.txt` | Generated robots file. |
| `/sitemap.xml` | Generated sitemap. |

### Protected Dashboard Routes

| Route | Purpose |
| --- | --- |
| `/dashboard` | Main capture and overview dashboard. |
| `/dashboard/receipts` | Receipt list and management view. |
| `/dashboard/stats` | Spending analytics and chart views. |
| `/dashboard/settings` | User settings and preferences. |

### API Routes

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/uploads/cloudinary` | `POST` | Create a signed Cloudinary upload request. |
| `/api/uploads/cloudinary/delete` | `POST` | Delete a Cloudinary asset by public ID. |
| `/api/ingest` | `POST` | Extract receipt data from an uploaded image URL. |
| `/api/receipts` | `GET` | List current user's receipts. |
| `/api/receipts` | `POST` | Save a reviewed receipt. |
| `/api/receipts/[id]` | `PATCH` | Update a receipt. |
| `/api/receipts/[id]` | `DELETE` | Delete a receipt. |
| `/api/analytics/summary` | `GET` | Return dashboard summary metrics. |
| `/api/analytics/categories` | `GET` | Return category breakdown data. |
| `/api/analytics/timeseries` | `GET` | Return spending over time. |

## Data Model

The main tables are defined in `lib/db/schema.ts`.

### `users`

Stores internal user records. The primary key maps to the Clerk user ID.

### `receipts`

Stores receipt records:

- `userId`
- `merchant`
- `merchantBrand`
- `total`
- `currency`
- `date`
- `time`
- `category`
- `items`
- `tax`
- `metadata`
- `parserConfigId`
- timestamps

### `parser_configs`

Reserved for future configurable parsing workflows. The current core path uses direct Gemini extraction and validation.

## Environment Variables

Create `.env.local` for local development.

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

Notes:

- `DATABASE_URL` is used by the app at runtime.
- `MIGRATION_DATABASE_URL` is optional; migrations fall back to `DATABASE_URL`.
- `NEXT_PUBLIC_APP_URL` controls canonical URLs, sitemap URLs, and social metadata.
- Clerk may require additional dashboard-side configuration for allowed redirect URLs.
- Cloudinary credentials are used only server-side to sign uploads and delete temporary images.

## Getting Started

Install dependencies:

```bash
bun install
```

Create `.env.local` with the variables above.

Run database migrations:

```bash
bun run db:migrate
```

Start the development server:

```bash
bun run dev
```

Open `http://localhost:3000`.

## Useful Scripts

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the Next.js dev server with Turbopack. |
| `bun run build` | Create a production build. |
| `bun run start` | Start the production server after building. |
| `bun run lint` | Run ESLint. |
| `bun run typecheck` | Run TypeScript with `--noEmit`. |
| `bun run format` | Format TypeScript and TSX files with Prettier. |
| `bun run db:migrate` | Run Drizzle migrations. |

## Development Documentation

See [DEVELOPMENT.md](./DEVELOPMENT.md) for local setup, architecture notes, environment guidance, database workflow, API details, and debugging tips.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution rules, branch naming, commit guidance, pull request expectations, and review standards.

## Security Notes

- Do not commit `.env.local` or any provider secret.
- Treat uploaded receipt images as sensitive user data.
- Avoid logging full receipt payloads or image URLs in production.
- Keep auth checks inside API routes even when UI routes are protected.
- Prefer server-side signing for uploads and server-side deletion for temporary assets.

## License

Arkivo is licensed under the GNU Affero General Public License v3.0. See [LICENSE](./LICENSE).
