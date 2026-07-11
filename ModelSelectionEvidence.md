# Model Selection Engine - Evidence of Score Calculation
**Document ID:** EA-BOARD-MSE-01  
**Category:** Core Engine Architecture Evidence  
**Status:** FULLY COMPLETED & VERIFIED  
**Audience:** Enterprise Core Development Board  

---

## 1. File e Metodi Coinvolti

Il motore di selezione automatica e ranking dei modelli è implementato e distribuito nei seguenti percorsi del workspace:

* **File Core**: `/src/server/models/ModelSelectionEngine.ts`
* **Classe**: `ModelSelectionEngine`
* **Metodi Principali**:
  * `selectBestModel(request: SelectionRequest, failedModelIds?: string[])`: Metodo principale asincrono che analizza la telemetria, recupera e adatta i benchmark reali, elabora i criteri e calcola il punteggio finale ponderato decrescente di tutti i modelli compatibili.
  * `getFailoverModel(failedModelId: string, request: SelectionRequest)`: Metodo di failover stateful non ricorsivo che esclude istantaneamente il modello fallito ed esegue il routing dinamico verso la migliore alternativa disponibile.

---

## 2. Flusso di Calcolo Multicriterio (MCDM)

Il punteggio finale di compatibilità di ciascun modello viene calcolato combinando cinque criteri distinti pesati in virgola mobile, calibrati su metriche di sistema reali ed evidenze storiche.

```
+--------------------------------------------------------------+
|                LIVELLAMENTO MULTICRITERIO (MCDM)             |
+--------------------------------------------------------------+
| 1. Hardware Fit (30%): RAM, VRAM e Apple Silicon (Metal)    |
| 2. Prestazioni Reali (25%): throughput (TPS) e latenza (TTFT) |
| 3. Task Suitability (20%): Capacità ottimizzate e tags       |
| 4. Context Headroom (15%): Limiti prompt vs finestra        |
| 5. Costo Provider (10%): Tariffe API vs Calcolo Locale Gratuito |
+--------------------------------------------------------------+
                               |
                               v
               Punteggio Finale (0 - 100)
```

### Formula Matematica del Punteggio Generale
$$Score = 0.30 \cdot S_{HW} + 0.25 \cdot S_{Perf} + 0.20 \cdot S_{Task} + 0.15 \cdot S_{Ctx} + 0.10 \cdot S_{Cost}$$

---

## 3. Dettaglio dei Criteri di Valutazione

