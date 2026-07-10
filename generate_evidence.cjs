const fs = require('fs');
const path = require('path');

const dir = 'EnterpriseEvidenceBundle';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

function writeFile(name, content) {
    fs.writeFileSync(path.join(dir, name), content.trim() + '\n');
}

writeFile('01_FEATURE_MATRIX.md', `
# Feature Matrix

## Hardware Detection
* Descrizione: System and hardware resource monitoring.
* Modulo responsabile: HardwareEngine (Shared/Backend)
* Componenti coinvolti: SystemDashboard
* API coinvolte: GET /api/hardware/scan, GET /api/hardware/metrics
* Servizi coinvolti: HardwareService
* Dipendenze: systeminformation, os
* Stato: Implementata

## Professional Chat
* Descrizione: UI for LLM interactions.
* Modulo responsabile: Chat UI / Core Services
* Componenti coinvolti: ProfessionalChat
* API coinvolte: Internal React State -> Provider API or Backend Proxy
* Servizi coinvolti: GeminiService
* Dipendenze: @google/genai, react-markdown
* Stato: Implementata

## RAG & Knowledge
* Descrizione: Document embedding and retrieval.
* Modulo responsabile: RAG Engine
* Componenti coinvolti: RAGDashboard
* API coinvolte: POST /api/files/upload
* Servizi coinvolti: RAGService, VectorManager, EmbeddingEngine, LocalVectorDatabase
* Dipendenze: adm-zip, multer
* Stato: MOCK (LocalVectorDatabase is in-memory simulated)

## Quality Assurance & Security Scan
* Descrizione: Pipeline testing and vulnerabilities check.
* Modulo responsabile: QA Engine
* Componenti coinvolti: SecurityDashboard, AIEvolutionEngine
* API coinvolte: GET /api/qa/report, GET /api/qa/scan (simulated in UI)
* Servizi coinvolti: QualityAssuranceEngine, VaultService
* Dipendenze: Nessuna esterna diretta
* Stato: Demo / Mock (Hardcoded test cases, simulated timeouts)
`);

writeFile('02_ENTRY_POINTS.md', `
# Entry Points

## Frontend
* SPA Entry: \`src/main.tsx\`
* Root Component: \`src/App.tsx\`

## Backend Server
* Express Entry: \`server.ts\`
* Server Setup: \`src/server/setup.ts\`

## API Routers
* Main API Router: \`src/server/routes/index.ts\` (Mounted at \`/api\`)
* Installation: \`src/server/routes/installation.ts\`

## Worker / Scheduler
* Nessun worker o cron job dedicato documentato al di fuori del runtime Express o setInterval lato client.

## CLI / Desktop
* Desktop Bridges (\`DesktopRuntime.ts\`) sono placeholder, nessuna CLI reale esportata nel package.json.
`);

writeFile('03_RUNTIME_SERVICES.md', `
# Runtime Services

## Backend
* **BenchmarkDatabase**: In-memory data store for benchmark runs. Lifecycle: Singleton/Static per process.
* **Express Server**: Handles HTTP requests. Lifecycle: Started via \`server.ts\`, port 3000.

## Frontend
* **HardwareService**: Polling client for \`/api/hardware/metrics\`. Lifecycle: Component-driven.
* **GeminiService**: SDK wrapper. Lifecycle: Instantiated per request/component.
* **VaultService**: In-memory map for secrets. Lifecycle: Static class.
`);

writeFile('04_CONFIGURATION_MATRIX.md', `
# Configuration Matrix

## package.json
* App Type: module
* Scripts: \`dev\` (tsx server.ts), \`build\` (vite & esbuild), \`start\` (node dist/server.cjs), \`lint\`.

## tsconfig.json
* Typescript config per Vite e Node. Target ES2020. Strict mode.

## vite.config.ts
* Vite React plugin. TailwindCSS plugin.

## .env.example
* File di configurazione ambiente supportato da \`/api/setup/env\`.

## Docker
* Nessun file \`Dockerfile\` o \`docker-compose.yml\` nativo nel tree.
`);

writeFile('05_ENVIRONMENT_VARIABLES.md', `
# Environment Variables

* **GEMINI_API_KEY**
  * Obbligatoria: Sì (per GeminiService server-side embedding).
  * Default: Assente.
  * Modulo: \`src/core/services/GeminiService.ts\`

* **PORT**
  * Obbligatoria: No.
  * Default: 3000.
  * Modulo: \`server.ts\`

* **NODE_ENV**
  * Obbligatoria: No.
  * Default: \`development\` o \`production\`.
  * Modulo: \`server.ts\`
`);

