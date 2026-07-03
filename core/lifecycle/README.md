# Lifecycle & Error Handling Module

## Public Interface
- `IErrorHandler`: Interface for centralized error handling and classification.
- `AppError`: Class for custom application exceptions containing severity profiles.
- `ErrorHandler`: Singleton engine mapping error types to appropriate logger modes.

## Configuration
No configuration required. Plugs directly into Express API middleware and core threads.

## Implementation
Located in `/core/lifecycle/ErrorHandler.ts`. Handles logging and severity filtering.

## Tests
Self-contained unit test suite located in `/core/lifecycle/ErrorHandler.test.ts`.
