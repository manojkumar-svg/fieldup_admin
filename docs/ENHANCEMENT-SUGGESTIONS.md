# FieldUp Platform — Enhancement Suggestions

**Date**: March 2025  
**Scope**: Admin dashboard improvements + user-side app preparation

---

## 1. Booking & Scheduling Engine (High Priority)

The core value of FieldUp is enabling end users to discover and book sports facilities. This is the #1 priority before launching the user-side app.

### What to build
- **Time-slot management** — Let admins define slot durations per court/trainer (30/60/90 min), with recurring weekly schedules
- **Real-time availability calendar** — Visual calendar view showing booked vs available slots per court/trainer
- **Booking lifecycle** — PENDING → CONFIRMED → COMPLETED / CANCELLED / NO_SHOW
- **Cancellation policy enforcement** — Use the `cancellationAvailable` flag + define cancellation window (e.g., "free cancellation up to 2 hrs before")
- **Recurring bookings** — Allow weekly/monthly recurring reservations for regular players
- **Conflict detection** — Prevent double-booking at the database level with exclusive time-range constraints

### Database additions needed
```
bookings: id, courtId?, trainerId?, userId, slotDate, startTime, endTime, 
          status, amount, paymentStatus, cancellationReason, createdAt
time_slots: id, entityType (COURT/TRAINER), entityId, dayOfWeek, startTime, 
            endTime, slotDuration, isActive
blocked_dates: id, entityType, entityId, date, reason
```

---

## 2. Payment Integration (High Priority)

### What to build
- **Razorpay or Stripe integration** — For Indian market, Razorpay is preferred (UPI, cards, net banking, wallets)
- **Partial payment / advance booking** — Collect a booking fee (e.g., 20%) at reservation, rest at venue
- **Refund automation** — Auto-refund on cancellation within policy window
- **Revenue dashboard** — Show total bookings revenue, pending payments, refunds per venue/trainer
- **Invoice generation** — PDF invoices for each booking with GST details
- **Payout to partners** — Settlement reports for venue owners/trainers (weekly/monthly)

---

## 3. Ratings & Reviews System (Medium Priority)

### What to build
- **Post-session ratings** — 1–5 stars + text review after a completed booking
- **Rating aggregation** — Average rating displayed on venue/trainer/academy cards
- **Review moderation** — Admin dashboard to flag/remove inappropriate reviews
- **Response capability** — Allow trainers/venues to respond to reviews
- **Verified reviews** — Only users who completed a booking can review

### Database additions
```
reviews: id, entityType, entityId, userId, rating (1-5), text, 
         isVerified, bookingId, response, createdAt
```

---

## 4. User Management & Profiles (High Priority for user app)

### What to build
- **User registration** — Email + phone OTP (Supabase Auth supports this)
- **User profiles** — Name, phone, preferred sports, skill level, city, profile photo
- **Booking history** — Past bookings, upcoming bookings, cancelled bookings
- **Favorites** — Save favorite venues/trainers for quick access
- **Activity feed** — Recent bookings, reviews given, achievements

---

## 5. Search & Discovery Enhancements (Medium Priority)

### What to build
- **Geo-based search** — "Courts near me" using PostGIS `ST_DWithin` on lat/lng columns (already captured!)
- **Advanced filters** — Price range slider, distance radius, ratings, amenities, availability (today/this week)
- **Full-text search** — PostgreSQL `tsvector` index on name + description + city for faster search
- **Sport-based landing pages** — e.g., "Tennis in Mumbai" — SEO-friendly pages
- **Sort options** — Price (low to high), distance, rating, popularity

### Database additions
```sql
-- Enable PostGIS extension (already available in Supabase)
CREATE EXTENSION IF NOT EXISTS postgis;
ALTER TABLE venues ADD COLUMN location geography(POINT);
-- Create spatial index for fast "near me" queries
CREATE INDEX idx_venues_location ON venues USING GIST(location);
```

---

## 6. Notifications & Communication (Medium Priority)

### What to build
- **Email notifications** — Booking confirmation, reminders (24h before), cancellation alerts
- **SMS/WhatsApp notifications** — Using Twilio or MSG91 (critical for India market)
- **Push notifications** — For the mobile app (Firebase Cloud Messaging)
- **In-app messaging** — Chat between user and trainer/venue for booking queries
- **Admin alerts** — New onboarding applications, high-value bookings, low-rating alerts

---

## 7. Analytics & Reporting Dashboard (Medium Priority)

### What to build
- **Booking analytics** — Daily/weekly/monthly booking trends, peak hours heatmap
- **Revenue analytics** — Revenue by venue, sport, city, time period with charts
- **Occupancy rates** — % of slots booked per court (identify underutilized facilities)
- **Trainer performance** — Sessions conducted, student retention, rating trends
- **Onboarding funnel** — Applications received → reviewed → approved conversion rates
- **Export functionality** — CSV/PDF export for all reports
- **Data visualization** — Charts using Recharts or Chart.js (lightweight, React-friendly)

---

## 8. Multi-language & Localization (Low Priority for v1)

