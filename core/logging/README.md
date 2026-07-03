# Logging Module

## Public Interface
- `ILogger`: Interface defining logging methods (`debug`, `info`, `warn`, `error`, `critical`).
- `Logger`: Singleton class implementing `ILogger` and system-wide logging.

## Configuration
Controlled by environmental variable `LOG_LEVEL` (e.g. `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`).

## Implementation
Located in `/core/logging/Logger.ts`. Highly efficient, structured console streaming.

## Tests
Self-contained unit test script located in `/core/logging/Logger.test.ts`.
