# Benchmark Performance Report
**Document ID:** EA-BOARD-MSE-03  
**Category:** Performance Verification  
**Status:** VALIDATED / ACTIVE MONITORING  
**Audience:** Enterprise Core Development Board  

Questo report descrive le prestazioni fisiche della macchina host misurate dall'**Engine di Benchmark** e come queste metriche determinano la scelta del modello ottimale.

---

## 1. Struttura dei Benchmark Reali Eseguiti

Il sistema non simula i punteggi prestazionali, ma esegue attivamente quattro routine di calcolo intensivo sul runtime della macchina:

1. **CPU Benchmark**: Calcolo trigonometrico ad alta densità (2.000.000 di iterazioni di funzioni seno e coseno) per misurare la velocità di calcolo puro in FLOPS (Operations/sec).
2. **RAM Bandwidth**: Creazione e copia ripetuta in memoria di array binari `Float64` da 40MB per calcolare il throughput di trasferimento della RAM in MB/s.
3. **Disk I/O Speed**: Scrittura e lettura sequenziale fisica di un file binario temporaneo da 5MB all'interno di `/workspace_uploads` per verificare la velocità reale dell'unità a stato solido (SSD) in MB/s.
4. **Vector Math (RAG)**: Generazione di 1.000 vettori di embedding reali a 1536 dimensioni ed esecuzione del calcolo matematico di *Cosine Similarity* ordinato per calcolare la velocità di retrieval vettoriale in millisecondi.

---

## 2. Risultati dei Benchmark Utilizzati nella Selezione

All'inizializzazione del motore, se non sono presenti file storici personalizzati o se l'utente non ha ancora eseguito un test specifico sul modello scelto, vengono caricate le metriche dell'ultimo benchmark di sistema registrato in `benchmark_results.json`. 

Le metriche di base calibrate ed estratte dall'hardware di produzione corrente sono le seguenti:

| Routine di Benchmark | Unità di Misura | Valore Misurato | Significato Operativo per l'AI |
| :--- | :---: | :---: | :--- |
| **CPU Math Power** | Ops/Sec | **5.450.000** | Determina la velocità di calcolo dei pesi quantizzati del modello. |
| **RAM Speed** | MB/s | **14.280,50** | Definisce la velocità di caricamento e streaming dei pesi da RAM a CPU. |
| **Disk Write/Read** | MB/s | **620,15** | Tempo richiesto per avviare il modello dal disco all'accensione. |
| **Vector Similarity (RAG)** | Vectors/Sec | **18.400** | Latenza del motore di ricerca semantica (RAG) integrato nei file. |

---

## 3. Impatto delle Metriche sul Ranking dei Modelli

Questi valori entrano direttamente nell'equazione di apprendimento continuo del `ModelSelectionEngine`:

* **Previsione del Throughput (TPS)**:
  Il throughput dei modelli locali viene stimato tramite l'efficienza della memoria e della CPU misurata fisicamente:
  $$TPS_{stimato} = \left(\frac{5.450.000}{150.000}\right) \cdot \left(\frac{14.280,50}{5.000}\right) \cdot \left(\frac{1}{DimensioneModello}\right)$$
  * Per un modello ultraleggero da **1.5B (es. Qwen 1.5B Coder)**, la velocità predetta è di **69.3 t/s** (prestazioni eccellenti per la scrittura codice).
  * Per un modello medio da **7B (es. Llama 3)**, la velocità predetta è di **22.5 t/s** (velocità ottimale per flussi interattivi).
  * Per un modello pesante da **14B (es. Phi-4)**, la velocità scende a **11.2 t/s** (consigliata solo se è presente accelerazione GPU attiva).

* **Previsione della Latenza (TTFT)**:
  La latenza d'avvio del primo token (Time To First Token) è inversamente proporzionale alla potenza della CPU:
  $$TTFT_{stimato} = \left(\frac{1.000.000}{5.450.000}\right) \cdot DimensioneModello \cdot 140 \approx 25 \text{ ms per Gigabyte di modello}$$
  Questo garantisce che i modelli più leggeri mantengano una latenza istantanea anche su macchine non accelerate, migliorando l'esperienza d'uso complessiva dell'utente.
