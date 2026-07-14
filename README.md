# memo

Minimal password-gated notes app with multi-device sync.

Live: [memo.chasehuh.com](https://memo.chasehuh.com)

## Stack

- Next.js (App Router)
- Postgres (`pg`)
- Vercel + env-based auth gate

## Setup

```bash
pnpm install
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `MEMO_PASSWORD` | Login password |
| `MEMO_SECRET` | HMAC secret for session cookies |
| `MEDIA_UPLOAD_URL` | (optional) Upload worker URL for pasted/dropped images |
| `MEDIA_UPLOAD_SECRET` | (optional) Shared bearer secret for the upload worker |

When media env vars are set, pasting or dropping an image uploads it and inserts `![alt](url)` Markdown at the caret.

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Point the project at Vercel (or similar), set the same three env vars for Production, and attach a domain if you want.

## License

[MIT](./LICENSE)
