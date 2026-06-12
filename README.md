# User Search Directory

A full-stack user search feature built for the Alphabin assignment. Searches across 10,000+ user profiles by name with real-time results, powered by PostgreSQL trigram indexing.

**Live:** https://alphabin-assignment.amansharma.cv

---

## Stack

- **Next.js 16** (App Router) + TypeScript
- **PostgreSQL** — with the `pg_trgm` extension for trigram-based search
- **Prisma 7** with `@prisma/adapter-pg`
- **HeroUI** for components, **Tailwind CSS v4** for styling
- Deployed on **Vercel**

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the database

Create a `.env.local` in the root directory:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
```

### 3. Apply the schema

```bash
npx prisma db push
```

### 4. Seed the database

The seed script enables the `pg_trgm` extension, creates the table and GIN index, and inserts 10,000 unique users in batches:

```bash
npx tsx scripts/seed.ts
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database Schema

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_name_trgm
  ON users USING gin (name gin_trgm_ops);
```

### Why trigram GIN indexes?

Standard B-Tree indexes only accelerate prefix searches (`LIKE 'Alex%'`). They are skipped entirely by the query planner for substring patterns (`LIKE '%alex%'`), resulting in a full table scan.

`pg_trgm` breaks strings into 3-character sequences — `"search"` becomes `" se"`, `"sea"`, `"ear"`, `"arc"`, etc. — and stores them in a GIN index. PostgreSQL can then resolve `ILIKE '%term%'` queries via an index lookup rather than scanning every row. At 10,000+ records this keeps search latency under 5ms.

One caveat: the trigram index only activates for queries of **3+ characters**. One- and two-character queries fall back to a sequential scan. At this dataset size it's still fast (~5–10ms), but worth knowing.

---

## API

### `GET /api/search`

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search query (space-separated terms) |
| `limit` | number | Results per page (clamped 1–100, default 12) |
| `offset` | number | Pagination offset (default 0) |

**Response:**
```json
{
  "users": [{ "id": "...", "name": "...", "email": "...", "created_at": "..." }],
  "total": 873,
  "queryTimeMs": 4.2
}
```

Multi-word queries apply `AND` logic — `"john smith"` matches users whose name contains both `"john"` and `"smith"`. The `findMany` and `count` queries run in parallel via `Promise.all`.

---

## Assumptions

- **Name search only.** The problem statement specifies searching by name; email is stored for display but not searched.
- **As-you-type UX, not form submit.** Real-time search is more useful here; the 250ms debounce keeps backend load reasonable.
- **No auth on the search endpoint.** Auth is assumed to be handled at a higher layer; the assignment scope is the search feature itself.
- **Offset pagination is acceptable at this scale.** With 10k rows, deep offset costs are negligible. Cursor-based pagination becomes important at millions of rows or with high write concurrency.
- **Single cloud database instance.** Mirrors a typical production setup; no read replicas or caching layer in scope.

---

## Trade-offs

**`pg_trgm` vs. full-text search (`tsvector`)**

PostgreSQL full-text search excels at whole-word, stemmed relevance matching (e.g., "running" → "run"). It performs poorly on partial name fragments (e.g., typing "ph" to find "Stephen"). Trigrams index arbitrary character sequences, making them the right default for name search.

**Prisma `contains` vs. raw SQL**

Prisma's `contains` with `mode: 'insensitive'` translates to `ILIKE '%term%'` on PostgreSQL — exactly what the trigram index expects. The trade-off is losing direct access to PostgreSQL-specific functions like `similarity()` for relevance ranking without dropping into `prisma.$queryRaw`. For this scope, Prisma is the right call: maintainable and fully type-safe.

**250ms debounce**

Prevents the DB from receiving a query per keystroke on a 10-letter search. Low enough to feel real-time for most typists, high enough to batch input meaningfully.

**Client-side pagination state vs. URL params**

Pagination and query state live in React state, not the URL. This trades shareability and browser history support for simplicity. URL params (`?q=john&page=2`) would be better in production.

---

## What I'd Improve With More Time

- **Relevance ranking** — use PostgreSQL's `similarity(name, query)` score to rank closer matches above loose ones, rather than sorting purely alphabetically
- **Cursor-based pagination** — avoids the row-skipping cost of deep offsets and stays consistent when rows are inserted or deleted during navigation
- **`AbortController` on fetch** — cancel in-flight requests when the user types a new character, preventing stale responses from racing
- **URL-based search state** — make results shareable and support browser back/forward navigation
- **Highlight matched substrings** — bold the matching portion of the name in results
- **Rate limiting** on `/api/search` — even a simple per-IP in-memory limiter would prevent abuse
- **Fix the "Connected" indicator** — currently shows green unconditionally; should reflect a real health check
- **Tests** — at minimum, API route tests covering empty queries, multi-term AND logic, and input edge cases (limit clamping, large offsets)
- **Redis cache** for high-frequency search terms to bypass the DB entirely on repeated queries