const fs = require('fs');
const path = require('path');

function writeFile(name, content) {
    fs.writeFileSync(path.join('AuditExport', name), content.trim() + '\n');
}

writeFile('01_PROJECT_TREE.md', `
# Project Tree

\`\`\`
src/
├── apiClient.ts
├── App.tsx
├── components/
│   ├── AIAssistant.tsx
│   ├── AIEvolutionEngine.tsx
│   ├── CognitiveMap.tsx
│   ├── Dashboard.tsx
│   ├── FileManager.tsx
│   ├── InstallationSetupCenter.tsx
│   ├── IntelligenceEngine.tsx
│   ├── MediaLab.tsx
│   ├── ModelManager.tsx
│   ├── PluginCenter.tsx
│   ├── ProfessionalChat.tsx
│   ├── ProjectAnalyzer.tsx
│   ├── ProviderManager.tsx
│   ├── Scheduler.tsx
│   ├── SecurityCenter.tsx
│   ├── UserGuide.tsx
│   ├── agents/
│   │   └── AgentDashboard.tsx
│   ├── benchmark/
│   │   └── EnterpriseBenchmarkDashboard.tsx
│   ├── knowledge/
│   │   └── RAGDashboard.tsx
│   ├── layout/
│   │   ├── AppContent.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── models/
│   │   └── EnterpriseModelDashboard.tsx
│   ├── monitoring/
│   │   └── SystemDashboard.tsx
│   ├── plugins/
│   │   └── PluginDashboard.tsx
│   ├── security/
│   │   └── SecurityDashboard.tsx
│   ├── ui/
│   │   ├── ButtonGroup.tsx
│   │   ├── Card.tsx
│   │   └── SectionHeader.tsx
│   └── workflows/
│       └── WorkflowDashboard.tsx
├── core/
│   ├── agents/
│   ├── benchmark/
│   ├── desktop/
│   ├── di/
│   ├── events/
│   ├── knowledge/
│   ├── memory/
│   ├── models/
│   ├── monitoring/
│   ├── packaging/
│   ├── plugins/
│   ├── qa/
│   ├── security/
│   ├── services/
│   ├── vector/
│   └── workflows/
├── data.ts
├── hooks/
│   └── useAppState.ts
├── index.css
├── main.tsx
├── server/
│   ├── benchmark/
│   ├── models/
│   ├── routes/
│   └── setup.ts
├── shared/
│   └── hardware/
├── tests/
├── types.ts
└── utils.ts
server.ts
\`\`\`

## File Details
* **src/App.tsx**: Frontend main container. Responsibilities: Layout state, routing.
* **server.ts**: Backend Express server. Responsibilities: API proxy, hardware metrics.
* **src/core/services/GeminiService.ts**: AI connection. Responsibilities: Generating embeddings, text completions.
* **src/server/routes/*.ts**: API Controllers. Responsibilities: Endpoint processing.
* **src/components/ProfessionalChat.tsx**: Chat UI. Responsibilities: Handling user messages, streams, attachments.
* **src/core/knowledge/RAGService.ts**: Retrieval-Augmented Generation logic. Responsibilities: Chunking, search, extraction.
* **src/shared/hardware/HardwareEngine.ts**: Hardware abstraction. Responsibilities: CPU/GPU/RAM parsing and validation.
`);

writeFile('02_MODULE_INVENTORY.md', `
# Module Inventory

## 1. Core Services (\`src/core/services\`)
* **Responsibility**: Abstraction layer for business logic.
* **Dependencies**: External APIs, local vector DB.
* **State**: Active.
* **Entry Point**: Individual service classes (e.g., \`GeminiService\`).

## 2. Server API (\`src/server/routes\`)
* **Responsibility**: Backend endpoints.
* **Dependencies**: Express, local FS, core logic.
* **State**: Active.
* **Entry Point**: \`src/server/routes/index.ts\`.

## 3. UI Components (\`src/components\`)
* **Responsibility**: React Views and Interactive Widgets.
* **Dependencies**: React, Lucide-React, Tailwind.
* **State**: Active.
* **Entry Point**: \`src/App.tsx\`.

## 4. Hardware Engine (\`src/shared/hardware\`)
* **Responsibility**: Monitoring and parsing physical resources.
* **Dependencies**: Node \`os\`, \`systeminformation\`.
* **State**: Active.
* **Entry Point**: \`src/shared/hardware/HardwareEngine.ts\`.

## 5. RAG Engine (\`src/core/knowledge\`)
* **Responsibility**: Document extraction, chunking, and similarity search.
* **Dependencies**: VectorManager, EmbeddingEngine.
* **State**: Active.
* **Entry Point**: \`src/core/knowledge/RAGService.ts\`.
`);

