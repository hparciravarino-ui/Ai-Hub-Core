import { IVectorDatabase } from './IVectorDatabase';
import { LocalVectorDatabase } from './LocalVectorDatabase';

export class VectorManager {
  private static instance: IVectorDatabase;

  public static getInstance(): IVectorDatabase {
    if (!this.instance) {
      this.instance = new LocalVectorDatabase();
      this.instance.connect();
    }
    return this.instance;
  }

  public static setProvider(provider: IVectorDatabase) {
    this.instance = provider;
    this.instance.connect();
  }
}
