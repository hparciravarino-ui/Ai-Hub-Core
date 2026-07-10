# Configuration

## package.json
* Dependencies: `react`, `vite`, `express`, `tailwindcss`, `@google/genai`, `lucide-react`, `adm-zip`, `systeminformation`, `multer`.
* Scripts: `dev` (tsx server.ts), `build` (vite build & esbuild), `start` (node dist/server.cjs), `lint` (tsc --noEmit).

## tsconfig
* Strict mode enabled. Node and DOM types included.

## Vite
* React Plugin. Tailwind PostCSS integration. SPA mode.

## Docker
* Unspecified natively in tree, relies on host execution or standard Node.js container environments (e.g. Cloud Run).