writeFile('06_PROVIDER_MATRIX.md', `
# Provider Matrix

## Google Gemini
* Endpoint: SDK gestito.
* SDK: \`@google/genai\`
* Autenticazione: \`GEMINI_API_KEY\` (Env) o header \`x-gemini-key\`.
* Streaming: Supportato via API fetch/SDK.
* Embedding: \`gemini-embedding-2-preview\`
* Vision: Supportato dal modello.
* Status: Implementato.

## OpenRouter / OpenAI / Anthropic
* Endpoint: API dirette via \`fetch\` in \`apiClient.ts\`.
* SDK: Raw fetch REST.
* Autenticazione: HTTP Headers.
* Status: Implementazione Client-side / API Proxy.
`);

writeFile('07_MODEL_MATRIX.md', `
# Model Matrix

## gemini-3.5-flash
* Provider: Google
* Context Window: High
* Multimodalità: Sì
* Tool Calling: Sì
* Embedding: No
* Streaming: Sì

## gemini-embedding-2-preview
* Provider: Google
* Context Window: N/A
* Multimodalità: Text-only (embeddings)
* Tool Calling: No
* Embedding: Sì (1536 dim)
* Streaming: No
`);

writeFile('08_HARDWARE_CAPABILITIES.md', `
# Hardware Capabilities

## Scanner & Collector
* OS: Rilevato via \`os\` package.
* CPU: Rilevata via \`systeminformation\` (\`si.cpu()\`, \`si.currentLoad()\`).
* RAM: Rilevata via \`systeminformation\` (\`si.mem()\`).
* GPU: Rilevata via \`systeminformation\` (\`si.graphics()\`).
* Storage: Rilevato via \`systeminformation\` (\`si.fsSize()\`).

## Valori
* Reali: Metriche di carico, memoria e spazio su disco (Express backend).
* API: \`/api/hardware/scan\`, \`/api/hardware/metrics\`.
* Librerie: \`systeminformation\`.
`);

writeFile('09_MODEL_SELECTION_PIPELINE.md', `
# Model Selection Pipeline

## Flusso
Hardware Detection (\`HardwareEngine\`) -> API Endpoint (\`/api/hardware/scan\`) -> Component State (\`ModelManager\`) -> Execution (\`apiClient.ts\` / \`GeminiService\`).

## Fallback
Se \`GEMINI_API_KEY\` è assente, l'embedding genera vettori Mock pseudo-casuali (vedi \`generateMockEmbedding\` in \`GeminiService.ts\`).
`);

writeFile('10_INSTALLATION_PIPELINE.md', `
# Installation Pipeline

## Flusso
* Wizard UI (\`InstallationSetupCenter.tsx\`) -> Setup API (\`/api/setup/*\`).
* Prerequisiti: Controllati via \`/api/setup/diagnostics\` (Node >= 18, free space > 20GB).
* Configurazione: Scrittura payload in \`.env\` via \`/api/setup/env/create\`.
* Repair: Esecuzione \`npm install\` via \`child_process.execPromise\` (\`/api/setup/dependencies/repair\`).
`);

writeFile('11_FILE_STORAGE_PIPELINE.md', `
# File Storage Pipeline

## Workspace
* Path: \`workspace_uploads/\`
* Upload: Tramite \`multer\` in \`src/server/routes/files.ts\`.
* Estrazione: \`adm-zip\` per gli archivi.
* Indicizzazione: I file testuali vengono letti (\`fs.readFileSync\`) e il testo restituito alla UI.
* Limiti: JSON limitato a 50MB (Express middleware limit).
`);

writeFile('12_RAG_PIPELINE.md', `
# RAG Pipeline

## Flusso
1. **Document Parsing**: \`DocumentParser.ts\` (MOCK/Incomplete per tipi complessi, TXT/MD supportati tramite lettura file).
2. **Chunking**: \`ChunkingStrategy.ts\`.
3. **Embedding**: \`GeminiService.ts\` o \`generateMockEmbedding\`.
4. **Knowledge Retrieval**: \`VectorManager.ts\` inserisce/cerca.
5. **Storage**: \`LocalVectorDatabase.ts\` (In-memory Array, MOCK storage).
`);

writeFile('13_CHAT_PIPELINE.md', `
# Chat Pipeline

## Flusso
1. **Professional Chat**: UI Renders messaggi, accetta allegati.
2. **Context Injection**: Se c'è un file (es. \`test.txt\`), viene inviato al backend o letto dal client per essere accluso al prompt.
3. **Execution**: \`chatAPI()\` in \`apiClient.ts\` gestisce la chiamata.
4. **Streaming**: Implementato nel client leggendo \`response.body?.getReader()\`.
`);

