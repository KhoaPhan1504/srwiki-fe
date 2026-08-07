# SR-WIKI Frontend

React + Vite + TypeScript frontend for SR-WIKI's auth CRUD starter: register, login,
a Dashboard behind a right-side nav, and a Profile page (edit info, verify phone via
OTP, delete account). Talks to the [SR-WIKI backend](https://github.com/khoapabhsoft/srwiki-be)
over REST — axios with a refresh-token interceptor, Jotai for auth state, React Query
for data fetching, Tailwind CSS v4.

Live deployment: https://srwiki-fe.netlify.app (auto-deploys from `main`).

## Requirements

- Node.js 20+
- The [backend](https://github.com/khoapabhsoft/srwiki-be) running somewhere reachable
  (locally, or the deployed instance)

## Local setup

```bash
npm install
cp .env.template .env
```

`.env` variables:

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API, e.g. `http://localhost:8000` for a local backend or `https://srwiki-be.onrender.com` for the deployed one. The app throws a clear startup error if this is unset — it never silently falls back to a wrong URL. |

## Running locally

```bash
npm run dev
```

Opens at `http://localhost:5173`.

## Build

```bash
npm run build
```

Output goes to `dist/`. Note `VITE_API_BASE_URL` is baked into the build at build time
(Vite inlines `import.meta.env.*` values) — set it correctly *before* building for
whichever environment you're deploying to.

## Lint / format

```bash
npm run lint
npm run format
```

## Docker

```bash
docker build -t srwiki-fe --build-arg VITE_API_BASE_URL=http://localhost:8000 .
docker run -p 8080:80 srwiki-fe
```

Or from the SR-WIKI repo root, run both backend and frontend together via
`docker compose up` (see the root `docker-compose.yml`).

## Deployment

Deployed on [Netlify](https://netlify.com), connected to this repo's `main` branch —
pushing to `main` triggers an automatic rebuild + deploy. `VITE_API_BASE_URL` is set
per deploy context under Site configuration → Environment variables in the Netlify
dashboard (must be updated there, not just in the local `.env`, since Netlify builds
don't read the local file). `netlify.toml` configures the build command, publish
directory, and the SPA fallback redirect needed for client-side routing to survive a
page refresh.
