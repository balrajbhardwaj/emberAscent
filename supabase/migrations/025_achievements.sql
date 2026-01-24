-- Migration 025: Achievements System
-- Creates tables for gamification achievements

-- Achievement definitions
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL, -- emoji or icon name
  criteria jsonb NOT NULL, -- conditions to unlock
  points integer NOT NULL DEFAULT 10,
  rarity text NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  category text NOT NULL, -- 'practice', 'streak', 'mastery', 'speed', etc.
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Child achievement unlocks
CREATE TABLE IF NOT EXISTS child_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  progress_data jsonb, -- for tracking partial progress
  UNIQUE(child_id, achievement_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_child_achievements_child_id ON child_achievements(child_id);
CREATE INDEX IF NOT EXISTS idx_child_achievements_unlocked_at ON child_achievements(unlocked_at);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements(rarity);

-- RLS Policies
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_achievements ENABLE ROW LEVEL SECURITY;

-- Everyone can view achievements
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (true);

-- Parents can view their children's achievements
CREATE POLICY "Parents can view their children's achievements"
  ON child_achievements FOR SELECT
  USING (
    child_id IN (
      SELECT id FROM children
      WHERE parent_id = auth.uid()
    )
  );

-- System can insert achievement unlocks
CREATE POLICY "System can insert achievement unlocks"
  ON child_achievements FOR INSERT
  WITH CHECK (true);

-- Admins have full access
CREATE POLICY "Admins have full access to achievements"
  ON achievements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins have full access to child_achievements"
  ON child_achievements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Seed initial achievements
INSERT INTO achievements (name, description, icon, criteria, points, rarity, category) VALUES
  ('First Flame', 'Complete your first practice session', '🔥', '{"sessions_completed": 1}', 10, 'common', 'practice'),
  ('Quick Starter', 'Answer 5 questions correctly in under 30 seconds each', '⚡', '{"quick_correct_answers": 5, "max_time": 30}', 15, 'common', 'speed'),
  ('Streak Guardian', 'Maintain a 7-day practice streak', '🛡️', '{"streak_days": 7}', 25, 'uncommon', 'streak'),
  ('Streak Warrior', 'Maintain a 14-day practice streak', '⚔️', '{"streak_days": 14}', 50, 'rare', 'streak'),
  ('Streak Legend', 'Maintain a 30-day practice streak', '👑', '{"streak_days": 30}', 100, 'epic', 'streak'),
  ('Practice Pioneer', 'Try all four subjects in one week', '🗺️', '{"subjects_tried": 4, "days": 7}', 20, 'uncommon', 'practice'),
  ('Century Club', 'Answer 100 questions correctly', '💯', '{"correct_answers": 100}', 30, 'uncommon', 'mastery'),
  ('Maths Master', 'Achieve 80%+ accuracy on 20 Maths questions', '🔢', '{"subject": "Maths", "accuracy": 0.8, "min_questions": 20}', 40, 'rare', 'mastery'),
  ('English Expert', 'Achieve 80%+ accuracy on 20 English questions', '📚', '{"subject": "English", "accuracy": 0.8, "min_questions": 20}', 40, 'rare', 'mastery'),
  ('VR Virtuoso', 'Achieve 80%+ accuracy on 20 Verbal Reasoning questions', '💬', '{"subject": "Verbal Reasoning", "accuracy": 0.8, "min_questions": 20}', 40, 'rare', 'mastery'),
  ('NVR Navigator', 'Achieve 80%+ accuracy on 20 Non-Verbal Reasoning questions', '🧩', '{"subject": "Non-Verbal Reasoning", "accuracy": 0.8, "min_questions": 20}', 40, 'rare', 'mastery'),
  ('Challenge Champion', 'Answer 10 Challenge difficulty questions correctly', '🏆', '{"difficulty": "Challenge", "correct_answers": 10}', 35, 'rare', 'mastery'),
  ('Speed Demon', 'Complete 20 questions with average time under 45 seconds', '🏃', '{"questions": 20, "avg_time": 45}', 30, 'uncommon', 'speed'),
  ('Perfect Session', 'Complete a session with 100% accuracy (minimum 10 questions)', '⭐', '{"accuracy": 1.0, "min_questions": 10}', 45, 'rare', 'mastery'),
  ('Mock Test Taker', 'Complete your first mock test', '📝', '{"mock_tests_completed": 1}', 25, 'uncommon', 'practice'),
  ('High Achiever', 'Score 80%+ on a mock test', '🎯', '{"mock_test_score": 0.8}', 50, 'rare', 'mastery'),
  ('Mock Master', 'Complete 5 mock tests', '🎓', '{"mock_tests_completed": 5}', 75, 'epic', 'practice'),
  ('Consistency King', 'Practice 5 days in a row', '📅', '{"consecutive_days": 5}', 20, 'uncommon', 'streak'),
  ('Early Bird', 'Complete a session before 9am', '🌅', '{"session_before_hour": 9}', 15, 'common', 'practice'),
  ('Night Owl', 'Complete a session after 8pm', '🦉', '{"session_after_hour": 20}', 15, 'common', 'practice')
ON CONFLICT DO NOTHING;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements_for_child(p_child_id uuid, p_criteria jsonb)
RETURNS SETOF achievements AS $$
BEGIN
  RETURN QUERY
  SELECT a.*
  FROM achievements a
  WHERE NOT EXISTS (
    SELECT 1 FROM child_achievements ca
    WHERE ca.child_id = p_child_id
    AND ca.achievement_id = a.id
  )
  -- Criteria matching would be done in application layer
  -- This function just returns unlockable achievements
  ORDER BY a.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_achievement_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_achievements_timestamp
  BEFORE UPDATE ON achievements
  FOR EACH ROW
  EXECUTE FUNCTION update_achievement_timestamp();
