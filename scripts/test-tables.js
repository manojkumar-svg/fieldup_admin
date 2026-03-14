const { createClient } = require('@supabase/supabase-js');
const { readFileSync } = require('fs');
const { resolve } = require('path');

const envContent = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i === -1) continue;
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
}

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

(async () => {
  await sb.auth.signInWithPassword({ email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD });

  // Check courts columns by selecting *
  const { data: c, error: ce } = await sb.from('courts').select('*').limit(0);
  console.log('courts select all error:', ce ? ce.message : 'OK');
  
  // Try selecting specific columns one at a time
  for (const col of ['id', 'venueId', 'name', 'sportType', 'surfaceType', 'indoor', 'pricePerHour', 'maxPlayers', 'status', 'createdAt', 'updatedAt', 'description', 'address', 'city', 'capacity', 'images', 'state', 'pincode', 'latitude', 'longitude', 'amenities', 'contactPhone', 'contactEmail', 'documents', 'rules', 'openTime', 'closeTime', 'availability', 'availableDays', 'slotDuration', 'bookable', 'featured']) {
    const { error } = await sb.from('courts').select(col).limit(0);
    console.log(`  courts.${col}:`, error ? 'NOT FOUND' : 'EXISTS');
  }

  // Check venues
  const { data: v, error: ve } = await sb.from('venues').select('*').limit(0);
  console.log('\nvenues select all:', ve ? ve.message : 'OK');

  process.exit(0);
})();
