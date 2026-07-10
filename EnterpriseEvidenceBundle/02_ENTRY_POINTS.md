# Entry Points

## Frontend
* SPA Entry: `src/main.tsx`
* Root Component: `src/App.tsx`

## Backend Server
* Express Entry: `server.ts`
* Server Setup: `src/server/setup.ts`

## API Routers
* Main API Router: `src/server/routes/index.ts` (Mounted at `/api`)
* Installation: `src/server/routes/installation.ts`

## Worker / Scheduler
* Nessun worker o cron job dedicato documentato al di fuori del runtime Express o setInterval lato client.

## CLI / Desktop
* Desktop Bridges (`DesktopRuntime.ts`) sono placeholder, nessuna CLI reale esportata nel package.json.
