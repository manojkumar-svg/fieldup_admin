/**
 * Push seed data to Supabase remotely.
 * Authenticates as the admin user, then inserts via the REST API.
 *
 * Usage:  npx tsx scripts/push-seed.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Parse .env.local manually (no dotenv dependency needed)
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
  env[key] = val;
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ADMIN_EMAIL = env.SEED_ADMIN_EMAIL;
const ADMIN_PASSWORD = env.SEED_ADMIN_PASSWORD;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or ANON_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── helpers ──────────────────────────────────────────────────
async function signIn(): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  if (error) {
    console.error('Auth failed:', error.message);
    process.exit(1);
  }
  console.log(`✅ Signed in as ${ADMIN_EMAIL}`);
}

async function upsertRows(table: string, rows: Record<string, unknown>[]): Promise<void> {
  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
  if (error) {
    console.error(`❌ ${table}:`, error.message);
  } else {
    console.log(`✅ ${table}: ${rows.length} rows`);
  }
}

async function upsertRowsComposite(
  table: string,
  rows: Record<string, unknown>[],
  conflictCols: string,
): Promise<void> {
  const { error } = await supabase.from(table).upsert(rows, { onConflict: conflictCols });
  if (error) {
    console.error(`❌ ${table}:`, error.message);
  } else {
    console.log(`✅ ${table}: ${rows.length} rows`);
  }
}

// ── seed data ────────────────────────────────────────────────

const venues = [
  { id: 'a1000000-0000-0000-0000-000000000001', name: 'Green Valley Sports Complex', description: 'Premium multi-sport complex with floodlit fields and modern facilities', address: '123 Sports Complex Road, Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400053', latitude: 19.1364, longitude: 72.8296, amenities: ['Parking', 'Floodlights', 'Changing Rooms', 'Cafeteria', 'WiFi'], contactPhone: '+91-9876543001', contactEmail: 'info@greenvalley.com', status: 'ACTIVE' },
  { id: 'a1000000-0000-0000-0000-000000000002', name: 'Ace Racket Club', description: 'Indoor air-conditioned courts for racket sports lovers', address: '45 Racket Lane, Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560034', latitude: 12.9352, longitude: 77.6245, amenities: ['Indoor', 'AC', 'Pro Shop', 'Coaching', 'Locker Rooms'], contactPhone: '+91-9876543002', contactEmail: 'play@aceracket.in', status: 'ACTIVE' },
  { id: 'a1000000-0000-0000-0000-000000000003', name: 'Goal Zone Arena', description: 'FIFA-standard turf football fields with night play capability', address: '78 Stadium Road, Sector 62', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', latitude: 28.6273, longitude: 77.365, amenities: ['Turf', 'Floodlights', 'Washrooms', 'First Aid', 'Parking'], contactPhone: '+91-9876543003', contactEmail: null, status: 'ACTIVE' },
  { id: 'a1000000-0000-0000-0000-000000000004', name: 'Splash Aqua Center', description: 'Olympic-size swimming pool with professional coaching', address: '10 Marine Drive Extension', city: 'Chennai', state: 'Tamil Nadu', pincode: '600001', latitude: 13.0546, longitude: 80.2707, amenities: ['Olympic Pool', 'Kids Pool', 'Changing Rooms', 'Towel Service'], contactPhone: '+91-9876543004', contactEmail: 'swim@splashaqua.com', status: 'ACTIVE' },
  { id: 'a1000000-0000-0000-0000-000000000005', name: 'PowerPlay Cricket Academy', description: 'State-of-the-art cricket nets and match grounds', address: '200 MG Road, Deccan Gymkhana', city: 'Pune', state: 'Maharashtra', pincode: '411004', latitude: 18.5196, longitude: 73.8553, amenities: ['Nets', 'Bowling Machine', 'Video Analysis', 'Parking', 'Canteen'], contactPhone: '+91-9876543005', contactEmail: 'book@powerplay.in', status: 'ACTIVE' },
  { id: 'a1000000-0000-0000-0000-000000000006', name: 'Slam Dunk Basketball Court', description: 'Professional hardwood basketball courts with bleachers', address: '55 Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033', latitude: 17.4326, longitude: 78.4071, amenities: ['Hardwood Floor', 'Scoreboards', 'Bleachers', 'Water Dispenser'], contactPhone: '+91-9876543006', contactEmail: 'hoop@slamdunk.co', status: 'ACTIVE' },
  { id: 'a1000000-0000-0000-0000-000000000007', name: 'Volley Village', description: 'Beach volleyball and indoor volleyball facility', address: '3 Calangute Beach Road', city: 'Goa', state: 'Goa', pincode: '403516', latitude: 15.5449, longitude: 73.7554, amenities: ['Beach Courts', 'Indoor Courts', 'Showers', 'Lockers', 'Refreshments'], contactPhone: '+91-9876543007', contactEmail: null, status: 'ACTIVE' },
  { id: 'a1000000-0000-0000-0000-000000000008', name: 'The Boxing Ring', description: 'Professional boxing and MMA training facility', address: '88 Park Street', city: 'Kolkata', state: 'West Bengal', pincode: '700016', latitude: 22.5511, longitude: 88.3512, amenities: ['Boxing Ring', 'Punching Bags', 'Weights', 'Sauna', 'Locker Rooms'], contactPhone: '+91-9876543008', contactEmail: 'fight@boxingring.com', status: 'ACTIVE' },
  { id: 'a1000000-0000-0000-0000-000000000009', name: 'Urban Kick Football Hub', description: 'Modern 5-a-side and 7-a-side synthetic turf pitches', address: '12 Whitefield Main Road', city: 'Bangalore', state: 'Karnataka', pincode: '560066', latitude: 12.9698, longitude: 77.75, amenities: ['Synthetic Turf', 'Night Lights', 'Scoreboards', 'Parking', 'Snack Bar'], contactPhone: '+91-9876543009', contactEmail: 'kick@urbankick.in', status: 'ACTIVE' },
  { id: 'a1000000-0000-0000-0000-000000000010', name: 'Heritage Tennis Grounds', description: 'Clay and synthetic courts in a heritage garden setting', address: '1 Civil Lines', city: 'Delhi', state: 'Delhi', pincode: '110054', latitude: 28.6849, longitude: 77.223, amenities: ['Clay Courts', 'Synthetic Courts', 'Club House', 'Restaurant', 'Parking'], contactPhone: '+91-9876543010', contactEmail: 'play@heritagetg.com', status: 'INACTIVE' },
];

const venueSports = [
  { venueId: 'a1000000-0000-0000-0000-000000000001', sportType: 'CRICKET', numberOfCourts: 3, pricePerHour: 1500, openTime: '06:00', closeTime: '22:00', availableDays: ['MON','TUE','WED','THU','FRI','SAT','SUN'], rules: 'White ball only during night sessions', amenities: ['Nets','Bowling Machine'] },
  { venueId: 'a1000000-0000-0000-0000-000000000001', sportType: 'FOOTBALL', numberOfCourts: 2, pricePerHour: 2000, openTime: '06:00', closeTime: '22:00', availableDays: ['MON','TUE','WED','THU','FRI','SAT','SUN'], rules: 'Studs mandatory', amenities: ['Goals','Bibs'] },
  { venueId: 'a1000000-0000-0000-0000-000000000002', sportType: 'TENNIS', numberOfCourts: 4, pricePerHour: 800, openTime: '07:00', closeTime: '21:00', availableDays: ['MON','TUE','WED','THU','FRI','SAT','SUN'], rules: 'Non-marking shoes required', amenities: ['Ball Machine'] },
  { venueId: 'a1000000-0000-0000-0000-000000000002', sportType: 'BADMINTON', numberOfCourts: 6, pricePerHour: 600, openTime: '06:00', closeTime: '22:00', availableDays: ['MON','TUE','WED','THU','FRI','SAT','SUN'], rules: null, amenities: ['Shuttles Available'] },
  { venueId: 'a1000000-0000-0000-0000-000000000002', sportType: 'SQUASH', numberOfCourts: 2, pricePerHour: 700, openTime: '07:00', closeTime: '21:00', availableDays: ['MON','TUE','WED','THU','FRI','SAT'], rules: null, amenities: [] },
  { venueId: 'a1000000-0000-0000-0000-000000000002', sportType: 'TABLE_TENNIS', numberOfCourts: 3, pricePerHour: 400, openTime: '08:00', closeTime: '20:00', availableDays: ['MON','TUE','WED','THU','FRI','SAT','SUN'], rules: null, amenities: [] },
  { venueId: 'a1000000-0000-0000-0000-000000000003', sportType: 'FOOTBALL', numberOfCourts: 4, pricePerHour: 2500, openTime: '05:00', closeTime: '23:00', availableDays: ['MON','TUE','WED','THU','FRI','SAT','SUN'], rules: 'Shin guards mandatory', amenities: ['Jerseys','Footballs'] },
  { venueId: 'a1000000-0000-0000-0000-000000000004', sportType: 'SWIMMING', numberOfCourts: 2, pricePerHour: 500, openTime: '05:30', closeTime: '20:00', availableDays: ['MON','TUE','WED','THU','FRI','SAT','SUN'], rules: 'Cap and goggles mandatory', amenities: ['Kickboards','Pull Buoys'] },
  { venueId: 'a1000000-0000-0000-0000-000000000005', sportType: 'CRICKET', numberOfCourts: 5, pricePerHour: 1200, openTime: '06:00', closeTime: '21:00', availableDays: ['MON','TUE','WED','THU','FRI','SAT','SUN'], rules: 'Helmets compulsory in nets', amenities: ['Practice Nets','Bowling Machine','Video Analysis'] },
  { venueId: 'a1000000-0000-0000-0000-000000000006', sportType: 'BASKETBALL', numberOfCourts: 2, pricePerHour: 1000, openTime: '06:00', closeTime: '22:00', availableDays: ['MON','TUE','WED','THU','FRI','SAT','SUN'], rules: 'Non-marking shoes only', amenities: ['Basketballs','Scoreboard'] },
  { venueId: 'a1000000-0000-0000-0000-000000000007', sportType: 'VOLLEYBALL', numberOfCourts: 2, pricePerHour: 800, openTime: '07:00', closeTime: '19:00', availableDays: ['MON','TUE','WED','THU','FRI','SAT','SUN'], rules: null, amenities: ['Volleyball','Net'] },
  { venueId: 'a1000000-0000-0000-0000-000000000007', sportType: 'BEACH_VOLLEYBALL', numberOfCourts: 3, pricePerHour: 600, openTime: '06:00', closeTime: '18:00', availableDays: ['MON','TUE','WED','THU','FRI','SAT','SUN'], rules: 'Play barefoot', amenities: ['Sunscreen Available'] },
  { venueId: 'a1000000-0000-0000-0000-000000000008', sportType: 'BOXING', numberOfCourts: 1, pricePerHour: 500, openTime: '06:00', closeTime: '21:00', availableDays: ['MON','TUE','WED','THU','FRI','SAT'], rules: 'Wraps and gloves mandatory', amenities: ['Gloves','Wraps','Head Guard'] },
  { venueId: 'a1000000-0000-0000-0000-000000000008', sportType: 'MMA', numberOfCourts: 1, pricePerHour: 700, openTime: '07:00', closeTime: '21:00', availableDays: ['MON','TUE','WED','THU','FRI','SAT'], rules: 'Mouthguard required', amenities: ['Shin Guards','MMA Gloves'] },
  { venueId: 'a1000000-0000-0000-0000-000000000009', sportType: 'FOOTBALL', numberOfCourts: 3, pricePerHour: 1800, openTime: '06:00', closeTime: '23:00', availableDays: ['MON','TUE','WED','THU','FRI','SAT','SUN'], rules: 'No metal studs allowed', amenities: ['Bibs','Footballs'] },
  { venueId: 'a1000000-0000-0000-0000-000000000010', sportType: 'TENNIS', numberOfCourts: 6, pricePerHour: 1000, openTime: '06:00', closeTime: '20:00', availableDays: ['MON','TUE','WED','THU','FRI','SAT','SUN'], rules: 'Whites preferred', amenities: ['Ball Machine','Ball Picker'] },
];

const courts = [
  { id: 'c1000000-0000-0000-0000-000000000001', venueId: 'a1000000-0000-0000-0000-000000000001', name: 'Cricket Net 1', description: 'Outdoor cricket practice net', address: '123 Sports Complex Road, Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400053', latitude: 19.1364, longitude: 72.8296, sportType: 'CRICKET', surfaceType: 'TURF', indoor: false, pricePerHour: 1500, maxPlayers: 6, capacity: 6, amenities: ['Nets','Bowling Machine'], openTime: '06:00', closeTime: '22:00', status: 'ACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000002', venueId: 'a1000000-0000-0000-0000-000000000001', name: 'Cricket Net 2', description: 'Outdoor cricket practice net', address: '123 Sports Complex Road, Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400053', latitude: 19.1364, longitude: 72.8296, sportType: 'CRICKET', surfaceType: 'TURF', indoor: false, pricePerHour: 1500, maxPlayers: 6, capacity: 6, amenities: ['Nets'], openTime: '06:00', closeTime: '22:00', status: 'ACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000003', venueId: 'a1000000-0000-0000-0000-000000000001', name: 'Cricket Net 3 (Indoor)', description: 'Indoor cricket practice net with synthetic surface', address: '123 Sports Complex Road, Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400053', latitude: 19.1364, longitude: 72.8296, sportType: 'CRICKET', surfaceType: 'SYNTHETIC', indoor: true, pricePerHour: 1800, maxPlayers: 6, capacity: 6, amenities: ['Nets','AC'], openTime: '06:00', closeTime: '22:00', status: 'ACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000004', venueId: 'a1000000-0000-0000-0000-000000000001', name: 'Football Pitch A', description: 'Full-size turf football pitch with floodlights', address: '123 Sports Complex Road, Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400053', latitude: 19.1364, longitude: 72.8296, sportType: 'FOOTBALL', surfaceType: 'TURF', indoor: false, pricePerHour: 2000, maxPlayers: 14, capacity: 14, amenities: ['Goals','Bibs','Floodlights'], openTime: '06:00', closeTime: '22:00', status: 'ACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000005', venueId: 'a1000000-0000-0000-0000-000000000001', name: 'Football Pitch B', description: 'Synthetic turf football pitch', address: '123 Sports Complex Road, Andheri West', city: 'Mumbai', state: 'Maharashtra', pincode: '400053', latitude: 19.1364, longitude: 72.8296, sportType: 'FOOTBALL', surfaceType: 'SYNTHETIC', indoor: false, pricePerHour: 2500, maxPlayers: 14, capacity: 14, amenities: ['Goals','Bibs'], openTime: '06:00', closeTime: '22:00', status: 'ACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000006', venueId: 'a1000000-0000-0000-0000-000000000002', name: 'Tennis Court 1', description: 'Outdoor clay tennis court', address: '45 Racket Lane, Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560034', latitude: 12.9352, longitude: 77.6245, sportType: 'TENNIS', surfaceType: 'CLAY', indoor: false, pricePerHour: 800, maxPlayers: 4, capacity: 4, amenities: ['Ball Machine'], openTime: '07:00', closeTime: '21:00', status: 'ACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000007', venueId: 'a1000000-0000-0000-0000-000000000002', name: 'Tennis Court 2', description: 'Indoor synthetic tennis court', address: '45 Racket Lane, Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560034', latitude: 12.9352, longitude: 77.6245, sportType: 'TENNIS', surfaceType: 'SYNTHETIC', indoor: true, pricePerHour: 1000, maxPlayers: 4, capacity: 4, amenities: ['AC','Ball Machine'], openTime: '07:00', closeTime: '21:00', status: 'ACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000008', venueId: 'a1000000-0000-0000-0000-000000000002', name: 'Badminton Court 1', description: 'Indoor wooden floor badminton court', address: '45 Racket Lane, Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560034', latitude: 12.9352, longitude: 77.6245, sportType: 'BADMINTON', surfaceType: 'WOODEN', indoor: true, pricePerHour: 600, maxPlayers: 4, capacity: 4, amenities: ['Shuttles Available'], openTime: '06:00', closeTime: '22:00', status: 'ACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000009', venueId: 'a1000000-0000-0000-0000-000000000002', name: 'Badminton Court 2', description: 'Indoor wooden floor badminton court', address: '45 Racket Lane, Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560034', latitude: 12.9352, longitude: 77.6245, sportType: 'BADMINTON', surfaceType: 'WOODEN', indoor: true, pricePerHour: 600, maxPlayers: 4, capacity: 4, amenities: ['Shuttles Available'], openTime: '06:00', closeTime: '22:00', status: 'ACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000010', venueId: 'a1000000-0000-0000-0000-000000000002', name: 'Squash Court 1', description: 'Indoor squash court with wooden flooring', address: '45 Racket Lane, Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560034', latitude: 12.9352, longitude: 77.6245, sportType: 'SQUASH', surfaceType: 'WOODEN', indoor: true, pricePerHour: 700, maxPlayers: 2, capacity: 2, amenities: [], openTime: '07:00', closeTime: '21:00', status: 'ACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000011', venueId: 'a1000000-0000-0000-0000-000000000002', name: 'Table Tennis Room', description: 'Indoor table tennis room with 3 tables', address: '45 Racket Lane, Koramangala', city: 'Bangalore', state: 'Karnataka', pincode: '560034', latitude: 12.9352, longitude: 77.6245, sportType: 'TABLE_TENNIS', surfaceType: 'WOODEN', indoor: true, pricePerHour: 400, maxPlayers: 4, capacity: 4, amenities: [], openTime: '08:00', closeTime: '20:00', status: 'ACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000012', venueId: 'a1000000-0000-0000-0000-000000000003', name: '5-a-side Pitch 1', description: 'Synthetic 5-a-side football pitch', address: '78 Stadium Road, Sector 62', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', latitude: 28.6273, longitude: 77.365, sportType: 'FOOTBALL', surfaceType: 'SYNTHETIC', indoor: false, pricePerHour: 2000, maxPlayers: 10, capacity: 10, amenities: ['Jerseys','Footballs'], openTime: '05:00', closeTime: '23:00', status: 'ACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000013', venueId: 'a1000000-0000-0000-0000-000000000003', name: '5-a-side Pitch 2', description: 'Synthetic 5-a-side football pitch', address: '78 Stadium Road, Sector 62', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', latitude: 28.6273, longitude: 77.365, sportType: 'FOOTBALL', surfaceType: 'SYNTHETIC', indoor: false, pricePerHour: 2000, maxPlayers: 10, capacity: 10, amenities: ['Jerseys','Footballs'], openTime: '05:00', closeTime: '23:00', status: 'ACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000014', venueId: 'a1000000-0000-0000-0000-000000000003', name: '7-a-side Pitch', description: 'Full turf 7-a-side football pitch', address: '78 Stadium Road, Sector 62', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', latitude: 28.6273, longitude: 77.365, sportType: 'FOOTBALL', surfaceType: 'TURF', indoor: false, pricePerHour: 3000, maxPlayers: 14, capacity: 14, amenities: ['Goals','Bibs'], openTime: '05:00', closeTime: '23:00', status: 'ACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000015', venueId: 'a1000000-0000-0000-0000-000000000003', name: '11-a-side Field', description: 'Full-size turf football field (under maintenance)', address: '78 Stadium Road, Sector 62', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', latitude: 28.6273, longitude: 77.365, sportType: 'FOOTBALL', surfaceType: 'TURF', indoor: false, pricePerHour: 5000, maxPlayers: 22, capacity: 22, amenities: ['Goals'], openTime: '05:00', closeTime: '23:00', status: 'INACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000016', venueId: 'a1000000-0000-0000-0000-000000000006', name: 'Full Court 1', description: 'Indoor hardwood basketball full court', address: '55 Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033', latitude: 17.4326, longitude: 78.4071, sportType: 'BASKETBALL', surfaceType: 'WOODEN', indoor: true, pricePerHour: 1000, maxPlayers: 10, capacity: 10, amenities: ['Basketballs','Scoreboard'], openTime: '06:00', closeTime: '22:00', status: 'ACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000017', venueId: 'a1000000-0000-0000-0000-000000000006', name: 'Half Court (Practice)', description: 'Outdoor concrete half basketball court', address: '55 Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033', latitude: 17.4326, longitude: 78.4071, sportType: 'BASKETBALL', surfaceType: 'CONCRETE', indoor: false, pricePerHour: 500, maxPlayers: 6, capacity: 6, amenities: ['Basketballs'], openTime: '06:00', closeTime: '22:00', status: 'ACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000018', venueId: 'a1000000-0000-0000-0000-000000000009', name: 'Turf A', description: 'Synthetic turf football pitch', address: '12 Whitefield Main Road', city: 'Bangalore', state: 'Karnataka', pincode: '560066', latitude: 12.9698, longitude: 77.75, sportType: 'FOOTBALL', surfaceType: 'SYNTHETIC', indoor: false, pricePerHour: 1800, maxPlayers: 10, capacity: 10, amenities: ['Bibs','Footballs'], openTime: '06:00', closeTime: '23:00', status: 'ACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000019', venueId: 'a1000000-0000-0000-0000-000000000009', name: 'Turf B', description: 'Synthetic turf football pitch', address: '12 Whitefield Main Road', city: 'Bangalore', state: 'Karnataka', pincode: '560066', latitude: 12.9698, longitude: 77.75, sportType: 'FOOTBALL', surfaceType: 'SYNTHETIC', indoor: false, pricePerHour: 1800, maxPlayers: 10, capacity: 10, amenities: ['Bibs','Footballs'], openTime: '06:00', closeTime: '23:00', status: 'ACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000020', venueId: 'a1000000-0000-0000-0000-000000000009', name: 'Turf C (Premium)', description: 'Indoor premium synthetic turf pitch', address: '12 Whitefield Main Road', city: 'Bangalore', state: 'Karnataka', pincode: '560066', latitude: 12.9698, longitude: 77.75, sportType: 'FOOTBALL', surfaceType: 'SYNTHETIC', indoor: true, pricePerHour: 2500, maxPlayers: 14, capacity: 14, amenities: ['AC','Bibs','Footballs','Night Lights'], openTime: '06:00', closeTime: '23:00', status: 'ACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000021', venueId: 'a1000000-0000-0000-0000-000000000010', name: 'Clay Court 1', description: 'Heritage clay tennis court (under renovation)', address: '1 Civil Lines', city: 'Delhi', state: 'Delhi', pincode: '110054', latitude: 28.6849, longitude: 77.223, sportType: 'TENNIS', surfaceType: 'CLAY', indoor: false, pricePerHour: 1000, maxPlayers: 4, capacity: 4, amenities: ['Ball Machine'], openTime: '06:00', closeTime: '20:00', status: 'INACTIVE' },
  { id: 'c1000000-0000-0000-0000-000000000022', venueId: 'a1000000-0000-0000-0000-000000000010', name: 'Clay Court 2', description: 'Heritage clay tennis court (under renovation)', address: '1 Civil Lines', city: 'Delhi', state: 'Delhi', pincode: '110054', latitude: 28.6849, longitude: 77.223, sportType: 'TENNIS', surfaceType: 'CLAY', indoor: false, pricePerHour: 1000, maxPlayers: 4, capacity: 4, amenities: ['Ball Picker'], openTime: '06:00', closeTime: '20:00', status: 'INACTIVE' },
];

const academies = [
  { id: 'b1000000-0000-0000-0000-000000000001', name: 'Champions Sports Academy', description: 'Multi-sport academy producing national-level athletes since 2010', sportsOffered: ['CRICKET','FOOTBALL'], address: '100 Academy Boulevard, Shivaji Nagar', city: 'Mumbai', state: 'Maharashtra', pincode: '400002', latitude: 19.0178, longitude: 72.8478, contactPhone: '+91-9876543020', contactEmail: 'info@champions-academy.com', website: 'https://champions-academy.com', establishedYear: 2010, status: 'ACTIVE' },
  { id: 'b1000000-0000-0000-0000-000000000002', name: 'Elite Shuttlers Academy', description: 'Specialised badminton training by former national players', sportsOffered: ['BADMINTON'], address: '22 Shuttle Street, Madhapur', city: 'Hyderabad', state: 'Telangana', pincode: '500081', latitude: 17.4483, longitude: 78.3915, contactPhone: '+91-9876543021', contactEmail: 'play@eliteshuttlers.in', website: null, establishedYear: 2016, status: 'ACTIVE' },
  { id: 'b1000000-0000-0000-0000-000000000003', name: 'Strikers Football School', description: 'Grassroots to elite football programme for ages 5-18', sportsOffered: ['FOOTBALL'], address: '15 HSR Layout', city: 'Bangalore', state: 'Karnataka', pincode: '560102', latitude: 12.9116, longitude: 77.6474, contactPhone: '+91-9876543022', contactEmail: 'join@strikers.co.in', website: 'https://strikers.co.in', establishedYear: 2014, status: 'ACTIVE' },
  { id: 'b1000000-0000-0000-0000-000000000004', name: 'ProServe Tennis School', description: 'Tennis coaching from beginner to tournament level', sportsOffered: ['TENNIS'], address: '8 Race Course Road', city: 'Delhi', state: 'Delhi', pincode: '110003', latitude: 28.6112, longitude: 77.2134, contactPhone: '+91-9876543023', contactEmail: 'admissions@proserve.in', website: 'https://proserve.in', establishedYear: 2008, status: 'ACTIVE' },
  { id: 'b1000000-0000-0000-0000-000000000005', name: 'SwimFast Aquatics Academy', description: 'Competitive swimming and water polo training centre', sportsOffered: ['SWIMMING'], address: '5 Beach Road', city: 'Chennai', state: 'Tamil Nadu', pincode: '600004', latitude: 13.0538, longitude: 80.2821, contactPhone: '+91-9876543024', contactEmail: 'swim@swimfast.in', website: null, establishedYear: 2018, status: 'ACTIVE' },
  { id: 'b1000000-0000-0000-0000-000000000006', name: 'KO Combat Academy', description: 'Boxing, MMA and kickboxing for fitness and competition', sportsOffered: ['BOXING','MMA'], address: '42 Salt Lake', city: 'Kolkata', state: 'West Bengal', pincode: '700091', latitude: 22.5803, longitude: 88.4155, contactPhone: '+91-9876543025', contactEmail: null, website: null, establishedYear: 2019, status: 'ACTIVE' },
  { id: 'b1000000-0000-0000-0000-000000000007', name: 'Cricket Legends Academy', description: 'Producing district and state cricketers with world-class coaching', sportsOffered: ['CRICKET'], address: '33 Camp Area', city: 'Pune', state: 'Maharashtra', pincode: '411001', latitude: 18.513, longitude: 73.8765, contactPhone: '+91-9876543026', contactEmail: 'info@cricketlegends.in', website: 'https://cricketlegends.in', establishedYear: 2012, status: 'ACTIVE' },
  { id: 'b1000000-0000-0000-0000-000000000008', name: 'Hoop Dreams Basketball Club', description: 'Basketball training for all ages and skill levels', sportsOffered: ['BASKETBALL'], address: '7 Banjara Hills Road No 3', city: 'Hyderabad', state: 'Telangana', pincode: '500034', latitude: 17.4156, longitude: 78.4347, contactPhone: '+91-9876543027', contactEmail: 'dribble@hoopdreams.in', website: null, establishedYear: 2020, status: 'INACTIVE' },
];

const trainers = [
  { id: 'd1000000-0000-0000-0000-000000000001', name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '+91-9876543030', sportSpecialization: 'CRICKET', experience: 12, certifications: ['BCCI Level 3','NCA Certified'], hourlyRate: 1200, bio: 'Former Ranji Trophy player with 12 years coaching experience. Specialises in batting technique.', city: 'Mumbai', state: 'Maharashtra', status: 'ACTIVE' },
  { id: 'd1000000-0000-0000-0000-000000000002', name: 'Priya Nair', email: 'priya.nair@example.com', phone: '+91-9876543031', sportSpecialization: 'TENNIS', experience: 9, certifications: ['ITF Level 2','PTR Professional'], hourlyRate: 1500, bio: 'Former WTA ranked player. Focuses on competitive match preparation.', city: 'Delhi', state: 'Delhi', status: 'ACTIVE' },
  { id: 'd1000000-0000-0000-0000-000000000003', name: 'Ahmed Khan', email: null, phone: '+91-9876543032', sportSpecialization: 'FOOTBALL', experience: 15, certifications: ['AFC B License','AIFF D License'], hourlyRate: 1000, bio: 'Youth development specialist with 15 years in grassroots football.', city: 'Bangalore', state: 'Karnataka', status: 'ACTIVE' },
  { id: 'd1000000-0000-0000-0000-000000000004', name: 'Sneha Reddy', email: 'sneha.r@example.com', phone: '+91-9876543033', sportSpecialization: 'BADMINTON', experience: 7, certifications: ['BAI Certified Coach'], hourlyRate: 900, bio: 'State-level player turned coach. Expert in doubles strategy.', city: 'Hyderabad', state: 'Telangana', status: 'ACTIVE' },
  { id: 'd1000000-0000-0000-0000-000000000005', name: 'Vikram Singh', email: 'vikram.s@example.com', phone: '+91-9876543034', sportSpecialization: 'BOXING', experience: 20, certifications: ['AIBA 2-Star Coach','SAI Level 2'], hourlyRate: 800, bio: 'Commonwealth Games bronze medallist. Training champions since 2005.', city: 'Kolkata', state: 'West Bengal', status: 'ACTIVE' },
  { id: 'd1000000-0000-0000-0000-000000000006', name: 'Meera Iyer', email: 'meera.i@example.com', phone: '+91-9876543035', sportSpecialization: 'SWIMMING', experience: 11, certifications: ['ASCA Level 3','WSF Certified'], hourlyRate: 1100, bio: 'Open water swimming specialist with international coaching experience.', city: 'Chennai', state: 'Tamil Nadu', status: 'ACTIVE' },
  { id: 'd1000000-0000-0000-0000-000000000007', name: 'Arjun Deshmukh', email: null, phone: '+91-9876543036', sportSpecialization: 'CRICKET', experience: 8, certifications: ['BCCI Level 2','NCA Fast Bowling'], hourlyRate: 1000, bio: 'Fast bowling specialist. Coached 3 IPL net bowlers.', city: 'Pune', state: 'Maharashtra', status: 'ACTIVE' },
  { id: 'd1000000-0000-0000-0000-000000000008', name: 'Fatima Shaikh', email: 'fatima.s@example.com', phone: '+91-9876543037', sportSpecialization: 'BASKETBALL', experience: 6, certifications: ['FIBA Level 1','NBA Academy Graduate'], hourlyRate: 950, bio: 'Former Indian Women Basketball League player.', city: 'Hyderabad', state: 'Telangana', status: 'ACTIVE' },
  { id: 'd1000000-0000-0000-0000-000000000009', name: 'Ravi Kumar', email: 'ravi.k@example.com', phone: '+91-9876543038', sportSpecialization: 'FOOTBALL', experience: 10, certifications: ['AFC C License'], hourlyRate: 850, bio: 'Goalkeeping coach with I-League experience.', city: 'Noida', state: 'Uttar Pradesh', status: 'ACTIVE' },
  { id: 'd1000000-0000-0000-0000-000000000010', name: 'Ananya Pillai', email: 'ananya.p@example.com', phone: '+91-9876543039', sportSpecialization: 'TENNIS', experience: 5, certifications: ['ITF Level 1'], hourlyRate: 700, bio: 'Junior tennis development coach. Specialises in kids aged 6-14.', city: 'Bangalore', state: 'Karnataka', status: 'ACTIVE' },
  { id: 'd1000000-0000-0000-0000-000000000011', name: 'Deepak Chauhan', email: null, phone: '+91-9876543040', sportSpecialization: 'MMA', experience: 14, certifications: ['BJJ Purple Belt','Muay Thai Kru'], hourlyRate: 1300, bio: 'Professional MMA fighter with coaching certifications in BJJ and Muay Thai.', city: 'Kolkata', state: 'West Bengal', status: 'ACTIVE' },
  { id: 'd1000000-0000-0000-0000-000000000012', name: 'Kavitha Sundaram', email: 'kavitha.s@example.com', phone: '+91-9876543041', sportSpecialization: 'VOLLEYBALL', experience: 9, certifications: ['FIVB Level 2'], hourlyRate: 750, bio: 'Former Indian volleyball team member. Beach volleyball specialist.', city: 'Goa', state: 'Goa', status: 'ACTIVE' },
  { id: 'd1000000-0000-0000-0000-000000000013', name: 'Suresh Menon', email: 'suresh.m@example.com', phone: '+91-9876543042', sportSpecialization: 'SQUASH', experience: 11, certifications: ['WSF Level 2','SRFI Certified'], hourlyRate: 950, bio: 'National squash champion 2015. Coaching competitive players.', city: 'Mumbai', state: 'Maharashtra', status: 'ACTIVE' },
  { id: 'd1000000-0000-0000-0000-000000000014', name: 'Pooja Verma', email: null, phone: '+91-9876543043', sportSpecialization: 'BADMINTON', experience: 4, certifications: ['BAI Level 1'], hourlyRate: 600, bio: 'Former university badminton captain. Great with beginners.', city: 'Delhi', state: 'Delhi', status: 'INACTIVE' },
  { id: 'd1000000-0000-0000-0000-000000000015', name: 'Rajesh Tiwari', email: 'rajesh.t@example.com', phone: '+91-9876543044', sportSpecialization: 'CRICKET', experience: 18, certifications: ['BCCI Level 3','ECB Level 3','NCA Spin Bowling'], hourlyRate: 2000, bio: 'Spin bowling guru. Coached IPL franchise academies. 18 years international experience.', city: 'Mumbai', state: 'Maharashtra', status: 'ACTIVE' },
];

const academyTrainers = [
  { academyId: 'b1000000-0000-0000-0000-000000000001', trainerId: 'd1000000-0000-0000-0000-000000000001' },
  { academyId: 'b1000000-0000-0000-0000-000000000001', trainerId: 'd1000000-0000-0000-0000-000000000003' },
  { academyId: 'b1000000-0000-0000-0000-000000000001', trainerId: 'd1000000-0000-0000-0000-000000000015' },
  { academyId: 'b1000000-0000-0000-0000-000000000002', trainerId: 'd1000000-0000-0000-0000-000000000004' },
  { academyId: 'b1000000-0000-0000-0000-000000000003', trainerId: 'd1000000-0000-0000-0000-000000000003' },
  { academyId: 'b1000000-0000-0000-0000-000000000003', trainerId: 'd1000000-0000-0000-0000-000000000009' },
  { academyId: 'b1000000-0000-0000-0000-000000000004', trainerId: 'd1000000-0000-0000-0000-000000000002' },
  { academyId: 'b1000000-0000-0000-0000-000000000004', trainerId: 'd1000000-0000-0000-0000-000000000010' },
  { academyId: 'b1000000-0000-0000-0000-000000000005', trainerId: 'd1000000-0000-0000-0000-000000000006' },
  { academyId: 'b1000000-0000-0000-0000-000000000006', trainerId: 'd1000000-0000-0000-0000-000000000005' },
  { academyId: 'b1000000-0000-0000-0000-000000000006', trainerId: 'd1000000-0000-0000-0000-000000000011' },
  { academyId: 'b1000000-0000-0000-0000-000000000007', trainerId: 'd1000000-0000-0000-0000-000000000007' },
  { academyId: 'b1000000-0000-0000-0000-000000000007', trainerId: 'd1000000-0000-0000-0000-000000000015' },
  { academyId: 'b1000000-0000-0000-0000-000000000008', trainerId: 'd1000000-0000-0000-0000-000000000008' },
];

const onboardingApplications = [
  { id: 'e1000000-0000-0000-0000-000000000001', status: 'PENDING', partnerType: 'VENUE', businessName: 'Sunrise Sports Hub', contactPerson: 'Manish Goel', phone: '+91-9876543050', email: 'manish@sunrise.com', city: 'Jaipur', fullAddress: '45 MI Road, Jaipur', googleMapsLink: null, sportsOffered: ['CRICKET','FOOTBALL'], experienceYears: null, shortBio: null, numberOfCourts: 4, surfaceType: 'SYNTHETIC', facilities: ['Parking','Floodlights','Washrooms'], sessionTypes: [], maxStudents: null, availableDays: ['MON','TUE','WED','THU','FRI','SAT','SUN'], operatingHours: '6 AM - 10 PM', slotDuration: 'SIXTY_MINS', pricePerSlot: 1500, weekendPricingDiff: true, cancellationAllowed: true, acceptsCash: true, bankAccountName: 'Manish Goel', termsAccepted: true },
  { id: 'e1000000-0000-0000-0000-000000000002', status: 'PENDING', partnerType: 'COACH', businessName: 'Coach Arjun Fitness', contactPerson: 'Arjun Malhotra', phone: '+91-9876543051', email: 'arjun@fitness.com', city: 'Chandigarh', fullAddress: '12 Sector 17, Chandigarh', googleMapsLink: null, sportsOffered: ['BOXING','MMA'], experienceYears: 8, shortBio: 'Professional boxer turned fitness coach with 8 years experience', numberOfCourts: null, surfaceType: null, facilities: [], sessionTypes: ['Personal','Group','Online'], maxStudents: 15, availableDays: ['MON','TUE','WED','THU','FRI','SAT'], operatingHours: '7 AM - 9 PM', slotDuration: 'SIXTY_MINS', pricePerSlot: 800, weekendPricingDiff: false, cancellationAllowed: true, acceptsCash: false, bankAccountName: 'Arjun Malhotra', termsAccepted: true },
  { id: 'e1000000-0000-0000-0000-000000000003', status: 'UNDER_REVIEW', partnerType: 'VENUE', businessName: 'Peak Performance Arena', contactPerson: 'Sanjay Kapoor', phone: '+91-9876543052', email: 'sanjay@peak.com', city: 'Ahmedabad', fullAddress: '88 SG Highway, Ahmedabad', googleMapsLink: 'https://maps.google.com/?q=peak+arena', sportsOffered: ['BASKETBALL','VOLLEYBALL'], experienceYears: null, shortBio: null, numberOfCourts: 3, surfaceType: 'WOODEN', facilities: ['Indoor','AC','Scoreboard'], sessionTypes: [], maxStudents: null, availableDays: ['MON','TUE','WED','THU','FRI','SAT','SUN'], operatingHours: '8 AM - 10 PM', slotDuration: 'SIXTY_MINS', pricePerSlot: 1200, weekendPricingDiff: true, cancellationAllowed: false, acceptsCash: true, bankAccountName: 'Peak Performance LLP', termsAccepted: true },
  { id: 'e1000000-0000-0000-0000-000000000004', status: 'UNDER_REVIEW', partnerType: 'ACADEMY', businessName: 'NextGen Cricket Academy', contactPerson: 'Ramesh Patil', phone: '+91-9876543053', email: 'ramesh@nextgen.com', city: 'Nagpur', fullAddress: '5 Civil Lines, Nagpur', googleMapsLink: null, sportsOffered: ['CRICKET'], experienceYears: 15, shortBio: 'Running cricket academy for 15 years with 200+ students', numberOfCourts: 6, surfaceType: 'TURF', facilities: ['Nets','Bowling Machine','Match Ground'], sessionTypes: ['Group','Personal','Camp'], maxStudents: 50, availableDays: ['MON','TUE','WED','THU','FRI','SAT','SUN'], operatingHours: '6 AM - 8 PM', slotDuration: 'NINETY_MINS', pricePerSlot: 500, weekendPricingDiff: false, cancellationAllowed: true, acceptsCash: true, bankAccountName: 'NextGen Cricket Academy', termsAccepted: true },
  { id: 'e1000000-0000-0000-0000-000000000005', status: 'APPROVED', partnerType: 'VENUE', businessName: 'Metro Sports Complex', contactPerson: 'Anita Desai', phone: '+91-9876543054', email: 'anita@metrosports.com', city: 'Lucknow', fullAddress: '100 Gomti Nagar, Lucknow', googleMapsLink: null, sportsOffered: ['TENNIS','BADMINTON','TABLE_TENNIS'], experienceYears: null, shortBio: null, numberOfCourts: 8, surfaceType: 'SYNTHETIC', facilities: ['Indoor','AC','Pro Shop','Cafeteria'], sessionTypes: [], maxStudents: null, availableDays: ['MON','TUE','WED','THU','FRI','SAT','SUN'], operatingHours: '7 AM - 10 PM', slotDuration: 'SIXTY_MINS', pricePerSlot: 700, weekendPricingDiff: true, cancellationAllowed: true, acceptsCash: true, bankAccountName: 'Metro Sports Pvt Ltd', termsAccepted: true, reviewedBy: 'System Admin', notes: 'Verified facility in person. Excellent infrastructure.' },
  { id: 'e1000000-0000-0000-0000-000000000006', status: 'REJECTED', partnerType: 'COACH', businessName: 'Fitness with Neha', contactPerson: 'Neha Singh', phone: '+91-9876543055', email: 'neha@fitness.com', city: 'Indore', fullAddress: '23 Vijay Nagar, Indore', googleMapsLink: null, sportsOffered: ['SWIMMING'], experienceYears: 2, shortBio: 'Recently certified swimming instructor', numberOfCourts: null, surfaceType: null, facilities: [], sessionTypes: ['Personal'], maxStudents: 5, availableDays: ['SAT','SUN'], operatingHours: '8 AM - 12 PM', slotDuration: 'THIRTY_MINS', pricePerSlot: 300, weekendPricingDiff: false, cancellationAllowed: false, acceptsCash: false, bankAccountName: null, termsAccepted: true, reviewedBy: 'System Admin', rejectionReason: 'Insufficient experience. Minimum 3 years required for coaching applications.' },
];

// ── main ─────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('\n🌱 Pushing seed data to Supabase...\n');

  await signIn();
  console.log('');

  // Order matters — foreign keys
  await upsertRows('venues', venues);
  await upsertRowsComposite('venue_sports', venueSports, 'venueId,sportType');
  await upsertRows('courts', courts);
  await upsertRows('academies', academies);
  await upsertRows('trainers', trainers);
  await upsertRowsComposite('academy_trainers', academyTrainers, 'academyId,trainerId');
  await upsertRows('onboarding_applications', onboardingApplications);

  console.log('\n🎉 Seed data pushed successfully!\n');
  console.log('Summary:');
  console.log(`  • ${venues.length} Venues`);
  console.log(`  • ${venueSports.length} Venue-Sport links`);
  console.log(`  • ${courts.length} Courts`);
  console.log(`  • ${academies.length} Academies`);
  console.log(`  • ${trainers.length} Trainers`);
  console.log(`  • ${academyTrainers.length} Academy-Trainer links`);
  console.log(`  • ${onboardingApplications.length} Onboarding Applications`);

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
