# 03_Benchmark_Evidence

## Modulo: Benchmark Engine

* **File coinvolti**: 
  - `/src/core/benchmark/BenchmarkRunner.ts`
  - `/src/core/services/BenchmarkService.ts`
  - `/src/server/benchmark/BenchmarkRunner.ts`
  - `/src/server/routes/benchmark.ts`
* **Classi coinvolte**: 
  - `BenchmarkRunner` (lato server e client)
  - `BenchmarkService`
* **Metodi coinvolti**: 
  - `BenchmarkRunner.runBenchmark(modelId, modelName, provider)`
  - `BenchmarkService.runBenchmark(modelId, modelName, provider)`

### Flusso di Esecuzione
1. La UI attiva un benchmark premendo il pulsante dedicato.
2. Viene invocata l'API `POST /api/benchmark/run`.
3. Il server acquisisce lo stato di utilizzo hardware iniziale tramite `MetricsEngine.getLiveMetrics()`.
4. In base al provider (`native` o `llamacpp`), viene eseguita un'attesa simulata.
5. Vengono generati dati di throughput (tokens/sec) e latenza fittizi.
6. Viene calcolato lo scarto di utilizzo hardware finale.
7. I risultati vengono salvati tramite `BenchmarkDatabase.saveResult(result)` in memoria.

### Stato Reale dell'Implementazione
* **Stato**: **MOCK / SIMULATO**
* **Evidenza**: In `/src/server/benchmark/BenchmarkRunner.ts`, la misurazione del tempo di primo token e della velocità di inferenza non esegue alcun prompt di calcolo reale. Utilizza un timeout fittizio (linea 21: `await new Promise(resolve => setTimeout(resolve, 800))`) e Timing hardcoded (linea 23: `load_duration: 150000000, eval_count: 50`), simulando l'elaborazione del modello.
