# Installation Pipeline

## Flusso
* Wizard UI (`InstallationSetupCenter.tsx`) -> Setup API (`/api/setup/*`).
* Prerequisiti: Controllati via `/api/setup/diagnostics` (Node >= 18, free space > 20GB).
* Configurazione: Scrittura payload in `.env` via `/api/setup/env/create`.
* Repair: Esecuzione `npm install` via `child_process.execPromise` (`/api/setup/dependencies/repair`).