### Criterio 1: Hardware Compatibility & Dedicated Allocation (Peso: 30%)
* **Metrica d'Ingresso**: Telemetria reale dell'hardware tramite `HardwareEngine.scan()`.
* **Regola di Disqualifica**: Se la RAM richiesta per caricare il modello locale ($RAM_{richiesta} = DimensioneModello \cdot 1.25$ per considerare l'overhead di contesto) supera la RAM fisica disponibile sul sistema ospite ($RAM_{fisica}$), il modello viene disqualified ($S_{HW} = 0$).
* **Fattore GPU/Metal**:
  * Se la CPU è identificata come Apple Silicon (M1/M2/M3/M4), la memoria unificata consente l'offloading al 100% sulla GPU Metal senza penalità di bus. Il punteggio è impostato fisicamente a **100**.
  * Se sono presenti GPU dedicate con architettura CUDA/Intel, viene calcolato il rapporto di offloading dei layer in base alla VRAM libera:
    $$S_{HW} = 60 + 35 \cdot \left(\frac{VRAM_{libera}}{VRAM_{richiesta}}\right)$$
  * Se non è presente nessuna GPU accelerata, l'esecuzione ricade interamente su CPU con un punteggio standard di **60**.

### Criterio 2: Throughput (TPS) & Latency Performance (Peso: 25%)
* **Metrica d'Ingresso**: Statistiche d'uso storiche aggregate lette da `BenchmarkDatabase.getAllResults()`.
* **Meccanismo di Apprendimento Continuo**:
  * **Caso A (Dati Specifici)**: Se il modello è stato testato localmente, $TPS_{storico}$ e $TTFT_{storico}$ vengono calcolati come media reale dei precedenti run del modello.
  * **Caso B (Generalizzazione Hardware)**: Se non esistono benchmark specifici, il motore interpola le prestazioni reali della macchina basandosi sulle performance fisiche hardware misurate in altri benchmark generali (FLOPS della CPU, Throughput di memoria RAM e velocità I/O su disco):
    $$TPS_{stimato} = \left(\frac{CPU_{OpsSec}}{150.000}\right) \cdot \left(\frac{RAM_{SpeedMBs}}{5.000}\right) \cdot \left(\frac{1}{DimensioneModello}\right)$$
* **Normalizzazione**:
  * Throughput: $S_{Throughput} = \min\left(100, \frac{TPS}{40} \cdot 100\right)$
  * Latenza: $S_{Latency} = \max\left(0, 100 - \frac{TTFT}{15}\right)$
  * Punteggio Prestazionale Finale: $S_{Perf} = 0.60 \cdot S_{Throughput} + 0.40 \cdot S_{Latency}$.

### Criterio 3: Task Suitability (Peso: 20%)
* **Filtro Assoluto**: Modelli sprovvisti di capacità `multimodal`/`vision` o `audio` vengono scartati all'istante (punteggio zero) se il task richiede espressamente tali input.
* **Corrispondenza di Tag**:
  * Modello specializzato (es. *Qwen Coder* per task `coding` o *DeepSeek-R1* per task `reasoning`): Punteggio impostato a **100**.
  * Modello generico abilitato per il task: Punteggio impostato a **90**.
  * Modello generico adattato tramite chat: Punteggio impostato a **70**.

### Criterio 4: Context Headroom (Peso: 15%)
* **Filtro Assoluto**: Se la lunghezza stimata dei token del prompt supera la finestra di contesto massima del modello ($Tokens_{prompt} > Context_{max}$), il modello viene disqualified ($S_{Ctx} = 0$).
* **Calcolo della Riserva (Headroom)**:
  * Rapporto ottimale ($Context_{max} / Tokens_{prompt} > 10$): Punteggio massimo di **100**.
  * Rapporto buono ($Context_{max} / Tokens_{prompt} > 3$): Punteggio di **85**.
  * Rapporto minimo o saturo: Punteggio scalato a **60**.

### Criterio 5: Cost Effectiveness & Resource Saving (Peso: 10%)
* **Modelli Locali**: Esecuzione interamente privata, offline e gratuita. Punteggio impostato a **100**.
* **Modelli API Cloud**: Calcolato sul costo effettivo stimato per 1 milione di token (assumendo una distribuzione standard di 70% prompt e 30% completamento):
  $$Costo_{1M} = (PrezzoPrompt \cdot 0.7 + PrezzoCompletion \cdot 0.3) \cdot 1.000.000$$
  Il punteggio decresce proporzionalmente all'aumento delle tariffe di fatturazione del provider:
  $$S_{Cost} = \max\left(5, 100 - Costo_{1M} \cdot 6.5\right)$$
  (Un modello costoso come Claude 3.5 Sonnet riceve una penalizzazione di budget rispetto a Gemini Flash).

---

## 4. Gestione Attiva dei Fallback e Failover (Senza Loop)

In caso di mancata risposta del provider, timeout o superamento dei limiti operativi durante una chiamata API, viene invocato `getFailoverModel(failedModelId, request)`. 

1. Il modello fallito viene inserito nell'array di esclusione `failedModelIds`.
2. Viene rieseguito `selectBestModel(request, failedModelIds)`.
3. Il motore esclude all'istante il modello problematico prima di calcolare i punteggi, garantendo un reinstradamento deterministico verso l'alternativa a punteggio più alto, eliminando ogni rischio di loop ricorsivi infiniti.
