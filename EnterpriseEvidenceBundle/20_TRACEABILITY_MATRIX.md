# Traceability Matrix

## Hardware Metrics
* Requisito: Lettura carico di sistema.
* Modulo: `src/shared/hardware`
* Classe: `HardwareEngine`
* Metodo: `scan()`, `metrics()`
* API: `/api/hardware/metrics`
* Test: Nessuno.

## Chat
* Requisito: Inviare messaggi LLM
* Modulo: `ProfessionalChat.tsx`
* API: Proxy tramite `apiClient.ts` o `GeminiService.ts`.
* Test: Nessuno.
