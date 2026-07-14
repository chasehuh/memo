# memo

Minimal GitHub-authenticated notes app with multi-device sync.

Live: [memo.chasehuh.com](https://memo.chasehuh.com)

## Stack

- Next.js (App Router) + `proxy.ts` (Next 16)
- Clerk (`memo` app) with **GitHub OAuth** sign-in
- CodeMirror 6 note editor (Zed-like chrome, soft wrap, Tab→spaces; ⌘⌫ deletes to hard line start, ⇧⌘K deletes the line)
- Postgres (`pg`) — notes scoped by Clerk `user_id`
- Vercel

## Setup

```bash
pnpm install
cp .env.example .env.local
```

### Clerk application

Use a dedicated Clerk application named **`memo`** (do **not** attach this project to sume.com / sume.so Clerk apps).

```bash
# Link the existing memo app (example id) and pull keys into .env.local
clerk link --app app_3GUqhg4DzatRYoNZqVnJofSq0Hw
clerk env pull

# Development: enable GitHub with Clerk shared credentials
clerk config patch --json '{"connection_oauth_github":{"enabled":true,"authenticatable":true}}'
```

Fill in `.env.local`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/login` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/login` |
| `MEDIA_UPLOAD_URL` | (optional) Upload worker URL for pasted/dropped images |
| `MEDIA_UPLOAD_SECRET` | (optional) Shared bearer secret for the upload worker |

When media env vars are set, pasting or dropping an image uploads it (Clerk-authenticated) under a preferred key prefix `memo/{userId}/…` and inserts `![alt](url)` Markdown at the caret. CodeMirror renders that mark as an inline preview under the source line (Obsidian Live Preview–style). Drag the corner handle to rewrite Obsidian `|width` syntax (`![alt|480](url)`); double-click the handle to clear the width. The Markdown string remains the only source of truth for body sync and persistence.

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with GitHub.

### Production GitHub OAuth App (human step)

Development can use Clerk’s shared GitHub credentials. Production needs a GitHub OAuth App:

1. Create an OAuth App at [GitHub Developer Settings](https://github.com/settings/developers) (under `chasehuh` or the operator account).
2. Set **Homepage URL** to `https://memo.chasehuh.com`.
3. Set **Authorization callback URL** to the value shown in the Clerk Dashboard for the **memo** production instance → Social connections → GitHub (typically `https://<clerk-frontend-api>/v1/oauth_callback`).
4. Paste Client ID + Client Secret into Clerk production → GitHub connection.
5. Add production domain `memo.chasehuh.com` in Clerk, deploy with production Clerk keys on Vercel.

## Legacy notes backfill

Existing rows created before Clerk have no `user_id`. After the first GitHub sign-in, copy your Clerk user id from the Clerk Dashboard (Users) and run:

```sql
-- Replace USER_ID with the owner's Clerk user id (e.g. user_...)
UPDATE notes
SET user_id = 'USER_ID'
WHERE user_id IS NULL;

-- Then enforce NOT NULL (ensureSchema also does this once no NULLs remain)
ALTER TABLE notes ALTER COLUMN user_id SET NOT NULL;
```

`ensureSchema` adds `user_id`, indexes `(user_id, updated_at DESC)`, and only sets `NOT NULL` when every row is already owned.

## Deploy

Point the project at Vercel, set the Clerk + `DATABASE_URL` env vars for Production, attach `memo.chasehuh.com`, and complete the production GitHub OAuth App steps above.

## License

[MIT](./LICENSE)