writeFile('03_API_CATALOG.md', `
# API Catalog

## Health
* \`GET /api/health\`: Application health check. Output: Status. Controller: \`healthRouter\`.

## Hardware
* \`GET /api/hardware/scan\`: Returns CPU, RAM, GPU specs. Controller: \`hardwareRouter\`.
* \`GET /api/hardware/metrics\`: Real-time system load. Controller: \`hardwareRouter\`.

## Models
* \`GET /api/models/recommendations\`: Returns suggested models based on hardware. Controller: \`modelsRouter\`.
* \`GET /api/models/compatibility\`: Evaluates model fit against system. Controller: \`modelsRouter\`.

## Benchmark
* \`POST /api/benchmark/run\`: Initiates stress test. Output: Score and analysis. Controller: \`benchmarkRouter\`.

## Files
* \`POST /api/files/upload\`: Multi-part form upload. Handles ZIP auto-extraction. Controller: \`filesRouter\`. Middleware: \`multer\`.
* \`GET /api/files/list\`: Returns local workspace file directory contents. Controller: \`filesRouter\`.

## Installation
* \`GET /api/setup/env\`: Reads \`.env\` or \`.env.example\`. Controller: \`installationRouter\`.
* \`POST /api/setup/env/create\`: Writes to \`.env\`. Controller: \`installationRouter\`.
* \`GET /api/setup/diagnostics\`: Runs system pre-flight checks (Node ver, Write Permissions, Disk Space). Controller: \`installationRouter\`.
* \`POST /api/setup/dependencies/repair\`: Triggers \`npm install\`. Controller: \`installationRouter\`.

## Security
* \`GET /api/enterprise/security/status\`: Security module heartbeat. Controller: \`securityRouter\`.
`);

writeFile('04_CLASS_INDEX.md', `
# Class Index

* \`HardwareEngine\` (\`src/shared/hardware/HardwareEngine.ts\`) - Public methods: \`scan()\`, \`validate()\`.
* \`VectorManager\` (\`src/core/vector/VectorManager.ts\`) - Public methods: \`insert()\`, \`search()\`.
* \`RAGService\` (\`src/core/knowledge/RAGService.ts\`) - Public methods: \`ingestDocument()\`, \`query()\`.
* \`GeminiService\` (\`src/core/services/GeminiService.ts\`) - Implements: \`IAIService\`. Public methods: \`generateText()\`, \`generateEmbedding()\`.
* \`VaultService\` (\`src/core/security/VaultService.ts\`) - Public methods: \`storeSecret()\`, \`getSecret()\`.
* \`QualityAssuranceEngine\` (\`src/core/qa/QualityAssuranceEngine.ts\`) - Public methods: \`runQAExecution()\`, \`triggerVulnerabilityScan()\`.
`);

writeFile('05_COMPONENT_INDEX.md', `
# Component Index

* \`App\` (\`src/App.tsx\`) - Main router container. State: Active tab, Sidebar status.
* \`ProfessionalChat\` (\`src/components/ProfessionalChat.tsx\`) - State: messages, attachments, chat input. Hooks: \`useState\`, \`useRef\`. Context: Global App State.
* \`InstallationSetupCenter\` (\`src/components/InstallationSetupCenter.tsx\`) - State: diagnostic results, wizard step.
* \`SystemDashboard\` (\`src/components/monitoring/SystemDashboard.tsx\`) - State: metrics chart data, hardware info.
* \`EnterpriseBenchmarkDashboard\` (\`src/components/benchmark/EnterpriseBenchmarkDashboard.tsx\`) - State: benchmark progress, scores.
* \`SecurityDashboard\` (\`src/components/security/SecurityDashboard.tsx\`) - State: vulnerability logs, vault access.
* \`AppContent\` (\`src/components/layout/AppContent.tsx\`) - Switcher for view rendering. Props: activeTab.
* \`Sidebar\` (\`src/components/layout/Sidebar.tsx\`) - Navigation rail. Props: activeTab, setActiveTab.
`);

