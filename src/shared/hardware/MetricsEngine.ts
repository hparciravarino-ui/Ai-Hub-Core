import si from 'systeminformation';

export class MetricsEngine {
  public static async getLiveMetrics() {
    const [load, mem, temp] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.cpuTemperature()
    ]);
    
    return {
      cpu: load.currentLoad,
      ram: (mem.active / mem.total) * 100,
      vram: 0, // Mocking VRAM for now unless GPU queried
      temp: temp.main || 45,
      tokensPerSec: 0,
      latency: 0,
    };
  }
}
