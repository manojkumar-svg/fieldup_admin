/**
 * Seed script for Supabase
 *
 * Since Supabase handles auth users via its Auth system,
 * admin users should be created through the Supabase Dashboard
 * or via the Supabase CLI:
 *
 *   1. Create a user in Supabase Auth (Dashboard > Authentication > Users)
 *   2. Insert a matching row in the `users` table with the appropriate role
 *
 * For seed data, use the Supabase SQL Editor or run this script
 * with the required env vars set.
 *
 * This file is kept for reference and documentation.
 */

// Sample SQL to seed the database (run in Supabase SQL Editor):
/*
INSERT INTO courts (id, name, "sportType", description, address, city, state, pincode, capacity, "pricePerHour", amenities, "openTime", "closeTime", status, "contactPhone", images, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Green Valley Cricket Ground', 'CRICKET', 'Premium cricket ground with floodlights', '123 Sports Complex Road', 'Mumbai', 'Maharashtra', '400001', 22, 1500, ARRAY['Floodlights', 'Changing Room', 'Parking'], '06:00', '22:00', 'ACTIVE', '+91-9876543210', ARRAY[]::text[], now(), now()),
  (gen_random_uuid(), 'Ace Tennis Courts', 'TENNIS', 'Indoor and outdoor tennis courts', '45 Racket Lane', 'Delhi', 'Delhi', '110001', 4, 800, ARRAY['Indoor', 'Coaching', 'Pro Shop'], '07:00', '21:00', 'ACTIVE', '+91-9876543211', ARRAY[]::text[], now(), now()),
  (gen_random_uuid(), 'Goal Zone Football Field', 'FOOTBALL', 'FIFA standard turf field', '78 Stadium Road', 'Bangalore', 'Karnataka', '560001', 22, 2000, ARRAY['Turf', 'Floodlights', 'Washroom'], '05:00', '23:00', 'ACTIVE', '+91-9876543212', ARRAY[]::text[], now(), now());

INSERT INTO academies (id, name, description, "sportsOffered", address, city, state, pincode, "contactPhone", "contactEmail", "establishedYear", status, images, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Champions Sports Academy', 'Multi-sport academy with world-class coaching', ARRAY['CRICKET', 'FOOTBALL', 'TENNIS']::"SportType"[], '100 Academy Boulevard', 'Mumbai', 'Maharashtra', '400002', '+91-9876543220', 'info@champions.com', 2015, 'ACTIVE', ARRAY[]::text[], now(), now()),
  (gen_random_uuid(), 'Elite Badminton School', 'Specialized badminton training center', ARRAY['BADMINTON']::"SportType"[], '22 Shuttle Street', 'Hyderabad', 'Telangana', '500001', '+91-9876543221', NULL, NULL, 'ACTIVE', ARRAY[]::text[], now(), now());

INSERT INTO trainers (id, name, email, phone, "sportSpecialization", experience, certifications, "hourlyRate", bio, city, state, status, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Rahul Sharma', 'rahul@example.com', '+91-9876543230', 'CRICKET', 10, ARRAY['BCCI Level 2', 'NCA Certified'], 1000, 'Former first-class cricketer with 10 years coaching experience', 'Mumbai', 'Maharashtra', 'ACTIVE', now(), now()),
  (gen_random_uuid(), 'Priya Patel', 'priya@example.com', '+91-9876543231', 'TENNIS', 8, ARRAY['ITF Level 1', 'PTR Certified'], 1200, 'National level tennis player turned coach', 'Delhi', 'Delhi', 'ACTIVE', now(), now()),
  (gen_random_uuid(), 'Ahmed Khan', NULL, '+91-9876543232', 'FOOTBALL', 12, ARRAY['AFC C License', 'AIFF D License'], 800, 'Youth football development specialist', 'Bangalore', 'Karnataka', 'ACTIVE', now(), now());
*/

export {};

