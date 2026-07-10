# API Catalog

## Health
* `GET /api/health`: Application health check. Output: Status. Controller: `healthRouter`.

## Hardware
* `GET /api/hardware/scan`: Returns CPU, RAM, GPU specs. Controller: `hardwareRouter`.
* `GET /api/hardware/metrics`: Real-time system load. Controller: `hardwareRouter`.

## Models
* `GET /api/models/recommendations`: Returns suggested models based on hardware. Controller: `modelsRouter`.
* `GET /api/models/compatibility`: Evaluates model fit against system. Controller: `modelsRouter`.

## Benchmark
* `POST /api/benchmark/run`: Initiates stress test. Output: Score and analysis. Controller: `benchmarkRouter`.

## Files
* `POST /api/files/upload`: Multi-part form upload. Handles ZIP auto-extraction. Controller: `filesRouter`. Middleware: `multer`.
* `GET /api/files/list`: Returns local workspace file directory contents. Controller: `filesRouter`.

## Installation
* `GET /api/setup/env`: Reads `.env` or `.env.example`. Controller: `installationRouter`.
* `POST /api/setup/env/create`: Writes to `.env`. Controller: `installationRouter`.
* `GET /api/setup/diagnostics`: Runs system pre-flight checks (Node ver, Write Permissions, Disk Space). Controller: `installationRouter`.
* `POST /api/setup/dependencies/repair`: Triggers `npm install`. Controller: `installationRouter`.

## Security
* `GET /api/enterprise/security/status`: Security module heartbeat. Controller: `securityRouter`.
