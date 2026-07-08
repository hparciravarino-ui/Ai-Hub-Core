export class HardwareService {
  public static async getHardwareProfile() {
    const res = await fetch("/api/hardware");
    if (!res.ok) throw new Error("Failed to fetch hardware profile");
    return res.json();
  }

  public static async getLiveMetrics() {
    const res = await fetch("/api/hardware/metrics");
    if (!res.ok) throw new Error("Failed to fetch live metrics");
    return res.json();
  }
}
