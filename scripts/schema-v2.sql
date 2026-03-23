-- ============================================================
-- Feedback Platform — Schema v2
-- Multi-tenant feedback system
-- Run this in Supabase SQL Editor
-- ============================================================

-- Drop old objects from v1
DROP VIEW IF EXISTS leaderboard_by_criteria;
DROP VIEW IF EXISTS leaderboard;
DROP TABLE IF EXISTS event_ratings;
DROP TABLE IF EXISTS attendees;
DROP TABLE IF EXISTS event_criteria;
DROP TABLE IF EXISTS event_items;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS criteria;

-- 1. Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Event items (stalls/games/booths)
CREATE TABLE event_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, slug)
);

-- 3. Event criteria (rating categories)
CREATE TABLE event_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  min_score INT DEFAULT 1,
  max_score INT DEFAULT 5,
  sort_order INT DEFAULT 0
);

-- 4. Attendees (per event, identified by phone)
CREATE TABLE attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, phone)
);

-- 5. Ratings (per attendee per item per criteria)
CREATE TABLE event_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendee_id UUID NOT NULL REFERENCES attendees(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES event_items(id) ON DELETE CASCADE,
  criteria_id UUID NOT NULL REFERENCES event_criteria(id) ON DELETE CASCADE,
  score INT NOT NULL,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(attendee_id, item_id, criteria_id)
);

-- 6. Indexes
CREATE INDEX idx_event_items_event_id ON event_items(event_id);
CREATE INDEX idx_event_criteria_event_id ON event_criteria(event_id);
CREATE INDEX idx_attendees_event_id ON attendees(event_id);
CREATE INDEX idx_attendees_phone ON attendees(event_id, phone);
CREATE INDEX idx_event_ratings_attendee_id ON event_ratings(attendee_id);
CREATE INDEX idx_event_ratings_item_id ON event_ratings(item_id);
CREATE INDEX idx_event_ratings_criteria_id ON event_ratings(criteria_id);

-- 7. Leaderboard VIEW
CREATE OR REPLACE VIEW leaderboard WITH (security_invoker = on) AS
SELECT
  i.id AS item_id,
  i.name AS item_name,
  i.slug AS item_slug,
  i.event_id,
  COUNT(DISTINCT a.id) AS total_votes,
  ROUND(AVG(r.score), 2) AS average_score,
  SUM(r.score) AS total_score
FROM event_items i
LEFT JOIN event_ratings r ON r.item_id = i.id
LEFT JOIN attendees a ON a.id = r.attendee_id AND a.completed_at IS NOT NULL
GROUP BY i.id, i.name, i.slug, i.event_id
ORDER BY average_score DESC;

-- 8. Per-criteria leaderboard VIEW
CREATE OR REPLACE VIEW leaderboard_by_criteria WITH (security_invoker = on) AS
SELECT
  i.id AS item_id,
  i.name AS item_name,
  i.slug AS item_slug,
  i.event_id,
  c.id AS criteria_id,
  c.label AS criteria_label,
  COUNT(r.id) AS total_votes,
  ROUND(AVG(r.score), 2) AS avg_score
FROM event_items i
CROSS JOIN event_criteria c
LEFT JOIN event_ratings r ON r.item_id = i.id AND r.criteria_id = c.id
LEFT JOIN attendees a ON a.id = r.attendee_id AND a.completed_at IS NOT NULL
WHERE i.event_id = c.event_id
GROUP BY i.id, i.name, i.slug, i.event_id, c.id, c.label
ORDER BY i.sort_order, c.sort_order;

-- 9. RLS Policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_ratings ENABLE ROW LEVEL SECURITY;

-- Events: organizer can do everything with their own events
-- Anyone can read events by slug (for attendee access)
CREATE POLICY "Anyone can read events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Organizers can create events" ON events
  FOR INSERT WITH CHECK ((select auth.uid()) = organizer_id);

CREATE POLICY "Organizers can update own events" ON events
  FOR UPDATE USING ((select auth.uid()) = organizer_id);

CREATE POLICY "Organizers can delete own events" ON events
  FOR DELETE USING ((select auth.uid()) = organizer_id);

-- Event items: anyone can read, organizer manages their own
CREATE POLICY "Anyone can read event items" ON event_items
  FOR SELECT USING (true);

CREATE POLICY "Organizers can manage own items" ON event_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_items.event_id AND events.organizer_id = (select auth.uid()))
  );

CREATE POLICY "Organizers can update own items" ON event_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_items.event_id AND events.organizer_id = (select auth.uid()))
  );

CREATE POLICY "Organizers can delete own items" ON event_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_items.event_id AND events.organizer_id = (select auth.uid()))
  );

-- Event criteria: anyone can read, organizer manages their own
CREATE POLICY "Anyone can read event criteria" ON event_criteria
  FOR SELECT USING (true);

CREATE POLICY "Organizers can manage own criteria" ON event_criteria
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_criteria.event_id AND events.organizer_id = (select auth.uid()))
  );

CREATE POLICY "Organizers can update own criteria" ON event_criteria
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_criteria.event_id AND events.organizer_id = (select auth.uid()))
  );

CREATE POLICY "Organizers can delete own criteria" ON event_criteria
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_criteria.event_id AND events.organizer_id = (select auth.uid()))
  );

-- Attendees: anyone can insert (sign up for event), organizers can read for their events
CREATE POLICY "Anyone can register as attendee" ON attendees
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read attendees" ON attendees
  FOR SELECT USING (true);

CREATE POLICY "Attendees can update own record" ON attendees
  FOR UPDATE USING (true);

-- Event ratings: anyone can insert, anyone can read
CREATE POLICY "Anyone can submit ratings" ON event_ratings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read ratings" ON event_ratings
  FOR SELECT USING (true);
