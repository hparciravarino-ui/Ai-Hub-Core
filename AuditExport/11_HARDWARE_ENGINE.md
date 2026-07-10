# Hardware Engine

## Hardware Scanner
* Component: `Scanner` (`src/shared/hardware/Scanner.ts`)
* Collects: CPU (cores, threads, frequency), RAM, GPU specs, Storage availability.

## Collector
* Uses `systeminformation` npm package for deep hardware hooks.
* Uses Node `os` core module.

## Metrics Engine
* Real-time metrics gathering (Load, Temperatures, Memory utilization).
* Normalizer limits outputs to safe ranges.

## Platform Support
* Operating Systems: Windows, macOS, Linux.
* API Used: `/api/hardware/scan`, `/api/hardware/metrics`.
