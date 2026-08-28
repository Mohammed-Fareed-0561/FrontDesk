import { EmbeddingProvider } from "./EmbeddingProvider.js";

export class MockEmbeddingProvider implements EmbeddingProvider {
  readonly name = "mock";
  readonly dimensions = 64;

  async embed(text: string): Promise<number[]> {
    const lower = text.toLowerCase();
    const vec: number[] = new Array(this.dimensions).fill(0);
    if (lower.includes("refund")) vec[0] = 1;
    if (lower.includes("policy")) vec[1] = 1;
    if (lower.includes("shipping")) vec[2] = 1;
    if (lower.includes("product")) vec[3] = 1;
    if (lower.includes("price")) vec[4] = 1;
    if (lower.includes("ignore") || lower.includes("instruction")) vec[5] = 1;
    if (vec.some((v) => v !== 0)) {
      const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
      return vec.map((v) => v / norm);
    }
    const hash = this.hashString(text);
    let seed = hash;
    for (let i = 0; i < this.dimensions; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      vec[i] = (seed / 233280) * 2 - 1;
    }
    const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    return vec.map((v) => v / (norm || 1));
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((t) => this.embed(t)));
  }

  private hashString(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h || 1;
  }
}

export const mockEmbedding = new MockEmbeddingProvider();
