# RAG Engine

## Document Parsing
* Handlers for JSON, TXT, MD, CSV. Extensible to PDF via external processing.
* Component: `DocumentParser.ts`

## Chunking
* Overlapping text window chunker (Token estimation based).
* Component: `ChunkingStrategy.ts`

## Embedding
* Provider: Gemini (`gemini-embedding-2-preview`).
* Dimension: 1536.
* Fallback: Deterministic mock hashing algorithm if API key missing (`GeminiService.ts`).

## Vector Search
* Algorithm: Cosine similarity matching.
* DB: `LocalVectorDatabase.ts`
