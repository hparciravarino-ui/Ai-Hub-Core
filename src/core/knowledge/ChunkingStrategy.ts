export class ChunkingStrategy {
  /**
   * Intelligently chunks text by paragraphs and sentences to preserve semantic context,
   * falling back to fixed-size chunking only when necessary.
   */
  public static chunkText(text: string, maxChunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    
    // Split by paragraphs first
    const paragraphs = text.split(/\n\s*\n/);
    
    let currentChunk = "";
    
    for (const paragraph of paragraphs) {
      if (paragraph.length > maxChunkSize) {
        // If a single paragraph is too large, split by sentences
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph];
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length > maxChunkSize) {
            if (currentChunk.length > 0) {
              chunks.push(currentChunk.trim());
              // Keep overlap from the end of the previous chunk
              currentChunk = currentChunk.substring(Math.max(0, currentChunk.length - overlap)) + " " + sentence;
            } else {
              // Sentence itself is larger than maxChunkSize, fallback to hard split
              let idx = 0;
              while (idx < sentence.length) {
                const sub = sentence.substring(idx, idx + maxChunkSize);
                chunks.push(sub.trim());
                idx += maxChunkSize - overlap;
              }
              currentChunk = "";
            }
          } else {
            currentChunk += (currentChunk.length > 0 ? " " : "") + sentence.trim();
          }
        }
      } else {
        if (currentChunk.length + paragraph.length > maxChunkSize) {
          chunks.push(currentChunk.trim());
          currentChunk = paragraph.trim();
        } else {
          currentChunk += (currentChunk.length > 0 ? "\n\n" : "") + paragraph.trim();
        }
      }
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
}
