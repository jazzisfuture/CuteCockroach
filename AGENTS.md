# AGENTS.md

## Cursor Cloud specific instructions

This is a single-page **Vite + React 19 + TypeScript** app: an interactive "Cute Cockroach Swarm" boid simulation. There is no backend, database, or auth. All rendering happens client-side in `components/Simulation.tsx`, with UI controls in `components/ControlPanel.tsx`.

### Running / building / linting

Standard scripts are in `package.json`:
- `npm run dev` — start the Vite dev server (see `vite.config.ts`: it binds `0.0.0.0:3000`).
- `npm run build` — production build to `dist/`.
- `npm run preview` — serve the production build.

There is **no lint script and no test suite** in this repo. TypeScript is checked implicitly by the Vite build (`tsc` is not run separately). To type-check without emitting, use `npx tsc --noEmit`.

### Non-obvious caveats

- `vite.config.ts` wires `GEMINI_API_KEY` into `process.env.API_KEY`, but **no application code actually uses it** — the simulation is pure client-side math. No secret/API key is required to run, build, or demo the app.
- The `docs/` folder is an **unrelated** static GitHub Pages site (a travel itinerary) deployed by `.github/workflows/pages.yml` on pushes touching `docs/**`. It is not the Vite app and does not need to be built.
- The Vite dev server must be reached on port `3000`.
