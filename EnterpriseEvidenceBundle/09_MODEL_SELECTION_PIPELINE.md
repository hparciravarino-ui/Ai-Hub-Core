# Model Selection Pipeline

## Flusso
Hardware Detection (`HardwareEngine`) -> API Endpoint (`/api/hardware/scan`) -> Component State (`ModelManager`) -> Execution (`apiClient.ts` / `GeminiService`).

## Fallback
Se `GEMINI_API_KEY` è assente, l'embedding genera vettori Mock pseudo-casuali (vedi `generateMockEmbedding` in `GeminiService.ts`).
