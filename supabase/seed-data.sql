-- ============================================================
-- SEED DATA for Field Up Admin
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ============================================================
-- 1. VENUES (10 venues across Indian cities)
-- ============================================================

INSERT INTO "venues" ("id", "name", "description", "address", "city", "state", "pincode", "latitude", "longitude", "amenities", "contactPhone", "contactEmail", "status")
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Green Valley Sports Complex',    'Premium multi-sport complex with floodlit fields and modern facilities',          '123 Sports Complex Road, Andheri West',           'Mumbai',     'Maharashtra',  '400053', 19.1364, 72.8296, ARRAY['Parking', 'Floodlights', 'Changing Rooms', 'Cafeteria', 'WiFi'],              '+91-9876543001', 'info@greenvalley.com',  'ACTIVE'),
  ('a1000000-0000-0000-0000-000000000002', 'Ace Racket Club',                'Indoor air-conditioned courts for racket sports lovers',                          '45 Racket Lane, Koramangala',                      'Bangalore',  'Karnataka',    '560034', 12.9352, 77.6245, ARRAY['Indoor', 'AC', 'Pro Shop', 'Coaching', 'Locker Rooms'],                      '+91-9876543002', 'play@aceracket.in',     'ACTIVE'),
  ('a1000000-0000-0000-0000-000000000003', 'Goal Zone Arena',                'FIFA-standard turf football fields with night play capability',                    '78 Stadium Road, Sector 62',                       'Noida',      'Uttar Pradesh','201301', 28.6273, 77.3650, ARRAY['Turf', 'Floodlights', 'Washrooms', 'First Aid', 'Parking'],               '+91-9876543003', NULL,                    'ACTIVE'),
  ('a1000000-0000-0000-0000-000000000004', 'Splash Aqua Center',             'Olympic-size swimming pool with professional coaching',                            '10 Marine Drive Extension',                        'Chennai',    'Tamil Nadu',   '600001', 13.0546, 80.2707, ARRAY['Olympic Pool', 'Kids Pool', 'Changing Rooms', 'Towel Service'],             '+91-9876543004', 'swim@splashaqua.com',   'ACTIVE'),
  ('a1000000-0000-0000-0000-000000000005', 'PowerPlay Cricket Academy',      'State-of-the-art cricket nets and match grounds',                                 '200 MG Road, Deccan Gymkhana',                     'Pune',       'Maharashtra',  '411004', 18.5196, 73.8553, ARRAY['Nets', 'Bowling Machine', 'Video Analysis', 'Parking', 'Canteen'],         '+91-9876543005', 'book@powerplay.in',     'ACTIVE'),
  ('a1000000-0000-0000-0000-000000000006', 'Slam Dunk Basketball Court',     'Professional hardwood basketball courts with bleachers',                           '55 Jubilee Hills',                                 'Hyderabad',  'Telangana',    '500033', 17.4326, 78.4071, ARRAY['Hardwood Floor', 'Scoreboards', 'Bleachers', 'Water Dispenser'],            '+91-9876543006', 'hoop@slamdunk.co',      'ACTIVE'),
  ('a1000000-0000-0000-0000-000000000007', 'Volley Village',                 'Beach volleyball and indoor volleyball facility',                                 '3 Calangute Beach Road',                           'Goa',        'Goa',          '403516', 15.5449, 73.7554, ARRAY['Beach Courts', 'Indoor Courts', 'Showers', 'Lockers', 'Refreshments'],     '+91-9876543007', NULL,                    'ACTIVE'),
  ('a1000000-0000-0000-0000-000000000008', 'The Boxing Ring',                'Professional boxing and MMA training facility',                                    '88 Park Street',                                   'Kolkata',    'West Bengal',  '700016', 22.5511, 88.3512, ARRAY['Boxing Ring', 'Punching Bags', 'Weights', 'Sauna', 'Locker Rooms'],         '+91-9876543008', 'fight@boxingring.com',  'ACTIVE'),
  ('a1000000-0000-0000-0000-000000000009', 'Urban Kick Football Hub',        'Modern 5-a-side and 7-a-side synthetic turf pitches',                              '12 Whitefield Main Road',                          'Bangalore',  'Karnataka',    '560066', 12.9698, 77.7500, ARRAY['Synthetic Turf', 'Night Lights', 'Scoreboards', 'Parking', 'Snack Bar'],   '+91-9876543009', 'kick@urbankick.in',     'ACTIVE'),
  ('a1000000-0000-0000-0000-000000000010', 'Heritage Tennis Grounds',        'Clay and synthetic courts in a heritage garden setting',                           '1 Civil Lines',                                     'Delhi',      'Delhi',        '110054', 28.6849, 77.2230, ARRAY['Clay Courts', 'Synthetic Courts', 'Club House', 'Restaurant', 'Parking'], '+91-9876543010', 'play@heritagetg.com',   'INACTIVE');

