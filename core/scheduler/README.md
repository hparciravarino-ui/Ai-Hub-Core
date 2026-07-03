# Scheduler Module

## Public Interface
- `IScheduler`: Interface for submitting jobs and tracking background execution.
- `Job`: Definition of background task parameters (progress, queue types, payloads).
- `Scheduler`: Singleton engine executing queued asynchronous workloads.

## Configuration
Manages memory queue loops. Uses Node `setTimeout` microtask yielding to optimize event-loop times.

## Implementation
Located in `/core/scheduler/Scheduler.ts`. Orchestrates multiple specialized queues (inference, updates, downloads, indices).

## Tests
Self-contained unit test suite located in `/core/scheduler/Scheduler.test.ts`.
