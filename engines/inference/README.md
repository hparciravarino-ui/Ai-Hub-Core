# Inference Module

## Public Interface
- `IInferenceEngine`: Interface for token synthesis execution.
- `InferenceEngine`: Concrete orchestrator routing tasks to active, compatible runtime wrappers.

## Configuration
Leverages registered runtimes from `RuntimeManager`.

## Implementation
Located in `/engines/inference/InferenceEngine.ts`. Clean separation of model routing from network/socket layer.

## Tests
Self-contained unit tests located in `/engines/inference/Inference.test.ts`.
