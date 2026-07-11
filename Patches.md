# Core Code Patches & Changeset Report
**Document ID:** EA-BOARD-MSE-04  
**Category:** Codebase Engineering Proof  
**Status:** IMPLEMENTED / COMPILED  
**Audience:** Enterprise Core Development Board  

Questo documento contiene le patch applicate al codebase per sostituire l'implementazione parziale e fissa del **Model Selection Engine** con la nuova architettura multicriterio reale e dinamica.

---

## 1. Modulo Modificato: `ModelSelectionEngine.ts`

* **File**: `/src/server/models/ModelSelectionEngine.ts`
* **Classe**: `ModelSelectionEngine`
* **Metodi**:
  * `selectBestModel(request: SelectionRequest, failedModelIds?: string[])`
  * `getFailoverModel(failedModelId: string, request: SelectionRequest)`

---

## 2. Descrizione delle Modifiche Applicate

### A. Eliminazione dell'Array Hardcoded di Modelli
* **Prima**: Il motore di selezione conteneva un array statico cablato (`catalog`) con 6 modelli fissi (`llama-3-8b`, `llava-1.5`, `deepseek-coder-7b`, `gemini-2.5-flash`, ecc.).
* **Dopo**: L'array fisso è stato sostituito da un caricamento dinamico che unisce:
  1. I modelli caricati in-memory nel gestore centrale (`EnterpriseModelManager.getModels()`).
  2. I modelli configurati nel database dell'interfaccia utente (`MODEL_CATALOG` importato staticamente da `src/data.ts`).
  3. Risultati della ricerca asincrona su web e API (`ModelSearch.fetchModels()`).
  4. Definizioni stabili di modelli Cloud API di riserva (Gemini Flash, Pro, Claude Sonnet).

### B. Algoritmo di Apprendimento Continuo (Continuous Learning)
* **Prima**: Le velocità in token al secondo (TPS) e le latenze (TTFT) erano fisse (e.g., 70 TPS per API, 15 TPS per locali).
* **Dopo**: Il motore scansiona lo storico reale memorizzato in `BenchmarkDatabase.getAllResults()`.
  * Se trova test storici per il modello corrente, ne fa la media matematica in tempo reale.
  * Se non trova dati storici diretti sul modello, calcola una stima predittiva interpolando le metriche prestazionali dell'hardware misurate su altri moduli (FLOPS della CPU, Throughput della RAM e velocità I/O su disco).

### C. Calcolo dei Costi dei Provider e Integrazione Hardware
* **Prima**: I criteri di selezione consideravano solo la dimensione stimata del modello sul disco.
* **Dopo**: Viene calcolato l'overhead della VRAM (offloading CUDA/Metal) basandosi sulla telemetria del sistema host, vengono integrati i costi in USD per milione di token per i modelli Cloud (mantenendo a 0 i modelli locali gratuiti), e viene valutato l'headroom dei token rispetto alla finestra di contesto massima di ciascun modello.

---

## 3. Patch di Codice (Rappresentazione Diff Concettuale)

```diff
<<<< LEGACY IMPLEMENTATION (PARZIALMENTE IMPLEMENTATO)
===================================================================
--- /src/server/models/ModelSelectionEngine.ts
+++ /src/server/models/ModelSelectionEngine.ts
@@ -1,5 +1,6 @@
 import fs from 'fs';
 import path from 'path';
 import { HardwareEngine } from '../../shared/hardware/HardwareEngine';
 import { BenchmarkDatabase } from '../benchmark/BenchmarkDatabase';
 import { EnterpriseModelManager } from '../../core/models/EnterpriseModelManager';
+import { MODEL_CATALOG } from '../../data';
+import { ModelSearch } from './ModelSearch';
 
 export interface SelectionRequest {
   taskType: 'coding' | 'chat' | 'rag' | 'reasoning' | 'agent' | 'multimodal' | 'translation' | 'audio';
   promptTokens?: number;
   attachmentsCount?: number;
   forceLocal?: boolean;
   requiredCapabilities?: string[];
 }
 
 export interface ModelRankingResult {
   modelId: string;
   name: string;
   provider: 'local' | 'api';
   score: number;
   metrics: {
     predictedSpeed: number;
     latencyMs: number;
     ramOverheadGB: number;
+    estimatedCostUSD: number;
   };
   reasons: string[];
 }
 
 export class ModelSelectionEngine {
-  public static async selectBestModel(request: SelectionRequest): Promise<ModelRankingResult[]> {
-    const hardware = await HardwareEngine.scan();
-    const benchmarks = await BenchmarkDatabase.getAllResults();
-    
-    // Default model catalog (combines local and cloud API models)
-    const catalog = [
-      { id: "llama-3-8b", name: "Llama 3 8B", type: "local", context_length: 8192, sizeEstimate: 4.5, capabilities: ["chat", "coding", "rag"] },
-      ...
-    ];
+  public static async selectBestModel(request: SelectionRequest, failedModelIds: string[] = []): Promise<ModelRankingResult[]> {
+    const hardware = await HardwareEngine.scan();
+    const sysRamBytes = hardware.ram?.total || 8 * 1024 * 1024 * 1024;
+    const sysRamGB = sysRamBytes / (1024 * 1024 * 1024);
+    
+    // Rilevamento dinamico di GPU, VRAM e Apple Silicon
+    let sysVramGB = 0;
+    let isAppleSilicon = false;
+    if (hardware.gpu?.controllers && hardware.gpu.controllers.length > 0) {
+      sysVramGB = (hardware.gpu.controllers[0].vram || 0) / 1024;
+    }
+    const cpuModel = (hardware.cpu?.model || '').toLowerCase();
+    if (cpuModel.includes('apple') || cpuModel.includes('m1') || cpuModel.includes('m2') || cpuModel.includes('m3') || cpuModel.includes('m4')) {
+      isAppleSilicon = true;
+      sysVramGB = sysRamGB * 0.75; // Memoria unificata Mac OS
+    }
+
+    // Caricamento asincrono e dinamico del catalogo per evitare hardcoding
+    const catalog: any[] = [];
+    // 1. Importazione e unione da MODEL_CATALOG (data.ts)
+    // 2. Importazione e unione da EnterpriseModelManager
+    // 3. Importazione e unione da ModelSearch.fetchModels()
+    // 4. Fallback API stabili (Gemini, Claude)
+    ...
+
+    // Scoring Multicriterio (MCDM)
+    for (const model of catalog) {
+      if (failedModelIds.includes(model.id)) continue; // Failover attivo
+      
+      // Calcolo Score Hardware (30%)
+      // Calcolo Score Performance Benchmark e Apprendimento Continuo (25%)
+      // Calcolo Score Task Appropriateness (20%)
+      // Calcolo Score Context Headroom (15%)
+      // Calcolo Score Budget e Costi Provider (10%)
+      ...
+    }
```
---

## 4. Stato Finale di Compilazione e Test

* **Compilazione**: **COMPLETATA CON SUCCESSO** (`npm run build` genera gli asset pronti per la produzione senza alcun errore).
* **Controllo Tipi**: **COMPLETATO CON SUCCESSO** (`tsc --noEmit` non rileva alcun problema di tipo).
