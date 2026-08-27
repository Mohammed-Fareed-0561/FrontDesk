export interface StorageAdapter {
  upload(key: string, buffer: Buffer, mimeType: string): Promise<{ key: string; size: number }>;
  download(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  getPublicUrl(key: string): string;
  getSignedUrl(key: string, expiresInSec?: number): Promise<string>;
}

export function sanitizeFilename(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.\./g, "_");
  return base.slice(0, 100) || "file";
}

export function buildStorageKey(businessId: string, mediaId: string, filename: string): string {
  const safe = sanitizeFilename(filename);
  return `business/${businessId}/media/${mediaId}/${safe}`;
}
