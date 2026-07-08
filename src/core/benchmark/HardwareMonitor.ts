import { HardwareService } from '../services/HardwareService';

export class HardwareMonitor {
  public static async getHardwareProfile() {
    return await HardwareService.getHardwareProfile();
  }
}
