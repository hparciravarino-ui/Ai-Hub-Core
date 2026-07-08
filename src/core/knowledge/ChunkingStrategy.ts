export class ChunkingStrategy {
  public static chunkText(text: string, maxChunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    let currentIndex = 0;
    while (currentIndex < text.length) {
      const chunk = text.substring(currentIndex, currentIndex + maxChunkSize);
      chunks.push(chunk);
      currentIndex += maxChunkSize - overlap;
    }
    return chunks;
  }
}
