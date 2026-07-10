# Chat Pipeline

## Flusso
1. **Professional Chat**: UI Renders messaggi, accetta allegati.
2. **Context Injection**: Se c'è un file (es. `test.txt`), viene inviato al backend o letto dal client per essere accluso al prompt.
3. **Execution**: `chatAPI()` in `apiClient.ts` gestisce la chiamata.
4. **Streaming**: Implementato nel client leggendo `response.body?.getReader()`.
