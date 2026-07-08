export class MemoryService {
  private static store: Map<string, any[]> = new Map();

  public static async saveRecord(namespace: string, record: any) {
    if (!this.store.has(namespace)) {
      this.store.set(namespace, []);
    }
    const collection = this.store.get(namespace)!;
    collection.push({ ...record, timestamp: new Date().toISOString() });
  }

  public static async queryRecords(namespace: string, filter?: (record: any) => boolean) {
    if (!this.store.has(namespace)) return [];
    let collection = this.store.get(namespace)!;
    if (filter) {
      collection = collection.filter(filter);
    }
    return collection;
  }
}