### What to build
- **Hindi + regional language support** — Important for tier-2/3 city adoption in India
- **i18n framework** — Use `next-intl` for route-based localization
- **Currency formatting** — Already using ₹, but ensure proper Indian number formatting (lakhs/crores)
- **Date/time localization** — IST timezone handling across bookings

---

## 9. Mobile App Considerations (Future)

### Recommended approach
- **React Native with Expo** — Share validation schemas (Zod) and API client code with web
- **Key mobile-first features**: QR code check-in at venue, live court availability map, one-tap rebooking
- **Offline support** — Cache upcoming bookings for connectivity issues at venues

---

## 10. Operational Improvements (Admin Dashboard)

These can be implemented now to add immediate value:

### 10a. Bulk Operations
- **Bulk import** — CSV upload for venues/trainers (mass onboarding for new cities)
- **Bulk status toggle** — Select multiple entities and activate/deactivate
- **Bulk pricing update** — Increase all court prices by X% for a venue

### 10b. Audit Trail
- Track who changed what and when (important for multi-admin setups)
- `audit_logs: id, userId, entityType, entityId, action, changes (JSONB), createdAt`

### 10c. Dashboard Improvements
- **Quick actions** — One-click "Add Venue" from dashboard
- **Recent activity feed** — Last 10 actions across all entities
- **Onboarding queue** — Pending applications count with urgency indicators
- **Map view** — Plot all venues/courts on a map (you have lat/lng for everything now!)

### 10d. Image Management
- **Image reordering** — Drag-and-drop to set display order
- **Image compression** — Auto-compress on upload (use Sharp or Supabase transforms)
- **Thumbnail generation** — Auto-generate thumbnails for list views

### 10e. Data Validation & Quality
- **Duplicate detection** — Flag potential duplicate venues/trainers (same name + same city)
- **Incomplete profile alerts** — Highlight entities missing images, location, or contact info
- **Address verification** — Cross-check with geocoded address

---

## 11. Trainer-Specific Enhancements

### What to build
- **Trainer availability calendar** — Weekly schedule with blocked dates
- **Package pricing** — Monthly/quarterly packages (e.g., "10 sessions for ₹8000")
- **Student management** — Trainer can see their regular students, track progress
- **Certification verification** — Upload and verify coaching certifications
- **Trainer portfolio** — Video uploads showcasing coaching style
- **Trial session** — Offer discounted trial sessions for new students

---

## 12. Venue-Specific Enhancements

### What to build
- **Multi-court booking** — Book 2+ courts together for team events
- **Tournament hosting** — Create tournament brackets, manage fixtures
- **Venue manager portal** — Separate login for venue owners to manage their own venues
- **Operational hours by day** — Different hours for weekdays vs weekends
- **Dynamic pricing** — Peak/off-peak pricing (morning vs evening, weekday vs weekend)
- **Membership plans** — Monthly/annual memberships with discounted rates

---

## 13. Security & Compliance Enhancements

### Recommendations
- **Row-Level Security (RLS)** — Already using Supabase; ensure RLS policies are strict per role
- **Rate limiting** — Add rate limiting to API routes (use `next-rate-limit` or Upstash)
- **Input sanitization** — Zod handles validation; ensure no XSS in rich text fields
- **GDPR/data privacy** — Add data export and account deletion capabilities
- **Two-factor authentication** — For admin accounts (Supabase supports TOTP)

---

## Priority Roadmap

| Phase | Enhancement | Impact | Effort |
|-------|------------|--------|--------|
| **v1.1** | Booking engine + time slots | Critical | High |
| **v1.1** | Payment integration (Razorpay) | Critical | High |
| **v1.1** | User registration + profiles | Critical | Medium |
| **v1.2** | Geo-based search | High | Medium |
| **v1.2** | Ratings & reviews | High | Medium |
| **v1.2** | Email/SMS notifications | High | Medium |
| **v1.3** | Analytics dashboard | Medium | Medium |
| **v1.3** | Trainer calendar + packages | Medium | Medium |
| **v1.3** | Bulk operations | Medium | Low |
| **v2.0** | Mobile app (React Native) | High | High |
| **v2.0** | Dynamic pricing | Medium | Medium |
| **v2.0** | Tournament hosting | Medium | High |
| **v2.0** | Multi-language support | Medium | Medium |

---

## Quick Wins (Can implement in 1-2 days each)

1. **Map view on dashboard** — Plot all venues on a map using the lat/lng data you already capture
2. **Incomplete profile badges** — Show warning badges on entities missing photos or contact info
3. **Recent activity feed** — Show last 10 created/updated entities on dashboard
4. **Booking enquiry form** — Simple form on public page: "I'm interested in booking X" → creates a lead
5. **QR code generation** — Generate shareable QR codes for each venue/trainer
6. **Venue comparison** — Side-by-side comparison of 2-3 venues (pricing, amenities, ratings)
7. **Trainer-venue linking** — Associate trainers with venues where they coach (beyond academy/gym)
8. **Session attendance** — Track trainer session attendance with capacity counter
