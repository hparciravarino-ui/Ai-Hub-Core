export class HardwareService {
  public static async getHardwareProfile() {
    const isServer = typeof window === "undefined";
    const url = isServer ? "http://127.0.0.1:3000/api/hardware" : "/api/hardware";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch hardware profile");
    return res.json();
  }

  public static async getLiveMetrics() {
    const isServer = typeof window === "undefined";
    const url = isServer ? "http://127.0.0.1:3000/api/hardware/metrics" : "/api/hardware/metrics";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch live metrics");
    return res.json();
  }
}
