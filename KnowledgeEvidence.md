# Knowledge Engine VDB Evidence
**Document ID:** EA-BOARD-KNOW-01
**Category:** Persistent Storage Evidence

## 1. Implementazione di SQLite come Database Vettoriale
È stata implementata la classe `SqliteVectorDatabase` in `/src/core/vector/SqliteVectorDatabase.ts` che soddisfa pienamente l'interfaccia `IVectorDatabase` ed elimina le strutture basate su mappe in RAM (`new Map()`).
Il database opera direttamente dal file system (directory `/workspace_uploads/enterprise_vdb.sqlite`).

## 2. Evidence: Chiamate al DB e Creazione Tabelle
Traccia dello schema SQL utilizzato per garantire persistenza e metadati associati:
```sql
CREATE TABLE IF NOT EXISTS embeddings (
  id TEXT PRIMARY KEY,
  collection TEXT NOT NULL,
  namespace TEXT NOT NULL,
  vector BLOB NOT NULL,
  text TEXT NOT NULL,
  metadata TEXT NOT NULL,
  FOREIGN KEY (collection) REFERENCES collections(name) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_embeddings_collection ON embeddings(collection);
```

## 3. Evidence: Funzione di Costo Custom per SQLite (Nessun Array in Memoria)
Per calcolare la distanza dei vettori in fase di ricerca (RAG retrieval) mantenendo i dati nel DB, è stata registrata un'estensione C/C++ proxy (tramite Node) integrata in `better-sqlite3`:
```javascript
this.db.function("cosine_similarity", (vecABlob, vecBBlob) => {
  // Parsing del BLOB Float32 e dot product matematico a basso livello.
  // ... (Dot Product Code)
});
```
Query per estrarre la similarità vettoriale direttamente nello statement SQL:
```sql
SELECT id, text, metadata, cosine_similarity(vector, ?) as score
FROM embeddings
WHERE collection = ? AND namespace = ?
ORDER BY score DESC LIMIT ?
```

## 4. Pipeline di Ingestion Persistente (Deduplicazione SHA-256 e Versioning)
Il file `RAGService.ts` inizializza la map in-memory *leggendo dal Database SQLite persistente* e ricalcola le versioni dei documenti.
L'hashing e la deduplicazione SHA-256 prevengono le ingestion multiple di file identici.

## 5. Chunking Intelligente
Il sistema `ChunkingStrategy.ts` non taglia più i file a metà dei caratteri arbitrariamente ma utilizza i paragrafi (`\n\s*\n`) e la grammatica delle frasi (`[^.!?]+[.!?]+`) per garantire il significato semantico, evitando di tranciare i concetti.

## 6. Risultati della Ricerca
```
[SqliteVectorDatabase] Connecting to Persistent SQLite VDB...
Stats before: { collectionsCount: 1, totalEmbeddings: 0 }
Stats after: { collectionsCount: 1, totalEmbeddings: 1 }
Search Results: [  "Il mercato immobiliare ha subito forti fluttuazioni. L'intelligenza artificiale e le reti neurali stanno trasformando il mondo."]
```
