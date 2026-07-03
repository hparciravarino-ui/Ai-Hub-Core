# Optimization & Performance Module

## Public Interface
- `OptimizationProfile`: Profile type representing performance tuning presets.
- `PerformanceEngine`: Singleton engine managing dynamic memory caps and thread priorities.

## Configuration
Monitors `hardware_telemetry_updated` system events and auto-tunes itself dynamically.

## Implementation
Located in `/engines/optimization/PerformanceEngine.ts`. Targets low-end (8GB RAM) client environments by applying cache limits and compression modes.

## Tests
Self-contained unit tests located in `/engines/optimization/Performance.test.ts`.
