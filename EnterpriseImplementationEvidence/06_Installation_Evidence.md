# 06_Installation_Evidence

## Modulo: Installation Engine

* **File coinvolti**: 
  - `/src/server/routes/installation.ts`
  - `/src/components/InstallationSetupCenter.tsx`
* **API coinvolte**: 
  - `GET /api/setup/env`
  - `POST /api/setup/env/create`
  - `POST /api/setup/dependencies/repair`
  - `GET /api/setup/diagnostics`

### Flusso di Esecuzione
1. Al primo avvio o su richiesta utente, la UI interroga `/api/setup/diagnostics`.
2. Il server valida i requisiti dell'host (versione Node.js >= 18, spazio libero su disco > 20GB, permessi di lettura/scrittura nella cartella di lavoro).
3. L'utente compila le variabili d'ambiente nella UI.
4. L'API `/api/setup/env/create` genera e scrive fisicamente il file `.env` nel server.
5. In caso di errore o dipendenze mancanti, l'utente può attivare `/api/setup/dependencies/repair`, che esegue un processo reale di `npm install` sull'host ospite.

### Stato Reale dell'Implementazione
* **Stato**: **IMPLEMENTATO**
* **Evidenza**: Il sistema esegue operazioni reali di IO sul disco per salvare le configurazioni di ambiente ed effettua un'interrogazione reale dei prerequisiti ambientali. La funzione di riparazione invoca direttamente il gestore pacchetti Node (`npm install`) tramite `execPromise("npm install")` sul server.
