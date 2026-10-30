# GBP-Guard blog backend

Deploy this directory as its own Node service.

- Build/install command: `npm ci`
- Start command: `npm start`
- Node version: 20+
- Health check: `/health`
- Blog API: `/api/v1/posts`

Configure the backend environment variables from `.env.example` in the hosting provider. Configure the frontend separately with:

```env
NEXT_PUBLIC_BACKEND_API_URL=https://gbp-guard.onrender.com/api/v1
```

After changing a Vercel environment variable, redeploy the frontend. Next.js embeds `NEXT_PUBLIC_*` values at build time.
