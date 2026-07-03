# Runtime Module

## Public Interface
- `IRuntime`: Plug-and-play local model execution interface.
- `RuntimeManager`: Subsystem managing local adapters (MLX, ONNX, LLaMA, Gemini Proxy).

## Configuration
Runtimes are loaded dynamically. Gemini Proxy relies on `GEMINI_API_KEY`.

## Implementation
Located in `/engines/runtime/`. Modules are isolated, meaning a runtime can be added or removed without breaking anything.

## Tests
Self-contained unit tests located in `/engines/runtime/Runtime.test.ts`.