writeFile('06_SERVICE_INDEX.md', `
# Service Index

## Backend
* \`BenchmarkDatabase\`
* \`ModelSearch\`
* \`ScoringEngine\`
* \`SetupService\`

## Frontend / Core
* \`GeminiService\`
* \`HardwareService\`
* \`MemoryService\`
* \`VaultService\`
* \`PluginManager\`

## Shared
* \`HardwareEngine\`
`);

writeFile('07_DEPENDENCY_GRAPH.md', `
# Dependency Graph

## Frontend
\`main.tsx\` -> \`App.tsx\`
\`App.tsx\` -> \`AppContent.tsx\`, \`Sidebar.tsx\`, \`Header.tsx\`
\`AppContent.tsx\` -> \`ProfessionalChat.tsx\`, \`SystemDashboard.tsx\`, \`SecurityDashboard.tsx\`, \`RAGDashboard.tsx\`, \`AgentDashboard.tsx\`
\`ProfessionalChat.tsx\` -> \`apiClient.ts\`
\`SystemDashboard.tsx\` -> \`GET /api/hardware/metrics\`

## Backend
\`server.ts\` -> \`src/server/setup.ts\`, \`src/server/routes/index.ts\`
\`src/server/routes/index.ts\` -> \`src/server/routes/*.ts\`
\`src/server/routes/files.ts\` -> \`multer\`, \`adm-zip\`, \`fs\`, \`path\`
\`src/server/routes/installation.ts\` -> \`systeminformation\`, \`child_process\`, \`fs\`, \`os\`
`);

writeFile('08_ARCHITECTURE_MAP.md', `
# Architecture Map

## Presentation Layer
React SPA (\`src/components\`, \`src/App.tsx\`)
Tailwind CSS (\`src/index.css\`)
Lucide React Icons

## Application Layer
Express Routers (\`src/server/routes\`)
Core Services (\`src/core/services\`)

## Domain Layer
Engine Logic (\`src/shared/hardware\`, \`src/core/models\`, \`src/core/knowledge\`, \`src/core/benchmark\`, \`src/core/security\`)
Type Definitions (\`src/types.ts\`)

## Infrastructure Layer
Vite Dev Server
Node.js File System (\`fs\`)
Local Vector DB Simulation (\`src/core/vector/LocalVectorDatabase.ts\`)
`);

writeFile('09_DATABASE_AND_STORAGE.md', `
# Database and Storage

## Workspace Storage
* **Type**: Local File System
* **Path**: \`workspace_uploads/\`
* **Contents**: Uploaded documents, ZIP extractions. Used by \`filesRouter\`.

## Knowledge Base (Vector)
* **Type**: In-Memory / Local Simulation
* **Engine**: \`LocalVectorDatabase\`
* **Format**: 1536-dimensional float arrays with metadata payload. Persistence simulated in-memory.

## Caching
* **Type**: In-Memory LRU (React state & simple maps in Node).
* **Usage**: Hardware metrics caching, Model recommendations caching.

## Persistence
* **App State**: React hooks local state.
* **Env Settings**: \`.env\` file accessed via \`fs\`.
`);

writeFile('10_AI_ENGINE.md', `
# AI Engine

## Providers
* Google Gemini (\`@google/genai\` SDK via \`GeminiService\`)
* OpenRouter API (Fallback mechanism)
* OpenAI Native (via raw fetch in \`apiClient.ts\`)
* Anthropic API (via raw fetch in \`apiClient.ts\`)

## Model Manager
* Supports Model definitions, context lengths, system prompts.
* Handles Local Models (Ollama proxy capabilities mapping).
* Location: \`src/core/models/EnterpriseModelManager.ts\`

## Routing
* Primary: Gemini.
* Fallback: OpenRouter if Gemini key fails or custom model requested.
* Specific: Direct OpenAI/Anthropic/Groq paths when keys present.
* Location: \`apiClient.ts\`
`);

