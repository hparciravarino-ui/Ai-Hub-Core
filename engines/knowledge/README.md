# Knowledge Module

## Public Interface
- `KnowledgeEngine`: Coordinator managing semantic lookup and document integration.

## Configuration
Interfaces with the `/database/sqlite/DatabaseLayer` resolved dynamically from the `DIContainer`.

## Implementation
Located in `/engines/knowledge/KnowledgeEngine.ts`. Performs text-filtering indexing on SQLite schemas.

## Tests
Self-contained unit tests located in `/engines/knowledge/Knowledge.test.ts`.
