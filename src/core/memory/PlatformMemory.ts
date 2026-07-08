import { eventBus } from '../events/EventBus';
import { VaultService } from '../security/VaultService';
import { AuditLogger } from '../security/AuditLogger';

export interface MemoryRecord {
  id: string;
  partition: 'conversations' | 'tasks' | 'configurations' | 'telemetry' | 'audit_logs' | 'cache';
  data: any;
  encrypted: boolean;
  timestamp: string;
  expiresAt?: string;
}

export class PlatformMemory {
  private static records: Map<string, MemoryRecord> = new Map();
  private static isGCRunning = false;
  private static encryptionKeys: Set<string> = new Set();

  public static initialize() {
    console.log("Centralized Platform Memory System initialized.");
    
    // Periodically run Garbage Collection
    this.runGarbageCollection();
    
    // Subscribe to system events to auto-persist audit logs and telemetry in Memory
    eventBus.subscribe('audit_log_created', (log: any) => {
      this.save('audit_logs', `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`, log);
    });

    eventBus.subscribe('workflow_node_failed', (err: any) => {
      this.save('telemetry', `err_${Date.now()}`, { type: 'WORKFLOW_FAILURE', details: err });
    });
  }

  // Single central storage method
  public static async save(
    partition: MemoryRecord['partition'], 
    id: string, 
    data: any, 
    encrypt = false, 
    ttlSeconds?: number
  ): Promise<void> {
    let finalData = data;
    
    if (encrypt) {
      try {
        const jsonString = JSON.stringify(data);
        const encryptedValue = Buffer.from(jsonString).toString('base64');
        
        // Save sensitive payload in VaultService
        VaultService.storeSecret(id, encryptedValue, 'SYSTEM');
        
        finalData = { payload: encryptedValue };
        this.encryptionKeys.add(id);
      } catch (e: any) {
        console.error(`Encryption failed for record ${id}, saving in plaintext:`, e.message);
      }
    }

    const expiresAt = ttlSeconds ? new Date(Date.now() + ttlSeconds * 1000).toISOString() : undefined;

    const record: MemoryRecord = {
      id,
      partition,
      data: finalData,
      encrypted: encrypt && this.encryptionKeys.has(id),
      timestamp: new Date().toISOString(),
      expiresAt
    };

    this.records.set(id, record);
    
    if (partition !== 'audit_logs') {
      AuditLogger.log({
        actor: 'SYSTEM',
        action: 'PERSISTENCE_SAVE',
        resource: `partition:${partition}/id:${id}`,
        status: 'SUCCESS',
        details: { expiresAt }
      });
    }
  }

  // Single central read method
  public static async retrieve(id: string): Promise<any | null> {
    const record = this.records.get(id);
    if (!record) return null;

    // Check expiration
    if (record.expiresAt && new Date(record.expiresAt) < new Date()) {
      this.records.delete(id);
      return null;
    }

    let payload = record.data;

    if (record.encrypted) {
      try {
        const retrievedSecret = VaultService.getSecret(id, 'SYSTEM') || payload.payload;
        const decryptedJson = Buffer.from(retrievedSecret, 'base64').toString('utf-8');
        payload = JSON.parse(decryptedJson);
      } catch (e: any) {
        console.error(`Decryption failed for record ${id}:`, e.message);
        return null;
      }
    }

    return payload;
  }

  public static getPartition(partition: MemoryRecord['partition']): MemoryRecord[] {
    const now = new Date();
    return Array.from(this.records.values()).filter(record => {
      if (record.partition !== partition) return false;
      if (record.expiresAt && new Date(record.expiresAt) < now) {
        this.records.delete(record.id); // Lazy delete
        return false;
      }
      return true;
    });
  }

  public static delete(id: string): boolean {
    const existed = this.records.has(id);
    this.records.delete(id);
    this.encryptionKeys.delete(id);
    return existed;
  }

