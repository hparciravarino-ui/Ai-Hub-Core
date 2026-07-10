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
