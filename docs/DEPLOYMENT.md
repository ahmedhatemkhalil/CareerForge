# CareerForge — Deployment & Hosting Guide (Railway)

This document explains **how CareerForge is deployed and hosted** on [Railway](https://railway.app). It is written for presentations, code reviews, and onboarding teammates.

---

## 1. Simple summary (30-second pitch)

> CareerForge is a **monorepo** (one GitHub repository with multiple apps). We deploy it on **Railway** as **4 separate cloud services** plus **external databases/APIs**.
>
> - **Frontend** (React) and **Admin** (Angular) are **Dockerized**: built into static files and served by **nginx**.
> - **Backend** (Node.js/Express) runs **directly on Railway** without Docker.
> - **AI** runs **Langflow in Docker** for CV analysis, interviews, and roadmaps.
> - **MongoDB Atlas** stores application data.
> - **Google, Stripe, Gemini** are external APIs integrated via environment variables.

When we push code to GitHub, Railway automatically rebuilds and redeploys each service.

---

## 2. Architecture overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USERS                                       │
│         Job seekers (Frontend)          Admins (Admin panel)             │
└───────────────┬─────────────────────────────────┬───────────────────────┘
                │ HTTPS                           │ HTTPS
                ▼                                 ▼
┌───────────────────────────┐       ┌───────────────────────────┐
│  Frontend Service         │       │  Admin Service            │
│  React + Vite + nginx       │       │  Angular + nginx          │
│  Docker · Port 80         │       │  Docker · Railway PORT    │
└─────────────┬─────────────┘       └─────────────┬─────────────┘
              │                                     │
              │  API calls (browser → backend)        │
              └──────────────────┬──────────────────┘
                                 ▼
              ┌──────────────────────────────────────┐
              │  Backend Service                      │
              │  Node.js + Express                    │
              │  No Docker · Railway PORT             │
              └──────┬────────────────────┬──────────┘
                     │                    │
         ┌───────────┘                    └──────────────┐
         ▼                                                ▼
┌─────────────────┐                            ┌─────────────────┐
│  MongoDB Atlas  │                            │  AI Service      │
│  (database)     │                            │  Langflow Docker │
└─────────────────┘                            └────────┬────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Google Gemini   │
                                               │  (via Langflow)  │
                                               └─────────────────┘

External: Google OAuth · Stripe · Serper · Cloudinary
```

---

## 3. What is Railway?

**Railway** is a cloud platform (PaaS — Platform as a Service) that:

| Feature | How we use it |
|---------|----------------|
| **GitHub integration** | Push to `develop` → auto deploy |
| **Multiple services** | One repo, 4 services with different root folders |
| **Environment variables** | Secrets & config per service |
| **Public HTTPS URLs** | Each service gets `*.up.railway.app` |
| **Docker support** | Builds images from our `Dockerfile`s |
| **Volumes** | Persistent storage for Langflow flows |

We chose Railway because it supports our **monorepo** structure and **Docker** without managing our own servers.

---

## 4. What is Dockerization?

### 4.1 What Docker does (simple explanation)

**Docker** packages an app and everything it needs to run into an **image**. That image runs in a **container** — a lightweight, isolated environment that behaves the same on any machine.

Think of it like a **shipping container**: whatever is inside runs the same way in development, on Railway, or anywhere else.

### 4.2 Why we Dockerized some services but not others

| Service | Docker? | Why |
|---------|---------|-----|
| **Frontend** | Yes | Production build is static HTML/JS/CSS → nginx serves it efficiently |
| **Admin** | Yes | Same as frontend (Angular build → static files) |
| **AI (Langflow)** | Yes | Langflow ships as a Docker image; we customize it for Railway |
| **Backend** | No | Plain Node.js app; Railway runs `npm start` directly (simpler, no container needed) |

### 4.3 Multi-stage Docker build (Frontend & Admin)

Both frontend and admin use a **multi-stage Dockerfile** — two steps in one file:

```
Stage 1 (build)                    Stage 2 (production)
─────────────────                  ─────────────────────
node:20-alpine                     nginx:alpine
  ↓                                  ↓
npm ci                             Copy built static files
  ↓                                  ↓
npm run build  →  dist/            nginx serves files on HTTP
```

**Why two stages?**

- Stage 1 needs Node.js, npm, and dev dependencies to **build** the app.
- Stage 2 only needs **nginx** to **serve** the result — smaller, faster, more secure final image.

The final container does **not** include Node.js or source code — only the compiled website.

---

## 5. Service-by-service deployment

### 5.1 Frontend (`frontend/`)

**Stack:** React + Vite  
**Railway root directory:** `frontend`  
**Deploy method:** Docker (`frontend/Dockerfile`)

#### Dockerfile breakdown

```dockerfile
# STAGE 1 — Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci                          # Install dependencies
COPY . .
ARG VITE_API_URL=...                # Build-time config
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build                   # Output → dist/

# STAGE 2 — Serve
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### nginx configuration

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

This is required for **SPA routing** (React Router). Without it, refreshing `/dashboard` would return 404 — nginx would look for a physical file. `try_files` falls back to `index.html` so React handles the route.

#### Why no API proxy in nginx?

Originally nginx proxied `/api/` to `http://backend:5000`. That only works in **Docker Compose** where services share a network and hostname `backend`.

On Railway, each service is **independent** with its own URL. The browser calls the backend directly using `VITE_API_URL`.

#### Railway settings

| Setting | Value |
|---------|--------|
| Root Directory | `frontend` |
| Builder | Dockerfile |
| Port | `80` |

#### Environment variables (build time)

| Variable | Example | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | `https://backend.up.railway.app/api` | Backend API base URL (baked into JS bundle) |
| `VITE_GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Google OAuth in browser |

> **Important:** Vite variables are embedded at **build time**. Changing them requires a **redeploy/rebuild**, not just a restart.

---

### 5.2 Backend (`backend/`)

**Stack:** Node.js + Express + Mongoose  
**Railway root directory:** `backend`  
**Deploy method:** Railway **Nixpacks** (auto-detects Node.js, runs `npm start`)

#### How it starts

```json
"scripts": {
  "start": "node server.js"
}
```

1. `server.js` connects to MongoDB
2. Starts Express on `process.env.PORT` (Railway injects this)
3. Exposes REST API under `/api/*`

#### No Dockerfile

The backend is interpreted JavaScript — no compile step. Railway installs dependencies and runs `node server.js`. This is simpler and faster than containerizing.

#### Railway settings

| Setting | Value |
|---------|--------|
| Root Directory | `backend` |
| Builder | Nixpacks (default) |
| Port | Auto (Railway `PORT`) |
| Start Command | `npm start` (default) |

#### Key environment variables (runtime)

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET`, `REFRESH_SECRET` | Authentication tokens |
| `FRONTEND_URL` | Stripe redirects, email links, CORS |
| `LANGFLOW_URL` + flow IDs | AI service integration |
| `GOOGLE_CLIENT_ID/SECRET` | OAuth token exchange |
| `STRIPE_SECRET_KEY` | Payments |

See `backend/.env.example` for the full list.

#### CORS

The browser (frontend) and API (backend) are on **different domains**. The backend must allow cross-origin requests via **CORS** middleware. Production frontend URL must match `FRONTEND_URL`.

---

### 5.3 Admin panel (`admin/`)

**Stack:** Angular 19  
**Railway root directory:** `admin` (not `/admin`)  
**Deploy method:** Docker (`admin/Dockerfile`)

Same concept as frontend: build Angular → serve static files with nginx.

#### Differences from frontend

| Topic | Admin |
|-------|-------|
| Build output | `dist/admin/browser/` |
| API URL injection | `sed` replaces `__API_URL__` in `environment.prod.ts` before build |
| Port | Uses `docker-entrypoint.sh` to listen on Railway's `$PORT` |
| `railway.toml` | Forces Dockerfile builder (prevents Nixpacks `serve` fallback) |

#### docker-entrypoint.sh (why it exists)

Railway assigns a dynamic `PORT` environment variable. The entrypoint script:

1. Reads `$PORT` (default 80)
2. Writes nginx config with `listen ${PORT}`
3. Starts nginx

Deploy logs should show: `nginx listening on port XXXX`

#### Railway settings

| Setting | Value |
|---------|--------|
| Root Directory | `admin` |
| Builder | Dockerfile |
| Port | Match deploy log (`8080` or auto) |
| Custom build/start commands | **None** (remove if set) |

#### Environment variables (build time)

| Variable | Example |
|----------|---------|
| `API_URL` | `https://backend.up.railway.app/api` |

---

### 5.4 AI service (`ai/`)

**Stack:** Langflow 1.9.0 (visual AI workflow tool)  
**Railway root directory:** `ai`  
**Deploy method:** Docker (`ai/Dockerfile`)

#### What Langflow does

Langflow runs our AI **flows** (imported JSON files):

| Flow file | Feature |
|-----------|---------|
| `cvAnalysis.json` | CV vs job description analysis |
| `interview.langflow-1.9.json` | Mock interview (Agent + Gemini) |
| `roadmap.json` | Career roadmap generation |

The **backend does not call Gemini directly** for these features — it sends HTTP requests to Langflow, which runs the flows.

#### Dockerfile customizations for Railway

```dockerfile
FROM langflowai/langflow:1.9.0
USER root                                    # Railway volume permissions
ENV LANGFLOW_DATA_DIR=/data                  # Persistent flows DB
ENV LANGFLOW_DATABASE_URL=sqlite:////data/langflow.db
ENV LANGFLOW_WORKERS=1                       # Reduce memory usage
CMD langflow run --host 0.0.0.0 --port ${PORT:-7860}
```

#### Railway volume (required)

Mount a volume at `/data` so imported flows and Langflow's SQLite database survive redeploys.

#### Railway settings

| Setting | Value |
|---------|--------|
| Root Directory | `ai` |
| Builder | Dockerfile |
| Volume | `/data` |
| RAM | Recommend **2 GB** (Langflow OOMs on 512 MB) |
| Port | `7860` or Railway `PORT` |

After deploy: open Langflow UI → import flows → configure Gemini API key in each Agent node → copy flow IDs to backend env vars.

---

## 6. External services (not on Railway)

| Service | Role |
|---------|------|
| **MongoDB Atlas** | Users, CVs, interviews, payments, OAuth accounts |
| **Google Cloud Console** | OAuth login (register redirect URIs for production URL) |
| **Stripe** | Subscription checkout & billing |
| **Google Gemini** | AI generation (via Langflow) |
| **Serper** | Job search & learning resources |
| **Cloudinary** | File uploads (optional) |

---

## 7. How services communicate

### 7.1 Browser → Backend (most API calls)

```
User opens https://career-forge.up.railway.app
         ↓
React app loads (from nginx)
         ↓
axios calls VITE_API_URL → https://backend.up.railway.app/api/...
         ↓
Express handles request, reads/writes MongoDB
```

### 7.2 Backend → Langflow (AI features)

```
User requests CV analysis
         ↓
Backend POST → LANGFLOW_URL/api/v1/run/{FLOW_ID}
         ↓
Langflow runs Agent + Gemini flow
         ↓
Backend parses response → returns JSON to frontend
```

### 7.3 Stripe payment flow

```
User clicks Subscribe
         ↓
Frontend → Backend creates Stripe Checkout session
         ↓
success_url = FRONTEND_URL/payment/success?session_id=...
         ↓
User pays on Stripe → redirected to frontend success page
         ↓
Frontend → Backend confirms session → upgrades plan in MongoDB
```

### 7.4 Google OAuth flow

```
User clicks "Sign in with Google"
         ↓
Browser → Google (client_id from VITE_GOOGLE_CLIENT_ID)
         ↓
Google redirects → FRONTEND_URL/oauth/callback?code=...
         ↓
Frontend sends code → Backend /api/oauth/google
         ↓
Backend exchanges code with Google (uses GOOGLE_CLIENT_SECRET)
         ↓
Backend creates/finds user → returns JWT tokens
```

---

## 8. Deployment workflow (CI/CD)

```
Developer
    │
    ▼
git push to GitHub (develop branch)
    │
    ▼
Railway detects changes per service
    │
    ├── frontend/ changed → docker build → deploy nginx container
    ├── backend/ changed  → npm install → npm start
    ├── admin/ changed    → docker build → deploy nginx container
    └── ai/ changed       → docker build → deploy Langflow container
    │
    ▼
Each service gets HTTPS URL
    │
    ▼
Status: Active ✓
```

**No manual server setup** — no SSH, no installing Node on a VPS, no configuring nginx by hand on a VM.

---

## 9. Environment variables cheat sheet

### Build time vs runtime

| Type | When applied | Services |
|------|--------------|----------|
| **Build time** | During `docker build` / `npm run build` | `VITE_*` (frontend), `API_URL` (admin) |
| **Runtime** | When container/process starts | Backend, Langflow, most secrets |

### Per-service summary

| Service | Required variables |
|---------|-------------------|
| **Frontend** | `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID` |
| **Backend** | `MONGODB_URI`, `JWT_SECRET`, `REFRESH_SECRET`, `FRONTEND_URL`, `LANGFLOW_URL`, flow IDs, API keys |
| **Admin** | `API_URL` |
| **AI** | `GOOGLE_API_KEY` (also paste in Langflow UI per flow) |

Copy templates from:

- `frontend/.env.example`
- `backend/.env.example`
- `admin/.env.example`
- `ai/.env.example`

---

## 10. Repository structure (deployment files)

```
CareerForge/
├── frontend/
│   ├── Dockerfile          # Multi-stage: Vite build → nginx
│   ├── nginx.conf          # SPA routing
│   ├── .dockerignore       # Excludes node_modules, .env
│   └── .env.example
├── admin/
│   ├── Dockerfile          # Multi-stage: Angular build → nginx
│   ├── docker-entrypoint.sh  # Dynamic PORT for Railway
│   ├── railway.toml        # Force Dockerfile builder
│   ├── .dockerignore
│   └── .env.example
├── backend/
│   ├── server.js           # Entry point
│   ├── app.js              # Express + CORS + routes
│   └── .env.example
├── ai/
│   ├── Dockerfile          # Langflow 1.9 + Railway fixes
│   ├── docker-compose.yml  # Local development only
│   ├── cvAnalysis.json     # Langflow flows to import
│   ├── interview.langflow-1.9.json
│   └── roadmap.json
└── docs/
    └── DEPLOYMENT.md       # This file
```

---

## 11. Common issues & fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| API calls go to wrong URL | `VITE_API_URL` missing `https://` | Use full URL: `https://backend.up.railway.app/api` |
| CORS error on login | Frontend URL not allowed / backend down | Set `FRONTEND_URL`, verify backend root URL works |
| Google OAuth `redirect_uri_mismatch` | Production URL not in Google Console | Add `https://your-frontend.up.railway.app/oauth/callback` |
| Stripe redirect to "train not found" | `FRONTEND_URL` is placeholder | Set real frontend URL on backend |
| Admin 502 | Nixpacks used `serve` instead of Docker | Root dir `admin`, builder Dockerfile, correct port |
| Langflow crash loop | Out of memory | Upgrade to 2 GB RAM, `LANGFLOW_WORKERS=1` |
| `client_id=undefined` | `VITE_GOOGLE_CLIENT_ID` not set at build | Set on Railway frontend + redeploy |
| Flows lost after redeploy | No volume on AI service | Mount Railway volume at `/data` |

---

## 12. Presentation Q&A (instructor questions)

**Q: Why not deploy everything on one server?**  
A: We use a **microservices-style** split. Frontend, admin, backend, and AI deploy independently — a bug in one doesn't require redeploying all.

**Q: Why Docker for frontend but not backend?**  
A: Frontend/admin are **static sites** after build — nginx in Docker is the standard pattern. Backend is live Node.js; Railway runs it directly without needing a container.

**Q: Where is the database?**  
A: **MongoDB Atlas** — managed cloud database, connected via `MONGODB_URI`.

**Q: How does AI work in production?**  
A: Backend calls **Langflow** over HTTP. Langflow runs **Gemini** inside visual flows we import as JSON.

**Q: What happens when you push code?**  
A: Railway pulls from GitHub, rebuilds affected services, and swaps running containers with zero manual steps.

**Q: How do you handle secrets?**  
A: Environment variables in Railway dashboard — never committed to Git (`.env` is in `.gitignore` / `.dockerignore`).

**Q: Why nginx instead of `ng serve` or `vite preview` in production?**  
A: Dev servers are not optimized for production (security, performance, stability). nginx efficiently serves static files and handles thousands of concurrent users.

---

## 13. Local development vs production

| | Local | Production (Railway) |
|---|-------|---------------------|
| Frontend | `npm run dev` → `:5173` | Docker + nginx → `:80` |
| Admin | `npm start` → `:4200` | Docker + nginx → `$PORT` |
| Backend | `npm run dev` → `:5000` | `npm start` → Railway `PORT` |
| AI | Docker Compose or Langflow local → `:7860` | Docker on Railway + volume |
| Database | MongoDB Atlas (same or local) | MongoDB Atlas |
| API URL | `http://localhost:5000/api` | `https://backend.up.railway.app/api` |

---

## 14. Quick setup checklist (new Railway project)

- [ ] Create Railway project from GitHub repo
- [ ] Add **4 services** with correct root directories: `frontend`, `backend`, `admin`, `ai`
- [ ] Set all environment variables from `.env.example` files
- [ ] Frontend: builder Dockerfile, port 80
- [ ] Admin: builder Dockerfile, `railway.toml`, match networking port to deploy logs
- [ ] AI: mount volume `/data`, 2 GB RAM, import Langflow flows
- [ ] Backend: set `FRONTEND_URL` to actual frontend domain
- [ ] Google Console: add production OAuth redirect URI
- [ ] Generate public domains for each service
- [ ] Test: login, CV analysis, interview, payment, admin panel

---

*Last updated: July 2026 — CareerForge graduation project deployment documentation.*
