import { IVectorDatabase } from './IVectorDatabase';
import { SqliteVectorDatabase } from './SqliteVectorDatabase';

export class VectorManager {
  private static instance: IVectorDatabase;

  public static getInstance(): IVectorDatabase {
    if (!this.instance) {
      this.instance = new SqliteVectorDatabase();
      this.instance.connect();
    }
    return this.instance;
  }

  public static setProvider(provider: IVectorDatabase) {
    this.instance = provider;
    this.instance.connect();
  }
}
