# Provider Matrix

## Google Gemini
* Endpoint: SDK gestito.
* SDK: `@google/genai`
* Autenticazione: `GEMINI_API_KEY` (Env) o header `x-gemini-key`.
* Streaming: Supportato via API fetch/SDK.
* Embedding: `gemini-embedding-2-preview`
* Vision: Supportato dal modello.
* Status: Implementato.

## OpenRouter / OpenAI / Anthropic
* Endpoint: API dirette via `fetch` in `apiClient.ts`.
* SDK: Raw fetch REST.
* Autenticazione: HTTP Headers.
* Status: Implementazione Client-side / API Proxy.
