# Dependency Matrix

## Backend
* `server.ts` -> `express`, `helmet`, `cors`, `express-rate-limit`, `vite`.
* `routes/files.ts` -> `multer`, `adm-zip`.
* `routes/installation.ts` -> `systeminformation`.

## Frontend
* `ProfessionalChat.tsx` -> `react`, `react-markdown`, `lucide-react`.
* `SystemDashboard.tsx` -> `react`, `lucide-react`, API calls.
* `GeminiService.ts` -> `@google/genai`.
