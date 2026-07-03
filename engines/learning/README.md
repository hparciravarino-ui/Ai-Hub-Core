# Learning Module

## Public Interface
- `LearningEngine`: Orchestrator of document schema parsing and database ingestion without changing model files.

## Configuration
Requires `DatabaseLayer` configured inside the `DIContainer`.

## Implementation
Located in `/engines/learning/LearningEngine.ts`. Feeds files into sqlite document tables safely.

## Tests
Self-contained unit tests located in `/engines/learning/Learning.test.ts`.