writeFile('11_HARDWARE_ENGINE.md', `
# Hardware Engine

## Hardware Scanner
* Component: \`Scanner\` (\`src/shared/hardware/Scanner.ts\`)
* Collects: CPU (cores, threads, frequency), RAM, GPU specs, Storage availability.

## Collector
* Uses \`systeminformation\` npm package for deep hardware hooks.
* Uses Node \`os\` core module.

## Metrics Engine
* Real-time metrics gathering (Load, Temperatures, Memory utilization).
* Normalizer limits outputs to safe ranges.

## Platform Support
* Operating Systems: Windows, macOS, Linux.
* API Used: \`/api/hardware/scan\`, \`/api/hardware/metrics\`.
`);

writeFile('12_INSTALLATION_ENGINE.md', `
# Installation Engine

## Installation Wizard
* Endpoint: \`/api/setup/*\` (handled by \`installationRouter.ts\`).
* Features: UI-driven configuration, environment variable generation.

## Health Check
* Node Version verification (>= 18 required).
* Disk Space check (> 20 GB free expected).
* Write Permission test on CWD to ensure sandbox integrity.
* Port Collision detection (Port 3000, 11434).

## Configuration & Repair
* Safely reads/writes \`.env\`.
* Capable of running \`npm install\` programmatically via \`child_process.execPromise\` for dependency repair.
`);

writeFile('13_RAG_ENGINE.md', `
# RAG Engine

## Document Parsing
* Handlers for JSON, TXT, MD, CSV. Extensible to PDF via external processing.
* Component: \`DocumentParser.ts\`

## Chunking
* Overlapping text window chunker (Token estimation based).
* Component: \`ChunkingStrategy.ts\`

## Embedding
* Provider: Gemini (\`gemini-embedding-2-preview\`).
* Dimension: 1536.
* Fallback: Deterministic mock hashing algorithm if API key missing (\`GeminiService.ts\`).

## Vector Search
* Algorithm: Cosine similarity matching.
* DB: \`LocalVectorDatabase.ts\`
`);

writeFile('14_CHAT_ENGINE.md', `
# Chat Engine

## Professional Chat
* UI Component: \`ProfessionalChat.tsx\`
* Rendering: Markdown rendering via \`react-markdown\`, syntax highlighting.
* File attachment tracking and display.

## Conversation Engine
* Context maintained in React State (\`messages\` array).
* Passed to \`chatAPI()\` mapping history to specific provider formats (Gemini parts, OpenAI messages).
* System instruction injection support.

## Context Injection
* File attachments are uploaded via \`/api/files/upload\`.
* Extracted OCR/text is appended to prompts before sending to LLM.
`);

writeFile('15_SECURITY.md', `
# Security

## Authentication & Authorization
* Keys passed via headers (\`x-gemini-key\`, \`x-openrouter-key\`, \`x-openai-key\`).
* Environment Variables (\`GEMINI_API_KEY\`) for server-side trusted operations.

## Vault Service
* \`VaultService.ts\` handles secret key/value mocking and auditing.

## Rate Limiting & Protection
* \`express-rate-limit\`: 1000 requests / 15 min window on \`/api\`.
* \`helmet\`: Security headers (CSP disabled for Vite dev compatibility).
* \`cors\`: Cross-origin resource sharing enabled.
* Payload size limited to 50mb via \`express.json\`.

## OWASP & Injections
* Input sanitation in basic routes.
* Vulnerability scanning mocked in \`QualityAssuranceEngine.ts\`.
`);

writeFile('16_CONFIGURATION.md', `
# Configuration

## package.json
* Dependencies: \`react\`, \`vite\`, \`express\`, \`tailwindcss\`, \`@google/genai\`, \`lucide-react\`, \`adm-zip\`, \`systeminformation\`, \`multer\`.
* Scripts: \`dev\` (tsx server.ts), \`build\` (vite build & esbuild), \`start\` (node dist/server.cjs), \`lint\` (tsc --noEmit).

## tsconfig
* Strict mode enabled. Node and DOM types included.

## Vite
* React Plugin. Tailwind PostCSS integration. SPA mode.

## Docker
* Unspecified natively in tree, relies on host execution or standard Node.js container environments (e.g. Cloud Run).
`);

