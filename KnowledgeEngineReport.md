# Knowledge Engine Vector DB Implementation Report
**Document ID:** EA-BOARD-KNOW-02

## 1. Selezione Architetturale (SQLite Persistent Vector Store)
Invece di utilizzare istanze server esterne via Docker (es. Qdrant o Weaviate) che introdurrebbero dipendenze esterne incontrollabili nel runtime limitato, è stata scelta una strategia "Embedded SQL Database".
È stato installato il motore ad alte prestazioni **better-sqlite3**. I vettori sono memorizzati in file serializzati e interrogati da un custom resolver per il Cosine Similarity inserito al boot.

## 2. Modifiche Architetturali al RAGService
- **Deduplicazione Hash**: L'hashing MD5/SHA256 sui file scansionati permette la validazione `if (existing && existing.hash === hash)` saltando passaggi di embedding onerosi.
- **Versioning**: Ad ogni reinserimento, viene aggiornato l'attributo versioning dei blocchi. I frammenti obsoleti dello stesso sorgente (identificato per nome file e versione) vengono disconnessi usando un comando `deleteBySource` integrato nella cache e nel VDB.
- **Restore al riavvio**: All'inizializzazione del container (`RAGService.initialize()`), il registro file viene ricostruito dinamicamente tramite interrogazione aggregata dei metadati presenti su SQLite (usando la funzione `json_extract`).

## 3. Strategia di Gestione Metadati (JSON in SQLite)
L'aggiunta e la lettura dei metadati sono state gestite mappandole alla colonna `metadata` testuale di SQLite, che espone capacità di estrazione json con funzioni built-in (`json_extract_match` implementato custom e via query raw per i group by aggregati).

## 4. Chunking Avanzato
La logica stringa ingenua in `ChunkingStrategy.ts` è stata completamente riscritta. La regex impiegata segmenta dapprima sui paragrafi doppi, poi sulle frasi. Questo salvaguarda l'accuratezza del Retrieval RAG limitando l'effetto "taglio del concetto" a metà.
L'overlap (sovrapposizione) è stato inoltre riposizionato per agganciare un'unità logica (una porzione di frase precedente) ai nuovi chunk, rafforzando l'ancoraggio dell'attenzione locale (Local Attention Anchor).
