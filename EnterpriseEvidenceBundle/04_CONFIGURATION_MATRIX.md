# Configuration Matrix

## package.json
* App Type: module
* Scripts: `dev` (tsx server.ts), `build` (vite & esbuild), `start` (node dist/server.cjs), `lint`.

## tsconfig.json
* Typescript config per Vite e Node. Target ES2020. Strict mode.

## vite.config.ts
* Vite React plugin. TailwindCSS plugin.

## .env.example
* File di configurazione ambiente supportato da `/api/setup/env`.

## Docker
* Nessun file `Dockerfile` o `docker-compose.yml` nativo nel tree.
