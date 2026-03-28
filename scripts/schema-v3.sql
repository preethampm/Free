-- ============================================================
-- Schema v3: Per-item criteria support
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add criteria_mode to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS criteria_mode TEXT DEFAULT 'same' CHECK (criteria_mode IN ('same', 'different'));

-- 2. Create item_criteria table (per-item rating criteria)
CREATE TABLE IF NOT EXISTS item_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES event_items(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  min_score INT DEFAULT 1,
  max_score INT DEFAULT 5,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Add item_criteria_id to event_ratings (for 'different' mode)
ALTER TABLE event_ratings ADD COLUMN IF NOT EXISTS item_criteria_id UUID REFERENCES item_criteria(id) ON DELETE CASCADE;

-- 4. Update event_ratings to allow nullable criteria_id
ALTER TABLE event_ratings ALTER COLUMN criteria_id DROP NOT NULL;

-- 5. Add unique constraint for item_criteria (item_id + label)
ALTER TABLE item_criteria ADD CONSTRAINT unique_item_criteria UNIQUE (item_id, label);

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_item_criteria_item_id ON item_criteria(item_id);
CREATE INDEX IF NOT EXISTS idx_event_ratings_item_criteria_id ON event_ratings(item_criteria_id);

-- 7. RLS for item_criteria
ALTER TABLE item_criteria ENABLE ROW LEVEL SECURITY;

-- Anyone can read item criteria
CREATE POLICY "Anyone can read item criteria" ON item_criteria
  FOR SELECT USING (true);

-- Organizers can manage item criteria
CREATE POLICY "Organizers can manage item criteria" ON item_criteria
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM event_items ei JOIN events e ON e.id = ei.event_id WHERE ei.id = item_criteria.item_id AND e.organizer_id = (select auth.uid()))
  );

CREATE POLICY "Organizers can update item criteria" ON item_criteria
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM event_items ei JOIN events e ON e.id = ei.event_id WHERE ei.id = item_criteria.item_id AND e.organizer_id = (select auth.uid()))
  );

CREATE POLICY "Organizers can delete item criteria" ON item_criteria
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM event_items ei JOIN events e ON e.id = ei.event_id WHERE ei.id = item_criteria.item_id AND e.organizer_id = (select auth.uid()))
  );

-- 8. Update leaderboard view to include item_criteria
DROP VIEW IF EXISTS leaderboard_by_criteria CASCADE;
CREATE OR REPLACE VIEW leaderboard_by_criteria WITH (security_invoker = on) AS
-- Same criteria mode
SELECT
  i.id AS item_id,
  i.name AS item_name,
  i.slug AS item_slug,
  i.event_id,
  c.id AS criteria_id,
  c.label AS criteria_label,
  COUNT(r.id) AS total_votes,
  ROUND(AVG(r.score), 2) AS avg_score,
  'same' AS criteria_mode
FROM event_items i
CROSS JOIN event_criteria c
LEFT JOIN event_ratings r ON r.item_id = i.id AND r.criteria_id = c.id
LEFT JOIN attendees a ON a.id = r.attendee_id AND a.completed_at IS NOT NULL
WHERE i.event_id = c.event_id
GROUP BY i.id, i.name, i.slug, i.event_id, c.id, c.label

UNION ALL

-- Different criteria mode
SELECT
  i.id AS item_id,
  i.name AS item_name,
  i.slug AS item_slug,
  i.event_id,
  ic.id AS criteria_id,
  ic.label AS criteria_label,
  COUNT(r.id) AS total_votes,
  ROUND(AVG(r.score), 2) AS avg_score,
  'different' AS criteria_mode
FROM event_items i
JOIN item_criteria ic ON ic.item_id = i.id
LEFT JOIN event_ratings r ON r.item_id = i.id AND r.item_criteria_id = ic.id
LEFT JOIN attendees a ON a.id = r.attendee_id AND a.completed_at IS NOT NULL
GROUP BY i.id, i.name, i.slug, i.event_id, ic.id, ic.label
ORDER BY item_name, criteria_label;

-- 9. Updated leaderboard view (already works with both modes via union above)
-- This one aggregates scores regardless of criteria mode
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
