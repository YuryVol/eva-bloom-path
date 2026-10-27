/**
 * Apply EVA practices migration + seed to Supabase
 *
 * Requires Supabase Personal Access Token (not service role key).
 * Get it: https://supabase.com/dashboard/account/tokens
 *
 * Usage:
 *   node scripts/run-migration.mjs <PERSONAL_ACCESS_TOKEN>
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');

const PROJECT_REF = 'kbmdbkterywwipvvqdid';
const PAT = process.argv[2];

if (!PAT) {
  console.error('Usage: node scripts/run-migration.mjs <PERSONAL_ACCESS_TOKEN>');
  console.error('\nGet your PAT: https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

async function runSQL(label, sql) {
  process.stdout.write(`▶ ${label} ... `);
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  if (res.ok) {
    console.log('✓');
    return;
  }
  const body = await res.text();
  console.log(`✗ HTTP ${res.status}`);
  console.error(body);
  process.exit(1);
}

const migration = readFileSync(
  join(root, 'supabase/migrations/20260610000000_practices.sql'),
  'utf8'
);
const seed = readFileSync(join(root, 'supabase/seed-practices.sql'), 'utf8');

console.log('EVA — applying practices migration to Supabase\n');
await runSQL('Create tables + RLS policies', migration);
await runSQL('Seed 24 practices', seed);
console.log('\n✅ Done.');
