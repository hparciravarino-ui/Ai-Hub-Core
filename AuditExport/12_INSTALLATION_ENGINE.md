# Installation Engine

## Installation Wizard
* Endpoint: `/api/setup/*` (handled by `installationRouter.ts`).
* Features: UI-driven configuration, environment variable generation.

## Health Check
* Node Version verification (>= 18 required).
* Disk Space check (> 20 GB free expected).
* Write Permission test on CWD to ensure sandbox integrity.
* Port Collision detection (Port 3000, 11434).

## Configuration & Repair
* Safely reads/writes `.env`.
* Capable of running `npm install` programmatically via `child_process.execPromise` for dependency repair.
