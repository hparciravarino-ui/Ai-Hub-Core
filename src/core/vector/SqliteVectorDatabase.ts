import path from 'path';
import Database from 'better-sqlite3';
import { IVectorDatabase, VectorEmbedding } from './IVectorDatabase';
import fs from 'fs';

const STORE_DIR = path.join(process.cwd(), 'workspace_uploads');
const DB_FILE = path.join(STORE_DIR, 'enterprise_vdb.sqlite');

export class SqliteVectorDatabase implements IVectorDatabase {
  private db!: Database.Database;
  private dbVersion = 1;
  private lastUpdated: string = new Date().toISOString();

  public async connect(): Promise<void> {
    console.log("[SqliteVectorDatabase] Connecting to Persistent SQLite VDB...");
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    
    this.db = new Database(DB_FILE);
    
    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS collections (
        name TEXT PRIMARY KEY
      );
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
      CREATE INDEX IF NOT EXISTS idx_embeddings_namespace ON embeddings(namespace);
    `);

    // Register cosine similarity custom function in SQLite
    this.db.function("cosine_similarity", (vecABlob: Buffer, vecBBlob: Buffer) => {
      if (!vecABlob || !vecBBlob) return 0;
      
      const fa = new Float32Array(vecABlob.buffer, vecABlob.byteOffset, vecABlob.byteLength / 4);
      const fb = new Float32Array(vecBBlob.buffer, vecBBlob.byteOffset, vecBBlob.byteLength / 4);
      
      let dot = 0, mag1 = 0, mag2 = 0;
      const len = Math.min(fa.length, fb.length);
      for(let i=0; i<len; i++) {
        dot += fa[i]*fb[i];
        mag1 += fa[i]*fa[i];
        mag2 += fb[i]*fb[i];
      }
      const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
      return magnitude === 0 ? 0 : dot / magnitude;
    });

    // Register a JSON filter function to search in metadata efficiently
    this.db.function("json_extract_match", (metadataStr: string, key: string, value: string) => {
      try {
         const meta = JSON.parse(metadataStr);
         return meta[key] == value ? 1 : 0;
      } catch(e) {
         return 0;
      }
    });
  }

  public async disconnect(): Promise<void> {
    console.log("[SqliteVectorDatabase] Disconnecting...");
    if (this.db) {
      this.db.close();
    }
  }

  public async createCollection(name: string): Promise<void> {
    const stmt = this.db.prepare('INSERT OR IGNORE INTO collections (name) VALUES (?)');
    stmt.run(name);
  }

  public async deleteCollection(name: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM collections WHERE name = ?');
    stmt.run(name);
  }

  public async insert(collection: string, embeddings: VectorEmbedding[], namespace = 'default'): Promise<void> {
    await this.createCollection(collection);
    
    const insertStmt = this.db.prepare(`
      INSERT OR REPLACE INTO embeddings (id, collection, namespace, vector, text, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const insertMany = this.db.transaction((items: VectorEmbedding[]) => {
      for (const item of items) {
        const floatArray = new Float32Array(item.vector);
        const buffer = Buffer.from(floatArray.buffer);
        insertStmt.run(
          item.id,
          collection,
          namespace,
          buffer,
          item.text,
          JSON.stringify(item.metadata || {})
        );
      }
    });

    insertMany(embeddings);
    this.lastUpdated = new Date().toISOString();
  }

  public async search(collection: string, queryVector: number[], topK: number, namespace = 'default'): Promise<VectorEmbedding[]> {
    const queryBuffer = Buffer.from(new Float32Array(queryVector).buffer);
    
    const stmt = this.db.prepare(`
      SELECT id, text, metadata, cosine_similarity(vector, ?) as score
      FROM embeddings
      WHERE collection = ? AND namespace = ?
      ORDER BY score DESC
      LIMIT ?
    `);
    
    const rows = stmt.all(queryBuffer, collection, namespace, topK) as any[];
    
    return rows.map(row => ({
      id: row.id,
      text: row.text,
      metadata: JSON.parse(row.metadata),
      vector: [], // We omit returning the large vector unless necessary
      score: row.score
    }));
  }
  
  public async getStats(): Promise<any> {
    const collectionsRow = this.db.prepare('SELECT COUNT(*) as c FROM collections').get() as any;
    const embeddingsRow = this.db.prepare('SELECT COUNT(*) as c FROM embeddings').get() as any;
    
    // Estimate size
    const stat = fs.statSync(DB_FILE);
    
    return {
      provider: 'EnterpriseSqlitePersistentVDB',
      persistentPath: DB_FILE,
      dbVersion: this.dbVersion,
      lastUpdated: this.lastUpdated,
      collectionsCount: collectionsRow.c,
      totalEmbeddings: embeddingsRow.c,
      estimatedMemoryMB: parseFloat((stat.size / (1024 * 1024)).toFixed(2)),
    };
  }

  public async backup(collection: string): Promise<string> {
    // Return path instead of full JSON to avoid OOM for large DBs
    const backupFile = path.join(STORE_DIR, `backup_${collection}_${Date.now()}.sqlite`);
    // SQLite backup API or simply copying file
    this.db.backup(backupFile);
    return backupFile;
  }

  public async restore(collection: string, backupData: string): Promise<void> {
    // backupData should be the file path
    if (fs.existsSync(backupData)) {
      this.db.close();
      fs.copyFileSync(backupData, DB_FILE);
      this.connect();
    }
  }

  public async compressCollection(collection: string): Promise<{ originalSize: number; compressedSize: number; ratio: string }> {
    this.db.exec("VACUUM"); // Compact DB
    return { originalSize: 0, compressedSize: 0, ratio: 'VACUUMED' };
  }

  public async createSnapshot(collection: string): Promise<string> {
    return this.backup(collection);
  }

  public async restoreSnapshot(collection: string, snapshotId: string): Promise<void> {
    return this.restore(collection, snapshotId);
  }

  public async migrateCollection(sourceCollection: string, targetCollection: string): Promise<void> {
    this.createCollection(targetCollection);
    this.db.prepare(`
      UPDATE embeddings 
      SET collection = ? 
      WHERE collection = ?
    `).run(targetCollection, sourceCollection);
  }

  public clearCache(): void {
    // SQLite manages its own page cache
  }
  
  // Custom method to fetch file registry efficiently
  public getRegistry(collection: string) {
    const stmt = this.db.prepare(`
      SELECT json_extract(metadata, '$.source') as filename,
             json_extract(metadata, '$.hash') as hash,
             json_extract(metadata, '$.version') as version,
             COUNT(*) as chunksCount,
             MAX(json_extract(metadata, '$.timestamp')) as timestamp
      FROM embeddings
      WHERE collection = ?
      GROUP BY filename, hash, version
    `);
    return stmt.all(collection);
  }
  
  public deleteBySource(collection: string, source: string) {
    const stmt = this.db.prepare(`
      DELETE FROM embeddings
      WHERE collection = ? AND json_extract(metadata, '$.source') = ?
    `);
    stmt.run(collection, source);
  }
}