-- ============================================================
-- 2. VENUE SPORTS (connect venues ↔ sports)
-- ============================================================

INSERT INTO "venue_sports" ("venueId", "sportType", "numberOfCourts", "pricePerHour", "openTime", "closeTime", "availableDays", "rules", "amenities")
VALUES
  -- Green Valley (Mumbai) — Cricket Net, Football
  ('a1000000-0000-0000-0000-000000000001', 'CRICKET_NET',    3, 1500, '06:00', '22:00', '{MON,TUE,WED,THU,FRI,SAT,SUN}', 'White ball only during night sessions', ARRAY['Nets', 'Bowling Machine']),
  ('a1000000-0000-0000-0000-000000000001', 'FOOTBALL',   2, 2000, '06:00', '22:00', '{MON,TUE,WED,THU,FRI,SAT,SUN}', 'Studs mandatory', ARRAY['Goals', 'Bibs']),

  -- Ace Racket Club (Bangalore) — Tennis, Badminton, Snooker, Table Tennis
  ('a1000000-0000-0000-0000-000000000002', 'TENNIS',     4, 800,  '07:00', '21:00', '{MON,TUE,WED,THU,FRI,SAT,SUN}', 'Non-marking shoes required', ARRAY['Ball Machine']),
  ('a1000000-0000-0000-0000-000000000002', 'BADMINTON',  6, 600,  '06:00', '22:00', '{MON,TUE,WED,THU,FRI,SAT,SUN}', NULL, ARRAY['Shuttles Available']),
  ('a1000000-0000-0000-0000-000000000002', 'SNOOKER',    2, 700,  '07:00', '21:00', '{MON,TUE,WED,THU,FRI,SAT}',      NULL, ARRAY[]),
  ('a1000000-0000-0000-0000-000000000002', 'TABLE_TENNIS',3, 400, '08:00', '20:00', '{MON,TUE,WED,THU,FRI,SAT,SUN}', NULL, ARRAY[]),

  -- Goal Zone (Noida) — Football
  ('a1000000-0000-0000-0000-000000000003', 'FOOTBALL',   4, 2500, '05:00', '23:00', '{MON,TUE,WED,THU,FRI,SAT,SUN}', 'Shin guards mandatory', ARRAY['Jerseys', 'Footballs']),

  -- Splash Aqua (Chennai) — Swimming
  ('a1000000-0000-0000-0000-000000000004', 'SWIMMING',   2, 500,  '05:30', '20:00', '{MON,TUE,WED,THU,FRI,SAT,SUN}', 'Cap and goggles mandatory', ARRAY['Kickboards', 'Pull Buoys']),

  -- PowerPlay (Pune) — Cricket Net
  ('a1000000-0000-0000-0000-000000000005', 'CRICKET_NET',    5, 1200, '06:00', '21:00', '{MON,TUE,WED,THU,FRI,SAT,SUN}', 'Helmets compulsory in nets', ARRAY['Practice Nets', 'Bowling Machine', 'Video Analysis']),

  -- Slam Dunk (Hyderabad) — Basketball
  ('a1000000-0000-0000-0000-000000000006', 'BASKETBALL', 2, 1000, '06:00', '22:00', '{MON,TUE,WED,THU,FRI,SAT,SUN}', 'Non-marking shoes only', ARRAY['Basketballs', 'Scoreboard']),

  -- Volley Village (Goa) — Volleyball
  ('a1000000-0000-0000-0000-000000000007', 'VOLLEYBALL',      2, 800,  '07:00', '19:00', '{MON,TUE,WED,THU,FRI,SAT,SUN}', NULL, ARRAY['Volleyball', 'Net']),

  -- The Boxing Ring (Kolkata) — Boxing
  ('a1000000-0000-0000-0000-000000000008', 'BOXING',     2, 500,  '06:00', '21:00', '{MON,TUE,WED,THU,FRI,SAT}', 'Wraps and gloves mandatory', ARRAY['Gloves', 'Wraps', 'Head Guard']),

  -- Urban Kick (Bangalore) — Football
  ('a1000000-0000-0000-0000-000000000009', 'FOOTBALL',   3, 1800, '06:00', '23:00', '{MON,TUE,WED,THU,FRI,SAT,SUN}', 'No metal studs allowed', ARRAY['Bibs', 'Footballs']),

  -- Heritage Tennis (Delhi) — Tennis
  ('a1000000-0000-0000-0000-000000000010', 'TENNIS',     6, 1000, '06:00', '20:00', '{MON,TUE,WED,THU,FRI,SAT,SUN}', 'Whites preferred', ARRAY['Ball Machine', 'Ball Picker']);

