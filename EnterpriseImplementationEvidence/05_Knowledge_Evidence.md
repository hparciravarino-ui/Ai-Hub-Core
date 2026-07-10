# 05_Knowledge_Evidence

## Modulo: Knowledge Engine

* **File coinvolti**: 
  - `/src/core/knowledge/RAGService.ts`
  - `/src/core/vector/LocalVectorDatabase.ts`
  - `/src/core/vector/VectorManager.ts`
* **Classi coinvolte**: 
  - `RAGService`
  - `LocalVectorDatabase`
  - `VectorManager`
* **Metodi coinvolti**: 
  - `RAGService.ingestDocument(fileBuffer, mimeType, filename, author)`
  - `RAGService.search(query, topK, filters)`
  - `LocalVectorDatabase.insert(collection, embeddings, namespace)`
  - `LocalVectorDatabase.search(collection, queryVector, topK, namespace)`
  - `LocalVectorDatabase.compressCollection(collection)`

### Flusso di Esecuzione
1. L'utente carica un file testuale che viene passato a `RAGService.ingestDocument()`.
2. Viene estratto l'hash SHA-256 del testo per verificare la deduplicazione.
3. Il testo viene suddiviso in chunk con sovrapposizione in `ChunkingStrategy`.
4. Vengono calcolati i vettori di embedding (reali se configurata la chiave, altrimenti tramite hashing deterministico pseudo-casuale).
5. I vettori vengono inseriti in `LocalVectorDatabase` associandoli alla collezione corretta.
6. La ricerca esegue il prodotto scalare normalizzato della magnitudo (Cosine Similarity) calcolato interamente in virgola mobile per estrarre i top-K chunk.

### Stato Reale dell'Implementazione
* **Stato**: **PARZIALMENTE IMPLEMENTATO / MOCK**
* **Evidenza**: La pipeline di scomposizione in chunk, l'algoritmo matematico reale di Cosine Similarity (linea 100: `computeCosineSimilarity`), l'ingestion asincrona con deduplicazione basata su hash e la cache con TTL sono interamente scritte e funzionanti. Tuttavia, l'evidenza tecnica rivela che `LocalVectorDatabase` memorizza i dati interamente in una `Map` JavaScript in-memory (linea 10: `collections: Map<string, Map<string, VectorEmbedding[]>> = new Map()`). Mancando la persistenza sul file system locale (SQLite, file binario o DB vettoriale), i dati non sopravvivono al riavvio dell'applicazione.
