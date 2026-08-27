import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { StorageAdapter, buildStorageKey } from "./StorageAdapter.js";

const STORAGE_ROOT = process.env.STORAGE_PATH || path.resolve(process.cwd(), "storage");
const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_change_in_production_32chars_min";

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private root = STORAGE_ROOT) {}

  private fullPath(key: string): string {
    const safeKey = key.replace(/^\//, "").replace(/\.\./g, "");
    return path.join(this.root, safeKey);
  }

  async upload(key: string, buffer: Buffer, _mimeType: string): Promise<{ key: string; size: number }> {
    const full = this.fullPath(key);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, buffer);
    return { key, size: buffer.length };
  }

  async download(key: string): Promise<Buffer | null> {
    try {
      const full = this.fullPath(key);
      return await fs.readFile(full);
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const full = this.fullPath(key);
      await fs.unlink(full);
      try {
        await fs.rmdir(path.dirname(full), { recursive: true } as any);
      } catch {}
      return true;
    } catch {
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.fullPath(key));
      return true;
    } catch {
      return false;
    }
  }

  getPublicUrl(key: string): string {
    return `/api/v1/media/public/${encodeURIComponent(key)}`;
  }

  async getSignedUrl(key: string, expiresInSec = 300): Promise<string> {
    const exp = Math.floor(Date.now() / 1000) + expiresInSec;
    const data = `${key}:${exp}`;
    const sig = crypto.createHmac("sha256", JWT_SECRET).update(data).digest("hex").slice(0, 16);
    return `/api/v1/media/signed/${encodeURIComponent(key)}?exp=${exp}&sig=${sig}`;
  }

  static verifySignedUrl(key: string, exp: string, sig: string): boolean {
    const expNum = parseInt(exp, 10);
    if (!expNum || Date.now() / 1000 > expNum) return false;
    const data = `${key}:${exp}`;
    const expected = crypto.createHmac("sha256", JWT_SECRET).update(data).digest("hex").slice(0, 16);
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  }
}

export const storage = new LocalStorageAdapter();

export { buildStorageKey };
