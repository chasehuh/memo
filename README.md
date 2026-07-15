# agentnote

Minimal notepad built to sit next to the agent tab.

Live: [www.agentnote.dev](https://www.agentnote.dev)

## Stack

- Next.js (App Router) + `proxy.ts` (Next 16)
- Clerk (`agentnote` app) with **GitHub OAuth** sign-in
- CodeMirror 6 note editor (Zed-like chrome, soft wrap, Tab→spaces; ⌘⌫ deletes to hard line start, ⇧⌘K deletes the line)
- Postgres (`pg`) — notes scoped by Clerk `user_id`
- Vercel
- Optional macOS desktop shell (Tauri 2) that loads the web app

## Setup

```bash
pnpm install
cp .env.example .env.local
```

### Clerk application

Use a dedicated Clerk application named **`agentnote`** (do **not** attach this project to sume.com / sume.so Clerk apps).

```bash
# Link the existing agentnote app and pull keys into .env.local
clerk link --app <app_id>
clerk env pull

# Development: enable GitHub with Clerk shared credentials
clerk config patch --json '{"connection_oauth_github":{"enabled":true}}' --yes
```

Required env (see `.env.example`):

```bash
DATABASE_URL=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
```

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with GitHub.

When media env vars are set, pasting or dropping an image uploads it (Clerk-authenticated) under a preferred key prefix `agentnote/{userId}/…` and inserts `![alt](url)` Markdown at the caret. CodeMirror renders that mark as an inline preview under the source line (Obsidian Live Preview–style). Drag the corner handle to rewrite Obsidian `|width` syntax (`![alt|480](url)`); double-click the handle to clear the width. The Markdown string remains the only source of truth for body sync and persistence.

### Production GitHub OAuth App (human step)

Development can use Clerk’s shared GitHub credentials. Production needs a GitHub OAuth App:

1. Create an OAuth App at [GitHub Developer Settings](https://github.com/settings/developers) (under `chasehuh` or the operator account).
2. Set **Homepage URL** to `https://www.agentnote.dev`.
3. Set **Authorization callback URL** to the value shown in the Clerk Dashboard for the **agentnote** production instance → Social connections → GitHub (typically `https://clerk.agentnote.dev/v1/oauth_callback`).
4. Paste Client ID + Client Secret into Clerk production → GitHub connection.
5. Keep production domain `agentnote.dev` / `www.agentnote.dev` in Clerk, deploy with production Clerk keys on Vercel.

### Existing notes without `user_id`

Existing rows created before Clerk have no `user_id`. After the first GitHub sign-in, copy your Clerk user id from the Clerk Dashboard (Users) and run:

```sql
UPDATE notes SET user_id = 'user_...' WHERE user_id IS NULL;
ALTER TABLE notes ALTER COLUMN user_id SET NOT NULL;
```

(`ensureSchema` will set `NOT NULL` automatically once no nulls remain.)

## Desktop (macOS)

Thin [Tauri 2](https://v2.tauri.app/) shell under `apps/desktop`. It loads the **same** web UI — no second frontend, no local notes DB.

| Mode | Webview URL |
| --- | --- |
| `pnpm desktop:dev` | `http://localhost:3000` |
| `pnpm desktop:build` | `https://www.agentnote.dev` |

Prerequisites: Rust (`rustup`), Xcode Command Line Tools, and (for `desktop:dev`) the Next app running on port 3000.

```bash
# Terminal A
pnpm dev

# Terminal B
pnpm desktop:dev
```

Production `.app`:

```bash
pnpm desktop:build
# → apps/desktop/src-tauri/target/release/bundle/macos/agentnote.app
```

(DMG packaging is optional; enable `"targets": ["app", "dmg"]` in `tauri.conf.json` if you want it.)

Window chrome uses macOS Overlay titlebar + traffic lights; the in-page Zed-like titlebar gets a left padding when `data-desktop="tauri"` is set. Existing shortcuts (`⌘B`, `⌘N`, `⌘\`) stay in the web app.

**Clerk / OAuth note:** GitHub OAuth inside WKWebView can fail (popups, cookie partitions, redirects). If sign-in breaks in the desktop shell, use the browser app or follow up with system-browser OAuth. The shell does not embed Clerk secrets or `DATABASE_URL`.

Packaging layout is loosely inspired by [fastrepl/anarlog](https://github.com/fastrepl/anarlog) `apps/desktop` — not its local-first stack.

## Deploy

Point the project at Vercel, set the Clerk + `DATABASE_URL` env vars for Production, attach `www.agentnote.dev`, and complete the production GitHub OAuth App steps above.

## License

[MIT](./LICENSE)