writeFile('14_SECURITY_EVIDENCE.md', `
# Security Evidence

## Autenticazione e Autorizzazione
* Frontend: Nessun sistema di autenticazione utente (es. Firebase Auth / JWT) implementato. Accesso libero.
* API Proxy: Le API Keys (es. \`x-gemini-key\`) sono passate negli headers dal client per le richieste proxy, o lette dal server da \`.env\`.

## Hardening
* Headers: \`helmet\` attivato (CSP disattivata per Vite dev).
* Rate Limiting: \`express-rate-limit\` su \`/api\` (1000 res/15m). Presente bug IPv6 non fixato (da fixare se richiesto).
* CORS: \`*\` abilitato.

## Secrets
* \`VaultService.ts\`: Utilizza una \`Map<string, string>\` in memoria come MOCK di encryption. Nessun KMS reale.
`);

writeFile('15_DEPENDENCY_MATRIX.md', `
# Dependency Matrix

## Backend
* \`server.ts\` -> \`express\`, \`helmet\`, \`cors\`, \`express-rate-limit\`, \`vite\`.
* \`routes/files.ts\` -> \`multer\`, \`adm-zip\`.
* \`routes/installation.ts\` -> \`systeminformation\`.

## Frontend
* \`ProfessionalChat.tsx\` -> \`react\`, \`react-markdown\`, \`lucide-react\`.
* \`SystemDashboard.tsx\` -> \`react\`, \`lucide-react\`, API calls.
* \`GeminiService.ts\` -> \`@google/genai\`.
`);

writeFile('16_MODULE_COMMUNICATION.md', `
# Module Communication

* **Frontend -> Backend**: HTTP GET/POST fetch (es. \`/api/hardware/scan\`).
* **Frontend -> AI Provider**: HTTP Proxy (\`apiClient.ts\` -> OpenRouter/OpenAI) o Server Proxy (\`/api/...)\`.
* **Backend -> OS**: \`systeminformation\` library, \`fs\`, \`os\`, \`child_process\`.
`);

writeFile('17_IMPLEMENTATION_STATUS.md', `
# Implementation Status

* Hardware Engine: IMPLEMENTATO
* Express Backend API: IMPLEMENTATO
* Setup & Repair: PARZIALMENTE IMPLEMENTATO (Esegue script reali ma in sandbox)
* Chat UI: IMPLEMENTATO
* Vector Database: MOCK (In-memory arrays)
* Quality Assurance (Tests): MOCK (Dati hardcoded e timeout)
* Security Vault: MOCK (Nessuna crittografia reale)
* Desktop Bridge: PLACEHOLDER
`);

writeFile('18_REAL_IMPLEMENTATION_CHECK.md', `
# Real Implementation Check

* Hardware Detection: **Implementazione reale** (\`systeminformation\`).
* Model Selection: **Implementazione simulata** (Logica basata su array predefiniti).
* Benchmark: **Mock / Implementazione incompleta** (Timeout e logica finta in \`BenchmarkRunner\`).
* Installation: **Implementazione reale** (\`npm install\` eseguito).
* Knowledge/Vector DB: **Mock** (Nessun DB reale).
* Professional Chat: **Implementazione reale**.
* Storage: **Implementazione reale** (file su \`workspace_uploads/\`).
* QA Security Scan: **Mock**.
`);

writeFile('19_TECHNICAL_LIMITATIONS.md', `
# Technical Limitations

* LocalVectorDatabase non persiste su disco i vettori. I dati vanno persi al riavvio del server Express.
* Nessun sistema multi-tenant, single user app.
* Express Rate Limiter non configura correttamente IPV6 \`keyGenerator\`.
* \`VaultService\` salva le chiavi in chiaro nella RAM (JS Map). Nessun Key Management System.
* QA Scanner simula vulnerabilità cablate (\`QualityAssuranceEngine.ts\`).
`);

writeFile('20_TRACEABILITY_MATRIX.md', `
# Traceability Matrix

## Hardware Metrics
* Requisito: Lettura carico di sistema.
* Modulo: \`src/shared/hardware\`
* Classe: \`HardwareEngine\`
* Metodo: \`scan()\`, \`metrics()\`
* API: \`/api/hardware/metrics\`
* Test: Nessuno.

## Chat
* Requisito: Inviare messaggi LLM
* Modulo: \`ProfessionalChat.tsx\`
* API: Proxy tramite \`apiClient.ts\` o \`GeminiService.ts\`.
* Test: Nessuno.
`);
