import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const DOCUMENT_KEYS = [
  'overview',
  'kpi',
  'budget',
  'timeline',
  'program-n',
  'program-e',
  'program-s',
  'program-t',
  'operations',
  'changelog',
] as const;

export type DashboardDocumentKey = (typeof DOCUMENT_KEYS)[number];

const DATA_DIR = join(process.cwd(), 'public', 'data');

let supabaseAdmin: SupabaseClient | null = null;

export function filenameToDocumentKey(filename: string): DashboardDocumentKey {
  const key = filename.replace(/\.json$/i, '');
  if (!isDashboardDocumentKey(key)) {
    throw new Error(`Unsupported dashboard document: ${filename}`);
  }
  return key;
}

export function documentKeyToFilename(key: DashboardDocumentKey): string {
  return `${key}.json`;
}

export function isDashboardDocumentKey(key: string): key is DashboardDocumentKey {
  return (DOCUMENT_KEYS as readonly string[]).includes(key);
}

function getSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  supabaseAdmin ??= createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabaseAdmin;
}

async function readLocalDocument<T>(key: DashboardDocumentKey): Promise<T> {
  const raw = await readFile(join(DATA_DIR, documentKeyToFilename(key)), 'utf8');
  return JSON.parse(raw) as T;
}

async function writeLocalDocument(key: DashboardDocumentKey, data: unknown): Promise<void> {
  await writeFile(join(DATA_DIR, documentKeyToFilename(key)), JSON.stringify(data, null, 2), 'utf8');
}

export async function readDocument<T>(key: DashboardDocumentKey): Promise<T> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    return readLocalDocument<T>(key);
  }

  const { data: row, error } = await supabase.from('dashboard_documents').select('data').eq('key', key).maybeSingle();

  if (error) {
    throw new Error(`Failed to load ${key} from Supabase: ${error.message}`);
  }

  if (!row) {
    return readLocalDocument<T>(key);
  }

  return row.data as T;
}

export async function writeDocument(key: DashboardDocumentKey, data: unknown): Promise<void> {
  const supabase = getSupabaseAdminClient();

  if (!supabase) {
    await writeLocalDocument(key, data);
    return;
  }

  const { error } = await supabase.from('dashboard_documents').upsert(
    {
      key,
      data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' },
  );

  if (error) {
    throw new Error(`Failed to save ${key} to Supabase: ${error.message}`);
  }
}
