# 02_Model_Selection_Evidence

## Modulo: Model Selection Engine

* **File coinvolti**: 
  - `/src/core/models/AutoConfigurationEngine.ts`
  - `/src/core/models/EnterpriseModelManager.ts`
* **Classi coinvolte**: 
  - `AutoConfigurationEngine`
  - `EnterpriseModelManager`
* **Metodi coinvolti**: 
  - `AutoConfigurationEngine.calculateOptimalConfig(hardware, modelSize, quantization)`
  - `EnterpriseModelManager.calculateOptimalConfigForModel(modelId, hardwareProfile)`

### Flusso di Esecuzione
1. La UI richiede la configurazione ideale per un modello specifico.
2. `EnterpriseModelManager` recupera il modello dal catalogo in-memory locale.
3. Passa il profilo hardware rilevato del sistema all'elaboratore `AutoConfigurationEngine`.
4. Viene calcolato il numero di thread della CPU (`Math.max(1, Math.floor(threads * 0.75))`).
5. Viene esaminata la VRAM del controller grafico primario:
   - Se VRAM > 16GB: Vengono scaricati 99 layer sulla GPU (total offloading), la finestra di contesto impostata a 32768, batch size a 2048.
   - Se VRAM > 8GB: Offload di 35 layer sulla GPU, contesto a 8192, batch size a 1024.
   - Se VRAM > 4GB: Offload di 15 layer, contesto a 4096, batch size a 512.
6. Se la CPU è un processore Apple Silicon, la GPU viene impostata automaticamente a 99 (memoria unificata Metal).

### Stato Reale dell'Implementazione
* **Stato**: **PARZIALMENTE IMPLEMENTATO**
* **Evidenza**: La logica di calcolo dei parametri di allocazione (layer GPU, thread, batch e contesto) è reale e calcolata dinamicamente. Tuttavia, la selezione automatica globale multicriterio (punteggio del modello basato su benchmark in tempo reale, costo stimato, failover/timeout dinamico di provider offline) non è pienamente cablata, affidandosi a logiche deterministiche parziali basate sulla sola dimensione del modello stimata (linea 25: `sizeBytes || 4000000000`).
