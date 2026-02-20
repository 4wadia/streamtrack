# Free Deployment (Vercel + Render)

This setup keeps frontend and backend separate, both on free tiers.

- Frontend: Vercel (`frontend/`)
- Backend: Render Web Service (`backend/`, Docker/Bun)
- Database: MongoDB Atlas free cluster

## 1) Backend on Render (dev branch)

1. Push repo to GitHub.
2. In Render, create Blueprint from repo (uses `render.yaml`).
3. Service created: `streamtrack-api-dev` on branch `dev`.
4. Set secret env vars in Render service:
- `MONGO_URI`
- `TMDB_API_KEY`
- `FIREBASE_SERVICE_ACCOUNT_JSON` (entire Firebase Admin JSON as one line)
- `ALLOWED_ORIGINS` (example: `https://your-vercel-app.vercel.app,https://app.yourdomain.com,http://localhost:4200`)

Health URL:
- `https://streamtrack-api-dev.onrender.com/health`

## 2) Frontend on Vercel

1. Import repo into Vercel.
2. Set Root Directory to `frontend`.
3. Framework preset: Angular.
4. Build command: `bun run build` (or default Angular build).
5. Output directory: `dist/frontend/browser`.
6. Deploy branch `dev` for dev environment.

`frontend/vercel.json` rewrites:
- `/api/*` -> Render backend (`https://streamtrack-api-dev.onrender.com/api/*`)
- SPA fallback to `/index.html`

## 3) Firebase Auth domain allowlist

In Firebase Console -> Authentication -> Settings -> Authorized domains, add:
- Vercel preview domain(s)
- Vercel custom domain(s)
- Any local/dev domains you use

If domain is missing, auth flows fail in browser even when API is healthy.

## 4) Optional prod split

Repeat with `main` branch:
- Render service: `streamtrack-api-prod` (branch `main`)
- Vercel production: `main`
- Update prod `frontend/vercel.json` destination to prod API URL.
