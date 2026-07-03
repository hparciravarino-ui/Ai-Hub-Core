# AI Orchestrator Module

## Public Interface
- `OrchestrationTask`: Interface outlining task options (id, priority, payload, timeouts).
- `AIOrchestrator`: Operating core coordinating requests, scheduling models/runtimes, checking timeouts, and managing active task queues.

## Configuration
No manual configuration. Directly integrates with core `Scheduler`.

## Implementation
Located in `/engines/ai-orchestrator/AIOrchestrator.ts`. Routes execution cleanly.

## Tests
Self-contained unit test suite located in `/engines/ai-orchestrator/AIOrchestrator.test.ts`.