  // Automated Garbage Collection protocol
  public static runGarbageCollection(): { purgedCount: number; activeCount: number } {
    if (this.isGCRunning) return { purgedCount: 0, activeCount: this.records.size };
    this.isGCRunning = true;

    let purgedCount = 0;
    const now = new Date();

    for (const [id, record] of this.records.entries()) {
      // 1. Purge expired TTL items
      if (record.expiresAt && new Date(record.expiresAt) < now) {
        this.records.delete(id);
        this.encryptionKeys.delete(id);
        purgedCount++;
        continue;
      }

      // 2. Clear old telemetry items (limit to 200 elements in memory)
      if (record.partition === 'telemetry') {
        const telemetryRecords = this.getPartition('telemetry');
        if (telemetryRecords.length > 200) {
          telemetryRecords.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          const toPurge = telemetryRecords.slice(0, telemetryRecords.length - 200);
          toPurge.forEach(p => {
            this.records.delete(p.id);
            purgedCount++;
          });
        }
      }
    }

    this.isGCRunning = false;
    if (purgedCount > 0) {
      console.log(`Garbage Collector: successfully purged ${purgedCount} obsolete records.`);
    }

    return {
      purgedCount,
      activeCount: this.records.size
    };
  }

  // Complete Memory Backup Snapshotting
  public static async backupMemoryDump(): Promise<string> {
    const backupObj = {
      timestamp: new Date().toISOString(),
      version: 1,
      totalCount: this.records.size,
      records: Array.from(this.records.entries()).map(([id, rec]) => ({
        id,
        partition: rec.partition,
        data: rec.data,
        encrypted: rec.encrypted,
        timestamp: rec.timestamp,
        expiresAt: rec.expiresAt
      }))
    };

    return JSON.stringify(backupObj, null, 2);
  }

  public static async restoreMemoryDump(backupData: string): Promise<void> {
    try {
      const parsed = JSON.parse(backupData);
      if (parsed.version !== 1) {
        throw new Error("Unsupported memory dump version.");
      }

      this.records.clear();
      this.encryptionKeys.clear();

      for (const item of parsed.records) {
        const record: MemoryRecord = {
          id: item.id,
          partition: item.partition,
          data: item.data,
          encrypted: item.encrypted,
          timestamp: item.timestamp,
          expiresAt: item.expiresAt
        };
        this.records.set(item.id, record);
        if (item.encrypted) {
          this.encryptionKeys.add(item.id);
        }
      }

      AuditLogger.log({
        actor: 'SYSTEM',
        action: 'PERSISTENCE_RESTORE',
        resource: `memory_backup_dump`,
        status: 'SUCCESS',
        details: { count: parsed.records.length }
      });
    } catch (e: any) {
      AuditLogger.log({
        actor: 'SYSTEM',
        action: 'PERSISTENCE_RESTORE_FAIL',
        resource: `memory_backup_dump`,
        status: 'FAILURE',
        details: { error: e.message }
      });
      throw e;
    }
  }

  public static getStats() {
    const counts: Record<MemoryRecord['partition'], number> = {
      conversations: 0,
      tasks: 0,
      configurations: 0,
      telemetry: 0,
      audit_logs: 0,
      cache: 0
    };

    let encryptedCount = 0;
    this.records.forEach(rec => {
      counts[rec.partition] = (counts[rec.partition] || 0) + 1;
      if (rec.encrypted) encryptedCount++;
    });

    return {
      totalRecords: this.records.size,
      partitionBreakdown: counts,
      encryptedRecordsCount: encryptedCount,
      garbageCollectionRunning: this.isGCRunning,
      estimatedMemoryUtilizationKB: parseFloat(((JSON.stringify(Array.from(this.records.entries())).length) / 1024).toFixed(2))
    };
  }

  public static clearAll() {
    this.records.clear();
    this.encryptionKeys.clear();
  }
}
