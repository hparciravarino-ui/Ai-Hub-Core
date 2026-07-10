# Runtime Flow

1. **Boot**: `server.ts` runs via `tsx` (dev) or `node` (prod).
2. **Setup**: Express mounts middlewares, API routes (`/api/*`), and Vite SPA fallback.
3. **Frontend Init**: `main.tsx` injects React `App` into DOM.
4. **Hardware Validation**: SystemDashboard requests `/api/hardware/scan` to populate metrics.
5. **Model Setup**: User configures keys in UI (Security/Providers), keys are sent via HTTP Headers on subsequent requests.
6. **Interaction**: User types in `ProfessionalChat`, `apiClient.ts` dispatches fetch to provider directly or to backend.
7. **RAG / Files**: User uploads file -> `/api/files/upload` -> Processed to `workspace_uploads/` -> Vector Embeddings generated -> Injected to chat context.
