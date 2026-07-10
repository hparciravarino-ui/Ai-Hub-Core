# Security

## Authentication & Authorization
* Keys passed via headers (`x-gemini-key`, `x-openrouter-key`, `x-openai-key`).
* Environment Variables (`GEMINI_API_KEY`) for server-side trusted operations.

## Vault Service
* `VaultService.ts` handles secret key/value mocking and auditing.

## Rate Limiting & Protection
* `express-rate-limit`: 1000 requests / 15 min window on `/api`.
* `helmet`: Security headers (CSP disabled for Vite dev compatibility).
* `cors`: Cross-origin resource sharing enabled.
* Payload size limited to 50mb via `express.json`.

## OWASP & Injections
* Input sanitation in basic routes.
* Vulnerability scanning mocked in `QualityAssuranceEngine.ts`.
