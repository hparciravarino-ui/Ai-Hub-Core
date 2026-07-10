# 04_Hardware_Evidence

## Modulo: Hardware Engine

* **File coinvolti**: 
  - `/src/shared/hardware/Scanner.ts`
  - `/src/shared/hardware/Collector.ts`
  - `/src/shared/hardware/HardwareEngine.ts`
* **Classi coinvolte**: 
  - `Scanner`
  - `Collector`
  - `HardwareEngine`
* **Metodi coinvolti**: 
  - `Scanner.scanSystem()`
  - `Scanner.scanRuntimes()`
  - `HardwareEngine.scan()`

### Flusso di Esecuzione
1. `HardwareEngine.scan()` invoca `Collector.collectRawData()`.
2. `Collector` richiama contemporaneamente `Scanner.scanSystem()` e `Scanner.scanRuntimes()`.
3. `Scanner.scanSystem()` raccoglie in modo asincrono tramite `Promise.all` i parametri di sistema utilizzando la libreria `systeminformation`.
4. Vengono estratti i dettagli di: CPU, grafica (GPU), memoria RAM, OS, dischi fisici, spazio libero su disco, carico di CPU corrente e temperature hardware.
5. `Scanner.scanRuntimes()` lancia comandi shell reali (es. `node -v`, `python3 --version`, `docker -v`, `git --version`, `llama-cli --help`) per determinare l'ambiente di runtime disponibile.

### Stato Reale dell'Implementazione
* **Stato**: **IMPLEMENTATO**
* **Evidenza**: L'implementazione è interamente reale ed estrattiva sul sistema operativo ospite. Non ci sono simulazioni o valori artificiali nella catena di scansione hardware. Tutte le informazioni provengono direttamente dai driver di sistema e dalle API kernel lette da `systeminformation` e da esecuzioni dirette tramite `exec` (linea 22: `const { stdout } = await execAsync(command)`).
