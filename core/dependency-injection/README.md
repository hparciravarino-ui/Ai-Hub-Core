# Dependency Injection Module

## Public Interface
- `IDIContainer`: Interface for container registration and resolution.
- `DIContainer`: Singleton implementation of the IoC container.

## Configuration
No configuration required. Automatically handles singleton registrations.

## Implementation
Located in `/core/dependency-injection/Container.ts`. Utilizes a fast memory map of service keys to instances.

## Tests
Self-contained unit test suite located in `/core/dependency-injection/Container.test.ts`.
