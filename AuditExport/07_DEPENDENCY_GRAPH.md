# Dependency Graph

## Frontend
`main.tsx` -> `App.tsx`
`App.tsx` -> `AppContent.tsx`, `Sidebar.tsx`, `Header.tsx`
`AppContent.tsx` -> `ProfessionalChat.tsx`, `SystemDashboard.tsx`, `SecurityDashboard.tsx`, `RAGDashboard.tsx`, `AgentDashboard.tsx`
`ProfessionalChat.tsx` -> `apiClient.ts`
`SystemDashboard.tsx` -> `GET /api/hardware/metrics`

## Backend
`server.ts` -> `src/server/setup.ts`, `src/server/routes/index.ts`
`src/server/routes/index.ts` -> `src/server/routes/*.ts`
`src/server/routes/files.ts` -> `multer`, `adm-zip`, `fs`, `path`
`src/server/routes/installation.ts` -> `systeminformation`, `child_process`, `fs`, `os`
