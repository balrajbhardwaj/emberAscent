/**
 * Ember Ascent - Database Type Definitions
 * Auto-generated types can replace this file using:
 * npx supabase gen types typescript --linked > types/database.ts
 */

// =============================================================================
// ENUMS
// =============================================================================

export enum Subject {
  VerbalReasoning = 'verbal_reasoning',
  English = 'english',
  Mathematics = 'mathematics',
}

export enum Difficulty {
  Foundation = 'foundation',
  Standard = 'standard',
  Challenge = 'challenge',
}

export enum SessionType {
  Quick = 'quick',
  Focus = 'focus',
  Mock = 'mock',
}

export enum SubscriptionTier {
  Free = 'free',
  Ascent = 'ascent',
  Summit = 'summit',
}

export enum SubscriptionStatus {
  Active = 'active',
  Cancelled = 'cancelled',
  PastDue = 'past_due',
  Trialing = 'trialing',
}

export enum ExamBoard {
  GL = 'gl',
  CEM = 'cem',
  ISEB = 'iseb',
  Generic = 'generic',
}

export enum ReportType {
  IncorrectAnswer = 'incorrect_answer',
  Unclear = 'unclear',
  Typo = 'typo',
  Inappropriate = 'inappropriate',
  Other = 'other',
}

export enum ReportStatus {
  Pending = 'pending',
  Reviewed = 'reviewed',
  Fixed = 'fixed',
  Dismissed = 'dismissed',
}

export enum ExplanationStyle {
  StepByStep = 'step_by_step',
  Visual = 'visual',
  WorkedExample = 'worked_example',
}

// =============================================================================
// NESTED TYPES
// =============================================================================

export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuestionExplanations {
  step_by_step: string;
  visual: string;
  worked_example: string;
}

export interface EmberScoreBreakdown {
  curriculumAlignment: number;
  expertVerification: number;
  communityFeedback: number;
}

// =============================================================================
// TABLE TYPES
// =============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  year_group: 4 | 5 | 6 | null;
  target_school: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  subject: Subject;
  topic: string;
  subtopic: string | null;
  question_type: string | null;
  question_text: string;
  options: QuestionOption[];
  correct_answer: string;
  explanations: QuestionExplanations;
  difficulty: Difficulty;
  year_group: 4 | 5 | 6 | null;
  curriculum_reference: string | null;
  exam_board: ExamBoard;
  review_status: 'reviewed' | 'spot_checked' | 'ai_only';
  ember_score: number;
  ember_score_breakdown: EmberScoreBreakdown | null;
  helpful_count: number;
  practice_count: number;
  is_published: boolean;
  created_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PracticeSession {
  id: string;
  child_id: string;
  session_type: SessionType;
  subject: Subject | null;
  topic: string | null;
  started_at: string;
  completed_at: string | null;
  total_questions: number;
  correct_answers: number;
  created_at: string;
}

export interface QuestionAttempt {
  id: string;
  session_id: string;
  child_id: string;
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
  time_taken_seconds: number;
  explanation_viewed: ExplanationStyle | null;
  flagged_for_review: boolean;
  created_at: string;
}

export interface ErrorReport {
  id: string;
  question_id: string;
  reported_by: string;
  report_type: ReportType;
  description: string;
  status: ReportStatus;
  reviewed_by: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// VIEW TYPES
// =============================================================================

export interface ChildProgressSummary {
  child_id: string;
  child_name: string;
  parent_id: string;
  total_sessions: number;
  total_questions_answered: number;
  correct_answers: number;
  accuracy_percentage: number;
  last_practice_date: string | null;
}

// =============================================================================
// INSERT TYPES (omit auto-generated fields)
// =============================================================================

export type ProfileInsert = Omit<
  Profile,
  'id' | 'created_at' | 'updated_at'
> & {
  id: string; // Required as it comes from auth.users
};

export type ChildInsert = Omit<Child, 'id' | 'created_at' | 'updated_at'>;

export type QuestionInsert = Omit<
  Question,
  'id' | 'created_at' | 'updated_at'
>;

export type PracticeSessionInsert = Omit<
  PracticeSession,
  'id' | 'created_at'
>;

export type QuestionAttemptInsert = Omit<QuestionAttempt, 'id' | 'created_at'>;

export type ErrorReportInsert = Omit<
  ErrorReport,
  'id' | 'created_at' | 'updated_at'
>;

// =============================================================================
// UPDATE TYPES (partial of insert types)
// =============================================================================

export type ProfileUpdate = Partial<
  Omit<ProfileInsert, 'id' | 'email'>
>;

export type ChildUpdate = Partial<ChildInsert>;

export type QuestionUpdate = Partial<QuestionInsert>;

export type PracticeSessionUpdate = Partial<PracticeSessionInsert>;

export type QuestionAttemptUpdate = Partial<QuestionAttemptInsert>;

export type ErrorReportUpdate = Partial<
  Omit<ErrorReportInsert, 'question_id' | 'reported_by'>
>;

// =============================================================================
// QUERY RESULT TYPES (with relations)
// =============================================================================

export interface ChildWithProfile extends Child {
  profile: Profile;
}

export interface PracticeSessionWithChild extends PracticeSession {
  child: Child;
}

export interface PracticeSessionWithDetails extends PracticeSession {
  child: Child;
  attempts: QuestionAttempt[];
}

export interface QuestionAttemptWithQuestion extends QuestionAttempt {
  question: Question;
}

export interface QuestionAttemptWithRelations extends QuestionAttempt {
  question: Question;
  session: PracticeSession;
  child: Child;
}

export interface ErrorReportWithQuestion extends ErrorReport {
  question: Question;
  reporter: Profile;
}

// =============================================================================
// FILTER TYPES (for API queries)
// =============================================================================

export interface QuestionFilters {
  subject?: Subject;
  difficulty?: Difficulty;
  year_group?: 4 | 5 | 6;
  topic?: string;
  exam_board?: ExamBoard;
  min_ember_score?: number;
}

export interface PracticeSessionFilters {
  child_id?: string;
  session_type?: SessionType;
  subject?: Subject;
  completed?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface ChildProgressFilters {
  parent_id?: string;
  year_group?: 4 | 5 | 6;
  min_accuracy?: number;
}

// =============================================================================
// SUPABASE DATABASE TYPE (for generated types compatibility)
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      children: {
        Row: Child;
        Insert: ChildInsert;
        Update: ChildUpdate;
      };
      questions: {
        Row: Question;
        Insert: QuestionInsert;
        Update: QuestionUpdate;
      };
      practice_sessions: {
        Row: PracticeSession;
        Insert: PracticeSessionInsert;
        Update: PracticeSessionUpdate;
      };
      question_attempts: {
        Row: QuestionAttempt;
        Insert: QuestionAttemptInsert;
        Update: QuestionAttemptUpdate;
      };
      error_reports: {
        Row: ErrorReport;
        Insert: ErrorReportInsert;
        Update: ErrorReportUpdate;
      };
    };
    Views: {
      child_progress_summary: {
        Row: ChildProgressSummary;
      };
    };
    Functions: {
      is_parent_of: {
        Args: { child_id: string };
        Returns: boolean;
      };
      owns_session: {
        Args: { session_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      subject: Subject;
      difficulty: Difficulty;
      session_type: SessionType;
      subscription_tier: SubscriptionTier;
      subscription_status: SubscriptionStatus;
      exam_board: ExamBoard;
      report_type: ReportType;
      report_status: ReportStatus;
      explanation_style: ExplanationStyle;
    };
  };
}

