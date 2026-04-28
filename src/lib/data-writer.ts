import { cookies } from 'next/headers';
import { hasRole, verifyToken } from '@/lib/auth';
import { filenameToDocumentKey, readDocument, writeDocument } from '@/lib/data-store';

interface ChangelogDocument {
  entries: ChangelogEntry[];
}

interface ChangelogEntry {
  action: string;
  target: string;
  summary: string;
  timestamp: string;
}

export async function readJSON<T>(filename: string): Promise<T> {
  return readDocument<T>(filenameToDocumentKey(filename));
}

export async function writeJSON(filename: string, data: unknown): Promise<void> {
  await writeDocument(filenameToDocumentKey(filename), data);
}

export async function appendChangelog(entry: {
  action: string;
  target: string;
  summary: string;
}): Promise<void> {
  const changelog = await readJSON<ChangelogDocument>('changelog.json').catch<ChangelogDocument>(() => ({ entries: [] }));
  changelog.entries.unshift({
    ...entry,
    timestamp: new Date().toISOString(),
  });
  changelog.entries = changelog.entries.slice(0, 200);
  await writeJSON('changelog.json', changelog);
}

export async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return hasRole(payload, 'admin');
}
