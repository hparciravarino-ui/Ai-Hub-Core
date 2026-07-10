# Hardware Capabilities

## Scanner & Collector
* OS: Rilevato via `os` package.
* CPU: Rilevata via `systeminformation` (`si.cpu()`, `si.currentLoad()`).
* RAM: Rilevata via `systeminformation` (`si.mem()`).
* GPU: Rilevata via `systeminformation` (`si.graphics()`).
* Storage: Rilevato via `systeminformation` (`si.fsSize()`).

## Valori
* Reali: Metriche di carico, memoria e spazio su disco (Express backend).
* API: `/api/hardware/scan`, `/api/hardware/metrics`.
* Librerie: `systeminformation`.
