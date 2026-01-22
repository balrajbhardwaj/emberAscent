/**
 * Ember Ascent - Main Type Exports
 * This file re-exports database types and adds application-level types
 */

// =============================================================================
// RE-EXPORT DATABASE TYPES
// =============================================================================

export * from './database';
export type { Database, Json } from './database';

// =============================================================================
// APPLICATION-LEVEL TYPES
// =============================================================================

// API Response types
export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

// Pagination types
export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
}

export interface Session {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
}

// Practice types
export interface PracticeConfig {
  session_type: 'quick' | 'focus' | 'mock';
  subject?: 'verbal_reasoning' | 'english' | 'mathematics';
  topic?: string;
  difficulty?: 'foundation' | 'standard' | 'challenge';
  year_group?: 3 | 4 | 5 | 6;
  question_count?: number;
}

export interface PracticeQuestion {
  id: string;
  question_text: string;
  options: { id: string; text: string }[];
  difficulty: string;
  ember_score: number;
}

export interface AnswerSubmission {
  session_id: string;
  question_id: string;
  selected_answer: string;
  time_taken_seconds: number;
}

// Analytics types
export interface TopicPerformance {
  topic: string;
  subject: string;
  total_attempts: number;
  correct_attempts: number;
  accuracy: number;
  avg_time_seconds: number;
}

export interface WeeklyProgress {
  week_start: string;
  sessions_completed: number;
  questions_answered: number;
  accuracy: number;
}

export interface StrengthsWeaknesses {
  strengths: TopicPerformance[];
  weaknesses: TopicPerformance[];
  improving: TopicPerformance[];
}

// Dashboard types (Ascent tier)
export interface DashboardStats {
  total_sessions: number;
  total_questions: number;
  overall_accuracy: number;
  current_streak: number;
  weekly_progress: WeeklyProgress[];
  topic_performance: TopicPerformance[];
  recent_sessions: Array<{
    id: string;
    date: string;
    type: string;
    score: number;
  }>;
}

// Subscription types
export interface SubscriptionInfo {
  tier: 'free' | 'ascent' | 'summit';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  current_period_end?: string;
  cancel_at_period_end: boolean;
}

export interface FeatureAccess {
  can_access_analytics: boolean;
  can_access_ai_tutor: boolean;
  can_create_children: number; // max number
  can_export_data: boolean;
}

// Form types
export interface ChildFormData {
  name: string;
  year_group: 3 | 4 | 5 | 6;
  target_school?: string;
}

export interface ProfileFormData {
  full_name: string;
  email: string;
}

export interface ErrorReportFormData {
  question_id: string;
  report_type: 'incorrect_answer' | 'unclear' | 'typo' | 'inappropriate' | 'other';
  description: string;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface ModalState {
  isOpen: boolean;
  data?: unknown;
}

// Question display types
export interface QuestionDisplay {
  question: PracticeQuestion;
  selectedAnswer?: string;
  isAnswered: boolean;
  isCorrect?: boolean;
  showExplanation: boolean;
}

// Progress tracking
export interface SessionProgress {
  current_question: number;
  total_questions: number;
  correct_count: number;
  time_elapsed_seconds: number;
}

// Export utility types
export type WithId<T> = T & { id: string };
export type WithTimestamps<T> = T & {
  created_at: string;
  updated_at: string;
};
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

