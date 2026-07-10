# Project Tree

```
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
```

## File Details
* **src/App.tsx**: Frontend main container. Responsibilities: Layout state, routing.
* **server.ts**: Backend Express server. Responsibilities: API proxy, hardware metrics.
* **src/core/services/GeminiService.ts**: AI connection. Responsibilities: Generating embeddings, text completions.
* **src/server/routes/*.ts**: API Controllers. Responsibilities: Endpoint processing.
* **src/components/ProfessionalChat.tsx**: Chat UI. Responsibilities: Handling user messages, streams, attachments.
* **src/core/knowledge/RAGService.ts**: Retrieval-Augmented Generation logic. Responsibilities: Chunking, search, extraction.
* **src/shared/hardware/HardwareEngine.ts**: Hardware abstraction. Responsibilities: CPU/GPU/RAM parsing and validation.
