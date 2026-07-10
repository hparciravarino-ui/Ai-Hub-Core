# Model Selection Validation Report

## Selection Criteria Active
- Hardware Available (RAM constraints prevent large models).
- Required Context Window (matches user prompt size).
- Multimodal Needs (Vision triggers Gemini Flash/Pro).

## Fallback Execution
- Validated: If primary provider times out, system successfully fails over to configured secondary local or cloud endpoint.
