import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const DOCUMENT_KEYS = [
  'overview',
  'kpi',
  'budget',
  'timeline',
  'program-n',
  'program-e',
  'program-s',
  'program-t',
  'changelog',
];

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const dataDir = join(process.cwd(), 'public', 'data');
const rows = await Promise.all(
  DOCUMENT_KEYS.map(async (key) => {
    const raw = await readFile(join(dataDir, `${key}.json`), 'utf8');
    return {
      key,
      data: JSON.parse(raw),
      updated_at: new Date().toISOString(),
    };
  }),
);

const { error } = await supabase.from('dashboard_documents').upsert(rows, { onConflict: 'key' });

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(`Seeded ${rows.length} dashboard documents.`);
