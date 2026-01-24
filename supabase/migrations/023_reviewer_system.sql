-- Migration: Reviewer Workflow System
-- Creates tables for reviewer role, assignments, and review submissions
-- Enables content quality assurance workflow

-- Reviewers table: retired teachers who review AI-generated questions
CREATE TABLE IF NOT EXISTS reviewers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT NOT NULL,
  qualifications TEXT,
  specializations TEXT[] DEFAULT '{}',
  hourly_rate DECIMAL(10, 2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
  questions_reviewed INTEGER DEFAULT 0,
  avg_review_time_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Review assignments: questions assigned to reviewers
CREATE TABLE IF NOT EXISTS review_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID REFERENCES reviewers(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'skipped')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review submissions: reviewer feedback and outcomes
CREATE TABLE IF NOT EXISTS review_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES review_assignments(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES reviewers(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('approved', 'needs_edit', 'rejected')),
  feedback TEXT,
  edits_made JSONB DEFAULT '{}',
  time_spent_seconds INTEGER,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_reviewers_user_id ON reviewers(user_id);
CREATE INDEX idx_reviewers_status ON reviewers(status);
CREATE INDEX idx_review_assignments_reviewer_id ON review_assignments(reviewer_id);
CREATE INDEX idx_review_assignments_status ON review_assignments(status);
CREATE INDEX idx_review_assignments_due_at ON review_assignments(due_at);
CREATE INDEX idx_review_submissions_reviewer_id ON review_submissions(reviewer_id);
CREATE INDEX idx_review_submissions_question_id ON review_submissions(question_id);
CREATE INDEX idx_review_submissions_outcome ON review_submissions(outcome);

-- RLS Policies

-- Reviewers: Users can read their own reviewer profile
ALTER TABLE reviewers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own reviewer profile"
  ON reviewers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviewers"
  ON reviewers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Review assignments: Reviewers can only see their own assignments
ALTER TABLE review_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviewers can see own assignments"
  ON review_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reviewers
      WHERE reviewers.id = review_assignments.reviewer_id
      AND reviewers.user_id = auth.uid()
    )
  );

CREATE POLICY "Reviewers can update own assignments"
  ON review_assignments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM reviewers
      WHERE reviewers.id = review_assignments.reviewer_id
      AND reviewers.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all assignments"
  ON review_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Review submissions: Reviewers can create and read their own submissions
ALTER TABLE review_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviewers can create own submissions"
  ON review_submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reviewers
      WHERE reviewers.id = review_submissions.reviewer_id
      AND reviewers.user_id = auth.uid()
    )
  );

CREATE POLICY "Reviewers can read own submissions"
  ON review_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reviewers
      WHERE reviewers.id = review_submissions.reviewer_id
      AND reviewers.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all submissions"
  ON review_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Function to update reviewer stats after submission
CREATE OR REPLACE FUNCTION update_reviewer_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update questions_reviewed count
  UPDATE reviewers
  SET 
    questions_reviewed = questions_reviewed + 1,
    avg_review_time_seconds = (
      SELECT AVG(time_spent_seconds)::INTEGER
      FROM review_submissions
      WHERE reviewer_id = NEW.reviewer_id
    ),
    updated_at = NOW()
  WHERE id = NEW.reviewer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats on submission
CREATE TRIGGER update_reviewer_stats_trigger
AFTER INSERT ON review_submissions
FOR EACH ROW
EXECUTE FUNCTION update_reviewer_stats();

-- Function to mark assignment as completed
CREATE OR REPLACE FUNCTION complete_review_assignment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE review_assignments
  SET 
    status = 'completed',
    completed_at = NEW.submitted_at,
    updated_at = NOW()
  WHERE id = NEW.assignment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to complete assignment on submission
CREATE TRIGGER complete_assignment_trigger
AFTER INSERT ON review_submissions
FOR EACH ROW
EXECUTE FUNCTION complete_review_assignment();
