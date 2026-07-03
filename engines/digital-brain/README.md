# Digital Brain Module

## Public Interface
- `SystemPreference`: Configuration map for runtime personalization.
- `DecisionLog`: Model of registered contextual system actions.
- `DigitalBrain`: Subsystem managing system-wide context memory, user choices, and decision logs.

## Configuration
Stores and overrides global application settings in memory.

## Implementation
Located in `/engines/digital-brain/DigitalBrain.ts`. Serves as the cognitive registry connecting other modules.

## Tests
Self-contained unit tests located in `/engines/digital-brain/DigitalBrain.test.ts`.
