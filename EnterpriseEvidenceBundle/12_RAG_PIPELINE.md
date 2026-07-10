# RAG Pipeline

## Flusso
1. **Document Parsing**: `DocumentParser.ts` (MOCK/Incomplete per tipi complessi, TXT/MD supportati tramite lettura file).
2. **Chunking**: `ChunkingStrategy.ts`.
3. **Embedding**: `GeminiService.ts` o `generateMockEmbedding`.
4. **Knowledge Retrieval**: `VectorManager.ts` inserisce/cerca.
5. **Storage**: `LocalVectorDatabase.ts` (In-memory Array, MOCK storage).
