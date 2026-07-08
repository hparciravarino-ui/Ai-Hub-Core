import { HardwareService } from '../services/HardwareService';

export class MetricsCollector {
  public static async collectCurrentMetrics() {
    return await HardwareService.getLiveMetrics();
  }
}
