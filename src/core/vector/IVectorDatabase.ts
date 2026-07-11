export interface VectorEmbedding {
  id: string;
  vector: number[];
  metadata: Record<string, any>;
  text: string;
}

export interface IVectorDatabase {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  createCollection(name: string): Promise<void>;
  deleteCollection(name: string): Promise<void>;
  insert(collection: string, embeddings: VectorEmbedding[], namespace?: string): Promise<void>;
  search(collection: string, queryVector: number[], topK: number, namespace?: string): Promise<VectorEmbedding[]>;
  getStats(): Promise<any>;
  
  // Enterprise Operations
  backup(collection: string): Promise<string>;
  restore(collection: string, backupData: string): Promise<void>;
  compressCollection(collection: string): Promise<{ originalSize: number; compressedSize: number; ratio: string }>;
  createSnapshot(collection: string): Promise<string>;
  restoreSnapshot(collection: string, snapshotId: string): Promise<void>;
  migrateCollection(sourceCollection: string, targetCollection: string): Promise<void>;
  clearCache(): void;
  deleteBySource?(collection: string, source: string): void;
  getRegistry?(collection: string): any[];
}
