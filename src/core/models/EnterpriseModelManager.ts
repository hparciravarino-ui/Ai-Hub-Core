import { eventBus } from '../events/EventBus';
import { AutoConfigurationEngine } from './AutoConfigurationEngine';

export class EnterpriseModelManager {
  private static localCatalog: any[] = [];

  public static initialize(catalog: any[]) {
    this.localCatalog = catalog;
    eventBus.publish('model_manager_initialized', { count: this.localCatalog.length });
  }

  public static getModels() {
    return this.localCatalog;
  }

  public static getModelById(id: string) {
    return this.localCatalog.find(m => m.id === id);
  }

  public static async calculateOptimalConfigForModel(modelId: string, hardwareProfile: any) {
    const model = this.getModelById(modelId);
    if (!model) throw new Error("Model not found");
    
    // Fallback estimates if size is unknown
    const size = model.sizeBytes || 4000000000;
    const quant = model.quantization || 'Q4_K_M';
    
    return AutoConfigurationEngine.calculateOptimalConfig(hardwareProfile, size, quant);
  }
}
