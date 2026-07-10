# Module Communication

* **Frontend -> Backend**: HTTP GET/POST fetch (es. `/api/hardware/scan`).
* **Frontend -> AI Provider**: HTTP Proxy (`apiClient.ts` -> OpenRouter/OpenAI) o Server Proxy (`/api/...)`.
* **Backend -> OS**: `systeminformation` library, `fs`, `os`, `child_process`.
