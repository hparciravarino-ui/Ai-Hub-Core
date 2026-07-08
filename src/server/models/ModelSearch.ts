export class ModelSearch {
  public static async fetchModels() {
    let models: any[] = [];
    try {
      const hfRes = await fetch("https://huggingface.co/api/models?search=gguf&sort=trendingScore&direction=-1&limit=60");
      if (hfRes.ok) {
        const hfData = await hfRes.json();
        const localModels = hfData.map((m: any) => ({
          id: m.id,
          name: m.id.split("/").pop(),
          type: "local",
          tags: m.tags,
          downloads: m.downloads,
          context_length: m.id.toLowerCase().includes("32k") ? 32000 : 8192,
          description: "Local GGUF model from HuggingFace",
          sizeEstimate: this.estimateSizeFromName(m.id)
        }));
        models.push(...localModels);
      }
    } catch (e) {
      console.warn("Failed to fetch HuggingFace models", e);
    }

    try {
      const orRes = await fetch("https://openrouter.ai/api/v1/models");
      if (orRes.ok) {
        const orData = await orRes.json();
        const apiModels = (orData.data || []).map((m: any) => ({
          id: m.id,
          name: m.name,
          type: "api",
          context_length: m.context_length,
          description: m.description,
          pricing: m.pricing
        }));
        models.push(...apiModels);
      }
    } catch (e) {
      console.warn("Failed to fetch OpenRouter models", e);
    }

    return models;
  }

  private static estimateSizeFromName(name: string): number {
    const lower = name.toLowerCase();
    if (lower.includes("70b") || lower.includes("72b")) return 40;
    if (lower.includes("32b") || lower.includes("34b")) return 20;
    if (lower.includes("14b") || lower.includes("12b")) return 8;
    if (lower.includes("7b") || lower.includes("8b")) return 4.5;
    if (lower.includes("3b") || lower.includes("4b")) return 2.5;
    if (lower.includes("1.5b") || lower.includes("1b") || lower.includes("2b")) return 1.5;
    return 4.5; // Default 7B-ish
  }
}
