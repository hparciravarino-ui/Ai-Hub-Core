# Module Inventory

## 1. Core Services (`src/core/services`)
* **Responsibility**: Abstraction layer for business logic.
* **Dependencies**: External APIs, local vector DB.
* **State**: Active.
* **Entry Point**: Individual service classes (e.g., `GeminiService`).

## 2. Server API (`src/server/routes`)
* **Responsibility**: Backend endpoints.
* **Dependencies**: Express, local FS, core logic.
* **State**: Active.
* **Entry Point**: `src/server/routes/index.ts`.

## 3. UI Components (`src/components`)
* **Responsibility**: React Views and Interactive Widgets.
* **Dependencies**: React, Lucide-React, Tailwind.
* **State**: Active.
* **Entry Point**: `src/App.tsx`.

## 4. Hardware Engine (`src/shared/hardware`)
* **Responsibility**: Monitoring and parsing physical resources.
* **Dependencies**: Node `os`, `systeminformation`.
* **State**: Active.
* **Entry Point**: `src/shared/hardware/HardwareEngine.ts`.

## 5. RAG Engine (`src/core/knowledge`)
* **Responsibility**: Document extraction, chunking, and similarity search.
* **Dependencies**: VectorManager, EmbeddingEngine.
* **State**: Active.
* **Entry Point**: `src/core/knowledge/RAGService.ts`.
