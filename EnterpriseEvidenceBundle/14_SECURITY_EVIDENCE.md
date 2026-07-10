# Security Evidence

## Autenticazione e Autorizzazione
* Frontend: Nessun sistema di autenticazione utente (es. Firebase Auth / JWT) implementato. Accesso libero.
* API Proxy: Le API Keys (es. `x-gemini-key`) sono passate negli headers dal client per le richieste proxy, o lette dal server da `.env`.

## Hardening
* Headers: `helmet` attivato (CSP disattivata per Vite dev).
* Rate Limiting: `express-rate-limit` su `/api` (1000 res/15m). Presente bug IPv6 non fixato (da fixare se richiesto).
* CORS: `*` abilitato.

## Secrets
* `VaultService.ts`: Utilizza una `Map<string, string>` in memoria come MOCK di encryption. Nessun KMS reale.
