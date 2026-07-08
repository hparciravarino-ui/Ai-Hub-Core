import { VectorManager } from '../vector/VectorManager';
import { DocumentParser } from './DocumentParser';
import { ChunkingStrategy } from './ChunkingStrategy';
import { EmbeddingEngine } from './EmbeddingEngine';
import { eventBus } from '../events/EventBus';

export interface IngestedFileRecord {
  filename: string;
  language: string;
  detectedType: string;
  wordCount: number;
  charCount: number;
  hash: string;
  timestamp: string;
  author: string;
  chunksCount: number;
  version: number;
}

export class RAGService {
  private static COLLECTION_NAME = 'enterprise_knowledge';
  private static fileRegistry: Map<string, IngestedFileRecord> = new Map();
  
  // Observability & Metrics
  private static totalQueries = 0;
  private static searchTimeAccumulator = 0;
  private static latestSearchTimes: number[] = [];

  public static async initialize() {
    const db = VectorManager.getInstance();
    await db.createCollection(this.COLLECTION_NAME);
  }

  public static async ingestDocument(fileBuffer: ArrayBuffer, mimeType: string, filename: string, author: string = 'system') {
    eventBus.publish('rag_ingest_started', { filename });
    
    // 1. Intelligent Parsing & OCR
    const parsedDoc = await DocumentParser.parse(fileBuffer, mimeType, filename);
    const text = parsedDoc.text;
    const hash = parsedDoc.metadata.hash;

    // Deduplication check
    const existing = this.fileRegistry.get(filename);
    if (existing && existing.hash === hash) {
      console.log(`Document "${filename}" is unchanged. Skipping re-indexing.`);
      eventBus.publish('rag_ingest_completed', { filename, chunks: existing.chunksCount, status: 'SKIPPED_DEDUPLICATED' });
      return { success: true, chunksIngested: 0, status: 'SKIPPED_DEDUPLICATED' };
    }

    const version = existing ? existing.version + 1 : 1;

    // 2. Chunking
    const chunks = ChunkingStrategy.chunkText(text);

    // 3. Vector Embeddings
    const embeddings = await EmbeddingEngine.generateEmbeddings(chunks);

    // 4. Persistence
    const db = VectorManager.getInstance();
    
    // If updating, delete previous embeddings of this file
    if (existing) {
      // In a physical DB, we would filter-delete. For our Vector layer, we'll keep it simple or do a collection refresh.
      // For now, we will append and track the latest version in metadata.
    }

    const vectorDocs = chunks.map((chunk, i) => ({
      id: `${filename}_v${version}_chunk_${i}_${Date.now()}`,
      vector: embeddings[i],
      text: chunk,
      metadata: {
        source: filename,
        author,
        timestamp: new Date().toISOString(),
        chunkIndex: i,
        hash,
        version,
        language: parsedDoc.metadata.language,
        detectedType: parsedDoc.metadata.detectedType
      }
    }));

    await db.insert(this.COLLECTION_NAME, vectorDocs);

    // Record in registry
    const record: IngestedFileRecord = {
      filename,
      language: parsedDoc.metadata.language,
      detectedType: parsedDoc.metadata.detectedType,
      wordCount: parsedDoc.metadata.wordCount,
      charCount: parsedDoc.metadata.charCount,
      hash,
      timestamp: parsedDoc.metadata.timestamp,
      author,
      chunksCount: chunks.length,
      version
    };
    
    this.fileRegistry.set(filename, record);

    eventBus.publish('rag_ingest_completed', { filename, chunks: chunks.length, version });
    
    return { 
      success: true, 
      chunksIngested: chunks.length, 
      version,
      metadata: record
    };
  }

  public static async search(query: string, topK: number = 5, filters?: Record<string, any>) {
    const startTime = Date.now();
    this.totalQueries++;

    const queryVector = await EmbeddingEngine.generateEmbedding(query);
    const db = VectorManager.getInstance();
    const rawResults = await db.search(this.COLLECTION_NAME, queryVector, topK * 2); // Get a bit more for hybrid ranking/filtering

    // Apply metadata filters if provided
    let results = rawResults;
    if (filters) {
      results = rawResults.filter(r => {
        for (const key of Object.keys(filters)) {
          if (r.metadata?.[key] !== filters[key]) return false;
        }
        return true;
      });
    }

    // Trim back to topK
    results = results.slice(0, topK);

    const elapsed = Date.now() - startTime;
    this.searchTimeAccumulator += elapsed;
    this.latestSearchTimes.push(elapsed);
    if (this.latestSearchTimes.length > 50) this.latestSearchTimes.shift();

    return results;
  }

  public static getIngestedFiles(): IngestedFileRecord[] {
    return Array.from(this.fileRegistry.values());
  }

  public static async getStats() {
    const db = VectorManager.getInstance();
    const dbStats = await db.getStats();
    
    const avgSearchTime = this.totalQueries > 0 ? (this.searchTimeAccumulator / this.totalQueries) : 0;

    return {
      ...dbStats,
      totalQueries: this.totalQueries,
      averageSearchTimeMs: parseFloat(avgSearchTime.toFixed(2)),
      filesCount: this.fileRegistry.size,
      files: this.getIngestedFiles(),
      latestSearchTimes: this.latestSearchTimes
    };
  }

  public static clearRegistry() {
    this.fileRegistry.clear();
    this.totalQueries = 0;
    this.searchTimeAccumulator = 0;
    this.latestSearchTimes = [];
  }
}
