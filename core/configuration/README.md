# Configuration Module

## Public Interface
- `IConfigManager`: Interface for retrieving system configuration variables.
- `ConfigManager`: Singleton class implementing safe property retrieval.

## Configuration
Initialized via system environment variables (`NODE_ENV`, `PORT`, `LOG_LEVEL`, `GEMINI_API_KEY`).

## Implementation
Located in `/core/configuration/ConfigManager.ts`. Parses runtime variables gracefully.

## Tests
Self-contained unit test suite located in `/core/configuration/ConfigManager.test.ts`.
