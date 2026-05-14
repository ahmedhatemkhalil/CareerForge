# CareerForge frontend

Vite + React app. Source lives under `src/`.

## Scripts

- `npm run dev` — start the dev server (uses root `index.html` as the Vite entry)
- `npm run build` — production build
- `npm run preview` — preview the production build

## Environment

Copy `.env.example` to `.env` and set `VITE_API_URL` to your backend API base URL.

## Structure

- `src/components` — UI (shadcn in `components/ui`), layout, common, shared
- `src/pages` — route-level screens
- `src/services`, `src/stores`, `src/hooks`, `src/utils` — app logic (stub files ready to fill in)
- `src/styles/globals.css` — Tailwind + theme (shadcn)

Static assets served as-is go in `public/` (e.g. `favicon.ico`, `icons.svg`).

**Note:** Vite’s HTML entry is **`index.html` at the project root** (not under `public/`). A duplicate `public/index.html` can shadow `/index.html` in dev, so only the root file is used here.
