# Hardware Module

## Public Interface
- `HardwareTelemetry`: Interface structure of standard computer performance metrics.
- `HardwareEngine`: Singleton system daemon that scans, profiles, and logs machine performance.

## Configuration
Provides `startContinuousMonitoring(intervalMs)` to setup the continuous scanning clock.

## Implementation
Located in `/engines/hardware/HardwareEngine.ts`. Built directly over Node `os` API to avoid slow blocking shell execution.

## Tests
Self-contained unit tests located in `/engines/hardware/Hardware.test.ts`.
