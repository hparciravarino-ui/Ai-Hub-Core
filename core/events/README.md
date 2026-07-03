# Event Bus Module

## Public Interface
- `IEventManager`: Interface defining methods for subscribing, publishing, and unsubscribing.
- `EventManager`: Singleton event bus coordinator.

## Configuration
No configurations required. Self-contained registry of subscribers.

## Implementation
Located in `/core/events/EventManager.ts`. Implemented using JavaScript Set collections for fast lookup.

## Tests
Self-contained unit tests located in `/core/events/EventManager.test.ts`.
