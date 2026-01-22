-- Fix ambiguous child_id references in RLS policies
-- This addresses PostgreSQL error 42702: "column reference 'child_id' is ambiguous"

-- Drop existing policies
DROP POLICY IF EXISTS "Parents can view their children's performance" ON child_topic_performance;
DROP POLICY IF EXISTS "System can insert performance records" ON child_topic_performance;
DROP POLICY IF EXISTS "System can update performance records" ON child_topic_performance;
DROP POLICY IF EXISTS "Parents can view their children's history" ON child_question_history;
DROP POLICY IF EXISTS "System can insert history records" ON child_question_history;

-- Recreate policies with explicit table aliases to avoid ambiguity

-- child_topic_performance policies
CREATE POLICY "Parents can view their children's performance"
  ON child_topic_performance
  FOR SELECT
  USING (
    child_id IN (
      SELECT c.id FROM children c WHERE c.parent_id = auth.uid()
    )
  );

CREATE POLICY "System can insert performance records"
  ON child_topic_performance
  FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT c.id FROM children c WHERE c.parent_id = auth.uid()
    )
  );

CREATE POLICY "System can update performance records"
  ON child_topic_performance
  FOR UPDATE
  USING (
    child_id IN (
      SELECT c.id FROM children c WHERE c.parent_id = auth.uid()
    )
  );

-- child_question_history policies
CREATE POLICY "Parents can view their children's history"
  ON child_question_history
  FOR SELECT
  USING (
    child_id IN (
      SELECT c.id FROM children c WHERE c.parent_id = auth.uid()
    )
  );

CREATE POLICY "System can insert history records"
  ON child_question_history
  FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT c.id FROM children c WHERE c.parent_id = auth.uid()
    )
  );