writeFile('17_EXTERNAL_DEPENDENCIES.md', `
# External Dependencies

* \`express\` (Backend HTTP server)
* \`vite\` (Dev server & builder)
* \`react\`, \`react-dom\` (UI Library)
* \`tailwindcss\` (Styling framework)
* \`@google/genai\` (Gemini API integration SDK)
* \`lucide-react\` (SVG Icons library)
* \`systeminformation\` (OS and hardware telemetry)
* \`multer\` (Multi-part form parser for file uploads)
* \`adm-zip\` (Archive extraction for uploaded ZIP files)
* \`react-markdown\` (Markdown rendering for Chat UI)
* \`helmet\` (HTTP header security)
* \`cors\` (Cross-origin configuration)
* \`express-rate-limit\` (Request rate limiting)
* \`dotenv\` (Environment variable loader)
`);

writeFile('18_UNUSED_CODE.md', `
# Unused Code

## Analysis
* Contains mock code and placeholder logic for plugins (\`src/core/plugins/PluginManager.ts\`).
* \`DesktopRuntime.ts\` and \`EnterpriseDesktopBridge.ts\` act as stubs for potential Electron/Tauri ports but are not fully wired to native binaries.
* \`QualityAssuranceEngine.ts\` contains hardcoded test suites and simulated execution timeouts rather than executing real test files.
* \`VaultService.ts\` stores secrets in an unencrypted JS Map, simulating encryption.
* LocalVectorDatabase relies on an in-memory array rather than a persistent disk store.
`);

writeFile('19_RUNTIME_FLOW.md', `
# Runtime Flow

1. **Boot**: \`server.ts\` runs via \`tsx\` (dev) or \`node\` (prod).
2. **Setup**: Express mounts middlewares, API routes (\`/api/*\`), and Vite SPA fallback.
3. **Frontend Init**: \`main.tsx\` injects React \`App\` into DOM.
4. **Hardware Validation**: SystemDashboard requests \`/api/hardware/scan\` to populate metrics.
5. **Model Setup**: User configures keys in UI (Security/Providers), keys are sent via HTTP Headers on subsequent requests.
6. **Interaction**: User types in \`ProfessionalChat\`, \`apiClient.ts\` dispatches fetch to provider directly or to backend.
7. **RAG / Files**: User uploads file -> \`/api/files/upload\` -> Processed to \`workspace_uploads/\` -> Vector Embeddings generated -> Injected to chat context.
`);

writeFile('20_COMPLETE_TECHNICAL_INDEX.md', `
# Complete Technical Index

1. 01_PROJECT_TREE.md - Complete project file tree and responsibilities.
2. 02_MODULE_INVENTORY.md - Inventory of high-level modules and dependencies.
3. 03_API_CATALOG.md - Express backend API routes and endpoints.
4. 04_CLASS_INDEX.md - Core domain logic classes.
5. 05_COMPONENT_INDEX.md - React UI Component list.
6. 06_SERVICE_INDEX.md - Abstraction layer services.
7. 07_DEPENDENCY_GRAPH.md - Relationship mapping between layers.
8. 08_ARCHITECTURE_MAP.md - Application architectural strata.
9. 09_DATABASE_AND_STORAGE.md - File system and simulated database topology.
10. 10_AI_ENGINE.md - LLM Provider and routing configuration.
11. 11_HARDWARE_ENGINE.md - Telemetry and resource monitoring capabilities.
12. 12_INSTALLATION_ENGINE.md - Setup, diagnostic, and repair logic.
13. 13_RAG_ENGINE.md - Chunking, embedding, and retrieval systems.
14. 14_CHAT_ENGINE.md - Conversational UI and context management.
15. 15_SECURITY.md - Authentication, rate limiting, and vault mechanisms.
16. 16_CONFIGURATION.md - Build tools and runtime config files.
17. 17_EXTERNAL_DEPENDENCIES.md - Third-party NPM packages used.
18. 18_UNUSED_CODE.md - Stubs, placeholders, and unexecuted modules.
19. 19_RUNTIME_FLOW.md - Execution lifecycle from boot to interaction.
20. 20_COMPLETE_TECHNICAL_INDEX.md - This index file.
`);
