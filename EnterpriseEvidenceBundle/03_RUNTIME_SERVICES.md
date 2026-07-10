# Runtime Services

## Backend
* **BenchmarkDatabase**: In-memory data store for benchmark runs. Lifecycle: Singleton/Static per process.
* **Express Server**: Handles HTTP requests. Lifecycle: Started via `server.ts`, port 3000.

## Frontend
* **HardwareService**: Polling client for `/api/hardware/metrics`. Lifecycle: Component-driven.
* **GeminiService**: SDK wrapper. Lifecycle: Instantiated per request/component.
* **VaultService**: In-memory map for secrets. Lifecycle: Static class.