-- ============================================================
-- 3. COURTS (individual bookable courts linked to venues)
-- ============================================================

INSERT INTO "courts" ("id", "venueId", "name", "sportType", "surfaceType", "indoor", "pricePerHour", "maxPlayers", "status")
VALUES
  -- Green Valley — Cricket nets & Football pitches
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Cricket Net 1',         'CRICKET_NET', 'TURF',      false, 1500, 6,  'ACTIVE'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Cricket Net 2',         'CRICKET_NET', 'TURF',      false, 1500, 6,  'ACTIVE'),
  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Cricket Net 3 (Indoor)','CRICKET_NET', 'SYNTHETIC', true,  1800, 6,  'ACTIVE'),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Football Pitch A',      'FOOTBALL',   'TURF',      false, 2000, 14, 'ACTIVE'),
  ('c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'Football Pitch B',      'FOOTBALL',   'SYNTHETIC', false, 2500, 14, 'ACTIVE'),

  -- Ace Racket Club — Tennis, Badminton, Snooker, TT
  ('c1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Tennis Court 1',        'TENNIS',     'CLAY',      false, 800,  4, 'ACTIVE'),
  ('c1000000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002', 'Tennis Court 2',        'TENNIS',     'SYNTHETIC', true,  1000, 4, 'ACTIVE'),
  ('c1000000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000002', 'Badminton Court 1',     'BADMINTON',  'WOODEN',    true,  600,  4, 'ACTIVE'),
  ('c1000000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000002', 'Badminton Court 2',     'BADMINTON',  'WOODEN',    true,  600,  4, 'ACTIVE'),
  ('c1000000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000002', 'Snooker Table 1',       'SNOOKER',    'WOODEN',    true,  700,  2, 'ACTIVE'),
  ('c1000000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000002', 'Table Tennis Room',     'TABLE_TENNIS','WOODEN',   true,  400,  4, 'ACTIVE'),

  -- Goal Zone — Football
  ('c1000000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000003', '5-a-side Pitch 1',      'FOOTBALL',   'SYNTHETIC', false, 2000, 10, 'ACTIVE'),
  ('c1000000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000003', '5-a-side Pitch 2',      'FOOTBALL',   'SYNTHETIC', false, 2000, 10, 'ACTIVE'),
  ('c1000000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000003', '7-a-side Pitch',        'FOOTBALL',   'TURF',      false, 3000, 14, 'ACTIVE'),
  ('c1000000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000003', '11-a-side Field',       'FOOTBALL',   'TURF',      false, 5000, 22, 'INACTIVE'),

  -- Slam Dunk — Basketball
  ('c1000000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000006', 'Full Court 1',          'BASKETBALL', 'WOODEN',    true,  1000, 10, 'ACTIVE'),
  ('c1000000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000006', 'Half Court (Practice)', 'BASKETBALL', 'CONCRETE',  false, 500,  6,  'ACTIVE'),

  -- Urban Kick — Football
  ('c1000000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000009', 'Turf A',                'FOOTBALL',   'SYNTHETIC', false, 1800, 10, 'ACTIVE'),
  ('c1000000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000009', 'Turf B',                'FOOTBALL',   'SYNTHETIC', false, 1800, 10, 'ACTIVE'),
  ('c1000000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000009', 'Turf C (Premium)',      'FOOTBALL',   'SYNTHETIC', true,  2500, 14, 'ACTIVE'),

  -- Heritage Tennis — Tennis
  ('c1000000-0000-0000-0000-000000000021', 'a1000000-0000-0000-0000-000000000010', 'Clay Court 1',          'TENNIS',     'CLAY',      false, 1000, 4, 'INACTIVE'),
  ('c1000000-0000-0000-0000-000000000022', 'a1000000-0000-0000-0000-000000000010', 'Clay Court 2',          'TENNIS',     'CLAY',      false, 1000, 4, 'INACTIVE');

-- ============================================================
-- 4. ACADEMIES (8 academies)
-- ============================================================

INSERT INTO "academies" ("id", "name", "description", "sportsOffered", "address", "city", "state", "pincode", "latitude", "longitude", "contactPhone", "contactEmail", "website", "establishedYear", "status")
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Champions Sports Academy',       'Multi-sport academy producing national-level athletes since 2010',                             '100 Academy Boulevard, Shivaji Nagar',  'Mumbai',     'Maharashtra',   '400002', 19.0178, 72.8478, '+91-9876543020', 'info@champions-academy.com',   'https://champions-academy.com',   2010, 'ACTIVE'),
  ('b1000000-0000-0000-0000-000000000002', 'Elite Shuttlers Academy',        'Specialised badminton training by former national players',                                     '22 Shuttle Street, Madhapur',           'Hyderabad',  'Telangana',     '500081', 17.4483, 78.3915, '+91-9876543021', 'play@eliteshuttlers.in',        NULL,                              2016, 'ACTIVE'),
  ('b1000000-0000-0000-0000-000000000003', 'Strikers Football School',       'Grassroots to elite football programme for ages 5-18',                                          '15 HSR Layout',                         'Bangalore',  'Karnataka',     '560102', 12.9116, 77.6474, '+91-9876543022', 'join@strikers.co.in',           'https://strikers.co.in',          2014, 'ACTIVE'),
  ('b1000000-0000-0000-0000-000000000004', 'ProServe Tennis School',         'Tennis coaching from beginner to tournament level',                                              '8 Race Course Road',                    'Delhi',      'Delhi',         '110003', 28.6112, 77.2134, '+91-9876543023', 'admissions@proserve.in',        'https://proserve.in',             2008, 'ACTIVE'),
  ('b1000000-0000-0000-0000-000000000005', 'SwimFast Aquatics Academy',      'Competitive swimming and water polo training centre',                                           '5 Beach Road',                          'Chennai',    'Tamil Nadu',    '600004', 13.0538, 80.2821, '+91-9876543024', 'swim@swimfast.in',              NULL,                              2018, 'ACTIVE'),
  ('b1000000-0000-0000-0000-000000000006', 'KO Combat Academy',             'Boxing and kickboxing for fitness and competition',                                                        '42 Salt Lake',                          'Kolkata',    'West Bengal',   '700091', 22.5803, 88.4155, '+91-9876543025', NULL,                            NULL,                              2019, 'ACTIVE'),
  ('b1000000-0000-0000-0000-000000000007', 'Cricket Legends Academy',       'Producing district and state cricketers with world-class coaching',                                '33 Camp Area',                          'Pune',       'Maharashtra',   '411001', 18.5130, 73.8765, '+91-9876543026', 'info@cricketlegends.in',        'https://cricketlegends.in',       2012, 'ACTIVE'),
  ('b1000000-0000-0000-0000-000000000008', 'Hoop Dreams Basketball Club',   'Basketball training for all ages and skill levels',                                               '7 Banjara Hills Road No 3',             'Hyderabad',  'Telangana',     '500034', 17.4156, 78.4347, '+91-9876543027', 'dribble@hoopdreams.in',         NULL,                              2020, 'INACTIVE');

-- ============================================================
-- 5. TRAINERS (15 trainers across sports)
-- ============================================================

INSERT INTO "trainers" ("id", "name", "email", "phone", "sportSpecialization", "experience", "certifications", "hourlyRate", "bio", "city", "state", "status")
VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Rahul Sharma',     'rahul.sharma@example.com',   '+91-9876543030', 'CRICKET_NET',  12, ARRAY['BCCI Level 3', 'NCA Certified'],                    1200, 'Former Ranji Trophy player with 12 years coaching experience. Specialises in batting technique.',           'Mumbai',     'Maharashtra',  'ACTIVE'),
  ('d1000000-0000-0000-0000-000000000002', 'Priya Nair',       'priya.nair@example.com',     '+91-9876543031', 'TENNIS',       9,  ARRAY['ITF Level 2', 'PTR Professional'],                  1500, 'Former WTA ranked player. Focuses on competitive match preparation.',                                       'Delhi',      'Delhi',        'ACTIVE'),
  ('d1000000-0000-0000-0000-000000000003', 'Ahmed Khan',       NULL,                          '+91-9876543032', 'FOOTBALL',     15, ARRAY['AFC B License', 'AIFF D License'],                  1000, 'Youth development specialist with 15 years in grassroots football.',                                        'Bangalore',  'Karnataka',    'ACTIVE'),
  ('d1000000-0000-0000-0000-000000000004', 'Sneha Reddy',      'sneha.r@example.com',         '+91-9876543033', 'BADMINTON',    7,  ARRAY['BAI Certified Coach'],                               900,  'State-level player turned coach. Expert in doubles strategy.',                                             'Hyderabad',  'Telangana',    'ACTIVE'),
  ('d1000000-0000-0000-0000-000000000005', 'Vikram Singh',     'vikram.s@example.com',        '+91-9876543034', 'BOXING',       20, ARRAY['AIBA 2-Star Coach', 'SAI Level 2'],                 800,  'Commonwealth Games bronze medallist. Training champions since 2005.',                                       'Kolkata',    'West Bengal',  'ACTIVE'),
  ('d1000000-0000-0000-0000-000000000006', 'Meera Iyer',       'meera.i@example.com',         '+91-9876543035', 'SWIMMING',     11, ARRAY['ASCA Level 3', 'WSF Certified'],                    1100, 'Open water swimming specialist with international coaching experience.',                                    'Chennai',    'Tamil Nadu',   'ACTIVE'),
  ('d1000000-0000-0000-0000-000000000007', 'Arjun Deshmukh',   NULL,                          '+91-9876543036', 'CRICKET_NET',  8,  ARRAY['BCCI Level 2', 'NCA Fast Bowling'],                 1000, 'Fast bowling specialist. Coached 3 IPL net bowlers.',                                                       'Pune',       'Maharashtra',  'ACTIVE'),
  ('d1000000-0000-0000-0000-000000000008', 'Fatima Shaikh',    'fatima.s@example.com',        '+91-9876543037', 'BASKETBALL',   6,  ARRAY['FIBA Level 1', 'NBA Academy Graduate'],              950,  'Former Indian Women Basketball League player.',                                                             'Hyderabad',  'Telangana',    'ACTIVE'),
  ('d1000000-0000-0000-0000-000000000009', 'Ravi Kumar',       'ravi.k@example.com',          '+91-9876543038', 'FOOTBALL',     10, ARRAY['AFC C License'],                                     850,  'Goalkeeping coach with I-League experience.',                                                              'Noida',      'Uttar Pradesh','ACTIVE'),
  ('d1000000-0000-0000-0000-000000000010', 'Ananya Pillai',    'ananya.p@example.com',        '+91-9876543039', 'TENNIS',       5,  ARRAY['ITF Level 1'],                                      700,  'Junior tennis development coach. Specialises in kids aged 6-14.',                                          'Bangalore',  'Karnataka',    'ACTIVE'),
  ('d1000000-0000-0000-0000-000000000011', 'Deepak Chauhan',   NULL,                          '+91-9876543040', 'BOXING',       14, ARRAY['BJJ Purple Belt', 'Muay Thai Kru'],                 1300, 'Professional boxing and combat sports coach.',                                                             'Kolkata',    'West Bengal',  'ACTIVE'),
  ('d1000000-0000-0000-0000-000000000012', 'Kavitha Sundaram',  'kavitha.s@example.com',      '+91-9876543041', 'VOLLEYBALL',   9,  ARRAY['FIVB Level 2'],                                      750,  'Former Indian volleyball team member. Beach volleyball specialist.',                                       'Goa',        'Goa',          'ACTIVE'),
  ('d1000000-0000-0000-0000-000000000013', 'Suresh Menon',     'suresh.m@example.com',        '+91-9876543042', 'SNOOKER',      11, ARRAY['WSF Level 2', 'SRFI Certified'],                     950,  'National snooker champion 2015. Coaching competitive players.',                                             'Mumbai',     'Maharashtra',  'ACTIVE'),
  ('d1000000-0000-0000-0000-000000000014', 'Pooja Verma',      NULL,                          '+91-9876543043', 'BADMINTON',    4,  ARRAY['BAI Level 1'],                                       600,  'Former university badminton captain. Great with beginners.',                                                'Delhi',      'Delhi',        'INACTIVE'),
  ('d1000000-0000-0000-0000-000000000015', 'Rajesh Tiwari',    'rajesh.t@example.com',        '+91-9876543044', 'CRICKET_NET',  18, ARRAY['BCCI Level 3', 'ECB Level 3', 'NCA Spin Bowling'],  2000, 'Spin bowling guru. Coached IPL franchise academies. 18 years international experience.',                    'Mumbai',     'Maharashtra',  'ACTIVE');

-- ============================================================
-- 6. ACADEMY ↔ TRAINER LINKS
-- ============================================================

INSERT INTO "academy_trainers" ("academyId", "trainerId")
VALUES
  -- Champions Sports Academy ← Cricket + Football trainers
  ('b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000015'),

  -- Elite Shuttlers ← Badminton
  ('b1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000004'),

  -- Strikers Football School ← Football
  ('b1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000009'),

  -- ProServe Tennis ← Tennis
  ('b1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002'),
  ('b1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000010'),

  -- SwimFast ← Swimming
  ('b1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000006'),

  -- KO Combat ← Boxing
  ('b1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000005'),
  ('b1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000011'),

  -- Cricket Legends ← Cricket
  ('b1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000007'),
  ('b1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000015'),

  -- Hoop Dreams ← Basketball
  ('b1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000008');

-- ============================================================
-- 7. ONBOARDING APPLICATIONS (6 applications in various states)
-- ============================================================

INSERT INTO "onboarding_applications" ("id", "status", "partnerType", "businessName", "contactPerson", "phone", "email", "city", "fullAddress", "googleMapsLink", "sportsOffered", "experienceYears", "shortBio", "numberOfCourts", "surfaceType", "facilities", "sessionTypes", "maxStudents", "availableDays", "operatingHours", "slotDuration", "pricePerSlot", "weekendPricingDiff", "cancellationAllowed", "acceptsCash", "bankAccountName", "termsAccepted")
VALUES
  -- PENDING applications
  ('e1000000-0000-0000-0000-000000000001', 'PENDING',      'VENUE',   'Sunrise Sports Hub',        'Manish Goel',     '+91-9876543050', 'manish@sunrise.com',    'Jaipur',     '45 MI Road, Jaipur', NULL, '{CRICKET_NET,FOOTBALL}',   NULL, NULL, 4, 'SYNTHETIC',  '{Parking,Floodlights,Washrooms}', '{}', NULL, '{MON,TUE,WED,THU,FRI,SAT,SUN}', '6 AM - 10 PM', 'SIXTY_MINS',  1500, true,  true,  true,  'Manish Goel', true),
  ('e1000000-0000-0000-0000-000000000002', 'PENDING',      'COACH',   'Coach Arjun Fitness',       'Arjun Malhotra',  '+91-9876543051', 'arjun@fitness.com',     'Chandigarh', '12 Sector 17, Chandigarh', NULL, '{BOXING}', 8, 'Professional boxer turned fitness coach with 8 years experience', NULL, NULL, '{}', '{Personal,Group,Online}', 15, '{MON,TUE,WED,THU,FRI,SAT}', '7 AM - 9 PM', 'SIXTY_MINS', 800, false, true, false, 'Arjun Malhotra', true),

  -- UNDER_REVIEW
  ('e1000000-0000-0000-0000-000000000003', 'UNDER_REVIEW', 'VENUE',   'Peak Performance Arena',    'Sanjay Kapoor',   '+91-9876543052', 'sanjay@peak.com',       'Ahmedabad',  '88 SG Highway, Ahmedabad', 'https://maps.google.com/?q=peak+arena', '{BASKETBALL,VOLLEYBALL}', NULL, NULL, 3, 'WOODEN', '{Indoor,AC,Scoreboard}', '{}', NULL, '{MON,TUE,WED,THU,FRI,SAT,SUN}', '8 AM - 10 PM', 'SIXTY_MINS', 1200, true, false, true, 'Peak Performance LLP', true),
  ('e1000000-0000-0000-0000-000000000004', 'UNDER_REVIEW', 'ACADEMY', 'NextGen Cricket Academy',   'Ramesh Patil',    '+91-9876543053', 'ramesh@nextgen.com',    'Nagpur',     '5 Civil Lines, Nagpur', NULL, '{CRICKET_NET}', 15, 'Running cricket academy for 15 years with 200+ students', 6, 'TURF', '{Nets,Bowling Machine,Match Ground}', '{Group,Personal,Camp}', 50, '{MON,TUE,WED,THU,FRI,SAT,SUN}', '6 AM - 8 PM', 'NINETY_MINS', 500, false, true, true, 'NextGen Cricket Academy', true),

  -- APPROVED
  ('e1000000-0000-0000-0000-000000000005', 'APPROVED',     'VENUE',   'Metro Sports Complex',      'Anita Desai',     '+91-9876543054', 'anita@metrosports.com', 'Lucknow',    '100 Gomti Nagar, Lucknow', NULL, '{TENNIS,BADMINTON,TABLE_TENNIS}', NULL, NULL, 8, 'SYNTHETIC', '{Indoor,AC,Pro Shop,Cafeteria}', '{}', NULL, '{MON,TUE,WED,THU,FRI,SAT,SUN}', '7 AM - 10 PM', 'SIXTY_MINS', 700, true, true, true, 'Metro Sports Pvt Ltd', true),

  -- REJECTED
  ('e1000000-0000-0000-0000-000000000006', 'REJECTED',     'COACH',   'Fitness with Neha',         'Neha Singh',      '+91-9876543055', 'neha@fitness.com',      'Indore',     '23 Vijay Nagar, Indore', NULL, '{SWIMMING}', 2, 'Recently certified swimming instructor', NULL, NULL, '{}', '{Personal}', 5, '{SAT,SUN}', '8 AM - 12 PM', 'THIRTY_MINS', 300, false, false, false, NULL, true);

-- Update rejected application with review info
UPDATE "onboarding_applications"
SET
  "reviewedBy" = 'System Admin',
  "reviewedAt" = now() - INTERVAL '3 days',
  "rejectionReason" = 'Insufficient experience. Minimum 3 years required for coaching applications.'
WHERE "id" = 'e1000000-0000-0000-0000-000000000006';

-- Update approved application with review info
UPDATE "onboarding_applications"
SET
  "reviewedBy" = 'System Admin',
  "reviewedAt" = now() - INTERVAL '7 days',
  "notes" = 'Verified facility in person. Excellent infrastructure.'
WHERE "id" = 'e1000000-0000-0000-0000-000000000005';


-- ============================================================
-- DONE! Summary of seeded data:
-- ============================================================
-- 10 Venues (9 Active, 1 Inactive)
-- 18 Venue-Sport links
-- 22 Courts (19 Active, 3 Inactive)
-- 8  Academies (7 Active, 1 Inactive)
-- 15 Trainers (13 Active, 2 Inactive)
-- 14 Academy-Trainer links
-- 6  Onboarding Applications (2 Pending, 2 Under Review, 1 Approved, 1 Rejected)
-- ============================================================
