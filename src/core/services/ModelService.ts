export class ModelService {
  public static async installModel(modelData: any) {
    const res = await fetch("/api/models/install", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modelData)
    });
    if (!res.ok) throw new Error("Failed to install model");
    return res.json();
  }

  public static async checkUpdates() {
    const res = await fetch("/api/models/updates");
    if (!res.ok) throw new Error("Failed to check updates");
    return res.json();
  }

  public static async getRankings() {
    const res = await fetch("/api/models/rankings");
    if (!res.ok) throw new Error("Failed to fetch rankings");
    return res.json();
  }
}
