-- ============================================================
-- Fest Voting System — Complete Schema Setup
-- Run this ONCE in Supabase SQL Editor
-- ============================================================

-- 1. Drop old views first (they depend on ratings)
DROP VIEW IF EXISTS leaderboard_by_criteria;
DROP VIEW IF EXISTS leaderboard;

-- 2. Drop old ratings/feedback tables (old schema)
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS feedback;

-- 3. Criteria table
CREATE TABLE IF NOT EXISTS criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  min_score INT NOT NULL DEFAULT 1,
  max_score INT NOT NULL DEFAULT 5,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Seed initial criteria
INSERT INTO criteria (label, min_score, max_score, sort_order) VALUES
  ('How unique is the idea?', 1, 5, 1),
  ('How well is it presented?', 1, 5, 2)
ON CONFLICT DO NOTHING;

-- 5. Ratings table (new schema with criteria_id)
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stall_id UUID NOT NULL REFERENCES stalls(id) ON DELETE CASCADE,
  criteria_id UUID NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, stall_id, criteria_id)
);

-- 6. Feedback table (one feedback per user per stall)
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stall_id UUID NOT NULL REFERENCES stalls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, stall_id)
);

-- 7. Indexes for foreign key performance
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_stall_id ON ratings(stall_id);
CREATE INDEX idx_ratings_criteria_id ON ratings(criteria_id);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_stall_id ON feedback(stall_id);

-- 8. Leaderboard VIEW (overall average, completed users only)
CREATE OR REPLACE VIEW leaderboard WITH (security_invoker = on) AS
SELECT
  s.id AS stall_id,
  s.name AS stall_name,
  s.slug,
  COUNT(r.id) AS total_votes,
  ROUND(AVG(r.score), 2) AS average_score,
  SUM(r.score) AS total_score
FROM stalls s
LEFT JOIN ratings r ON r.stall_id = s.id
LEFT JOIN profiles p ON p.id = r.user_id
WHERE p.completed_at IS NOT NULL
GROUP BY s.id, s.name, s.slug
ORDER BY average_score DESC;

-- 9. Per-criterion leaderboard VIEW
CREATE OR REPLACE VIEW leaderboard_by_criteria WITH (security_invoker = on) AS
SELECT
  s.id AS stall_id,
  s.name AS stall_name,
  s.slug,
  c.id AS criteria_id,
  c.label AS criteria_label,
  COUNT(r.id) AS total_votes,
  ROUND(AVG(r.score), 2) AS avg_score
FROM stalls s
CROSS JOIN criteria c
LEFT JOIN ratings r ON r.stall_id = s.id AND r.criteria_id = c.id
LEFT JOIN profiles p ON p.id = r.user_id
WHERE p.completed_at IS NOT NULL
GROUP BY s.id, s.name, s.slug, c.id, c.label
ORDER BY s.name, c.sort_order;

-- 11. Fix function search path (if handle_new_user exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    EXECUTE 'ALTER FUNCTION handle_new_user() SET search_path = public';
  END IF;
END $$;

-- 12. RLS Policies
ALTER TABLE criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Profiles (if not already set up)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe re-run)
DROP POLICY IF EXISTS "Anyone can read criteria" ON criteria;
DROP POLICY IF EXISTS "Anyone can read ratings" ON ratings;
DROP POLICY IF EXISTS "Users can insert own ratings" ON ratings;
DROP POLICY IF EXISTS "Anyone can read feedback" ON feedback;
DROP POLICY IF EXISTS "Users can insert own feedback" ON feedback;
DROP POLICY IF EXISTS "Own profile read" ON profiles;
DROP POLICY IF EXISTS "Own profile update" ON profiles;

-- Criteria: anyone can read
CREATE POLICY "Anyone can read criteria" ON criteria
  FOR SELECT USING (true);

-- Ratings: anyone can read (needed for leaderboard views), users insert own only
CREATE POLICY "Anyone can read ratings" ON ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own ratings" ON ratings
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Feedback: anyone can read, users insert own only
CREATE POLICY "Anyone can read feedback" ON feedback
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own feedback" ON feedback
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Profiles: users read and update own only
CREATE POLICY "Own profile read" ON profiles
  FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Own profile update" ON profiles
  FOR UPDATE USING ((select auth.uid()) = id);
