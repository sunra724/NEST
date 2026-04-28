import { filenameToDocumentKey, readDocument } from '@/lib/data-store';

export async function loadJSON<T>(filename: string): Promise<T> {
  const key = filenameToDocumentKey(filename);

  if (typeof window === 'undefined') {
    return readDocument<T>(key);
  }

  const res = await fetch(`/api/data/${key}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load ${filename}`);
  }
  return res.json() as Promise<T>;
}
