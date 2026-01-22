# Ember Ascent - Database Schema

**Generated:** 2026-01-22T22:59:16.572Z

---

## Tables

| Table | Description |
|-------|-------------|
| `child_question_history` | Individual question attempt history for recency avoidance and analysis |
| `child_topic_performance` | Tracks adaptive difficulty and performance metrics per child per topic |
| `children` | Child/learner profiles - no direct login, accessed via parent |
| `content_attributions` | Tracks content sources and licensing information for OGL v3.0 compliance |
| `curriculum_objectives` | - |
| `error_reports` | Community feedback on question quality - feeds into ember_score calculation |
| `nps_surveys` | Net Promoter Score surveys for overall platform satisfaction |
| `practice_sessions` | Practice sessions group question attempts |
| `profiles` | Parent/guardian profiles - extends Supabase auth.users |
| `question_attempts` | Individual question answers - used for progress tracking and adaptive learning |
| `question_curriculum_alignment` | - |
| `question_feedback` | Individual question quality feedback (helpful/not helpful) |
| `question_provenance` | Audit log tracking the complete lifecycle of questions for transparency and compliance |
| `question_type_alignment` | - |
| `question_type_taxonomy` | - |
| `questions` | Question bank - only questions with ember_score >= 60 are served to users |
| `session_feedback` | Post-session experience feedback with ratings and suggestions |

## Table Definitions

### `child_question_history`

> Individual question attempt history for recency avoidance and analysis

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|----------|
| `id` | uuid | ✗ | `gen_random_uuid()` | - |
| `child_id` | uuid | ✗ | - | - |
| `question_id` | uuid | ✗ | - | - |
| `difficulty_at_attempt` | text | ✗ | - | - |
| `is_correct` | boolean | ✗ | - | - |
| `time_spent_seconds` | integer(32) | ✓ | - | - |
| `session_id` | uuid | ✓ | - | - |
| `topic_id` | text | ✗ | - | - |
| `subtopic_name` | text | ✓ | - | - |
| `selection_score` | numeric(5) | ✓ | - | - |
| `attempted_at` | timestamp with time zone | ✗ | `now()` | - |
| `created_at` | timestamp with time zone | ✗ | `now()` | - |

### `child_topic_performance`

> Tracks adaptive difficulty and performance metrics per child per topic

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|----------|
| `id` | uuid | ✗ | `gen_random_uuid()` | - |
| `child_id` | uuid | ✗ | - | - |
| `topic_id` | text | ✗ | - | - |
| `current_difficulty` | text | ✗ | `'foundation'::text` | - |
| `recent_correct` | integer(32) | ✗ | `0` | - |
| `recent_incorrect` | integer(32) | ✗ | `0` | - |
| `recent_total` | integer(32) | ✗ | `0` | - |
| `recent_accuracy` | numeric(5) | ✓ | - | - |
| `questions_since_last_adjustment` | integer(32) | ✗ | `0` | - |
| `total_questions_in_topic` | integer(32) | ✗ | `0` | - |
| `last_adjustment_at` | timestamp with time zone | ✓ | - | - |
| `adjustment_count` | integer(32) | ✗ | `0` | - |
| `total_correct` | integer(32) | ✗ | `0` | - |
| `total_incorrect` | integer(32) | ✗ | `0` | - |
| `total_attempts` | integer(32) | ✓ | - | - |
| `overall_accuracy` | numeric(5) | ✓ | - | - |
| `current_streak` | integer(32) | ✗ | `0` | - |
| `best_streak` | integer(32) | ✗ | `0` | - |
| `first_attempted_at` | timestamp with time zone | ✗ | `now()` | - |
| `last_attempted_at` | timestamp with time zone | ✗ | `now()` | - |
| `created_at` | timestamp with time zone | ✗ | `now()` | - |
| `updated_at` | timestamp with time zone | ✗ | `now()` | - |

### `children`

> Child/learner profiles - no direct login, accessed via parent

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|----------|
| `id` | uuid | ✗ | `uuid_generate_v4()` | - |
| `parent_id` | uuid | ✗ | - | - |
| `name` | text | ✗ | - | - |
| `year_group` | integer(32) | ✓ | - | UK school year: 3 (age 7-8), 4 (age 8-9), 5 (age 9-10), 6 (age 10-11) |
| `target_school` | text | ✓ | - | Optional: target grammar school name |
| `avatar_url` | text | ✓ | - | - |
| `is_active` | boolean | ✗ | `true` | Soft delete flag - inactive children hidden from UI |
| `created_at` | timestamp with time zone | ✗ | `now()` | - |
| `updated_at` | timestamp with time zone | ✗ | `now()` | - |

### `content_attributions`

> Tracks content sources and licensing information for OGL v3.0 compliance

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|----------|
| `id` | uuid | ✗ | `gen_random_uuid()` | - |
| `content_type` | text | ✗ | - | - |
| `content_id` | uuid | ✗ | - | - |
| `source_type` | text | ✗ | - | - |
| `source_details` | jsonb | ✗ | `'{}'::jsonb` | - |
| `license` | text | ✗ | `'OGL-3.0'::text` | - |
| `attribution_text` | text | ✓ | - | - |
| `created_at` | timestamp with time zone | ✓ | `now()` | - |

### `curriculum_objectives`

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|----------|
| `id` | uuid | ✗ | `gen_random_uuid()` | - |
| `running_number` | character varying(20) | ✓ | - | - |
| `code` | character varying(30) | ✗ | - | - |
| `dfe_code` | character varying(20) | ✓ | - | - |
| `subject` | character varying(50) | ✗ | - | - |
| `key_stage` | character varying(10) | ✗ | `'KS2'::character varying` | - |
| `year_group` | integer(32) | ✗ | - | - |
| `strand` | character varying(100) | ✗ | - | - |
| `sub_strand` | character varying(100) | ✓ | - | - |
| `objective_text` | text | ✗ | - | - |
| `keywords` | ARRAY | ✓ | - | - |
| `statutory` | boolean | ✓ | `true` | - |
| `source_document` | character varying(255) | ✓ | - | - |
| `source_link` | character varying(255) | ✓ | - | - |
| `source_page` | integer(32) | ✓ | - | - |
| `created_at` | timestamp with time zone | ✓ | `now()` | - |
| `updated_at` | timestamp with time zone | ✓ | `now()` | - |

### `error_reports`

> Community feedback on question quality - feeds into ember_score calculation

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|----------|
| `id` | uuid | ✗ | `uuid_generate_v4()` | - |
| `question_id` | uuid | ✗ | - | - |
| `reported_by` | uuid | ✗ | - | - |
| `report_type` | text | ✗ | - | - |
| `description` | text | ✗ | - | - |
| `status` | text | ✗ | `'pending'::text` | pending: new | reviewed: admin seen | fixed: question updated | dismissed: not an issue |
| `reviewed_by` | uuid | ✓ | - | - |
| `admin_notes` | text | ✓ | - | - |
| `created_at` | timestamp with time zone | ✗ | `now()` | - |
| `updated_at` | timestamp with time zone | ✗ | `now()` | - |

### `nps_surveys`

> Net Promoter Score surveys for overall platform satisfaction

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|----------|
| `id` | uuid | ✗ | `gen_random_uuid()` | - |
| `parent_id` | uuid | ✗ | - | - |
| `child_id` | uuid | ✓ | - | - |
| `score` | integer(32) | ✗ | - | - |
| `segment` | text | ✓ | - | - |
| `feedback_text` | text | ✓ | - | - |
| `trigger_type` | text | ✗ | - | - |
| `total_sessions_at_time` | integer(32) | ✗ | `0` | - |
| `created_at` | timestamp with time zone | ✗ | `now()` | - |

### `practice_sessions`

> Practice sessions group question attempts

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|----------|
| `id` | uuid | ✗ | `uuid_generate_v4()` | - |
| `child_id` | uuid | ✗ | - | - |
| `session_type` | text | ✗ | - | quick: 10 questions | focus: topic-specific | mock: timed exam simulation | quick_byte: 4 quick questions on home page (daily) |
| `subject` | text | ✓ | - | - |
| `topic` | text | ✓ | - | - |
| `started_at` | timestamp with time zone | ✗ | `now()` | - |
| `completed_at` | timestamp with time zone | ✓ | - | NULL = in progress |
| `total_questions` | integer(32) | ✗ | `0` | - |
| `correct_answers` | integer(32) | ✗ | `0` | - |
| `created_at` | timestamp with time zone | ✗ | `now()` | - |

### `profiles`

> Parent/guardian profiles - extends Supabase auth.users

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|----------|
| `id` | uuid | ✗ | - | - |
| `email` | text | ✗ | - | - |
| `full_name` | text | ✓ | - | - |
| `subscription_tier` | text | ✗ | `'free'::text` | free: basic access | ascent: analytics dashboard | summit: AI tutor (future) |
| `subscription_status` | text | ✗ | `'active'::text` | Stripe subscription status |
| `stripe_customer_id` | text | ✓ | - | - |
| `stripe_subscription_id` | text | ✓ | - | - |
| `created_at` | timestamp with time zone | ✗ | `now()` | - |
| `updated_at` | timestamp with time zone | ✗ | `now()` | - |

### `question_attempts`

> Individual question answers - used for progress tracking and adaptive learning

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|----------|
| `id` | uuid | ✗ | `uuid_generate_v4()` | - |
| `session_id` | uuid | ✗ | - | - |
| `child_id` | uuid | ✗ | - | - |
| `question_id` | uuid | ✗ | - | - |
| `selected_answer` | text | ✗ | - | - |
| `is_correct` | boolean | ✗ | - | - |
| `time_taken_seconds` | integer(32) | ✗ | - | - |
| `explanation_viewed` | text | ✓ | - | Which explanation style the child viewed (if any) |
| `flagged_for_review` | boolean | ✗ | `false` | Child marked for later review |
| `created_at` | timestamp with time zone | ✗ | `now()` | - |

### `question_curriculum_alignment`

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|----------|
| `id` | uuid | ✗ | `gen_random_uuid()` | - |
| `question_id` | uuid | ✗ | - | - |
| `objective_id` | uuid | ✗ | - | - |
| `alignment_strength` | character varying(20) | ✓ | `'primary'::character varying` | - |
| `alignment_confidence` | integer(32) | ✓ | - | - |
| `validated_by` | character varying(50) | ✓ | - | - |
| `validated_at` | timestamp with time zone | ✓ | - | - |
| `validator_notes` | text | ✓ | - | - |
| `created_at` | timestamp with time zone | ✓ | `now()` | - |

### `question_feedback`

> Individual question quality feedback (helpful/not helpful)

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|----------|
| `id` | uuid | ✗ | `gen_random_uuid()` | - |
| `question_id` | uuid | ✗ | - | - |
| `child_id` | uuid | ✗ | - | - |
| `parent_id` | uuid | ✗ | - | - |
| `is_helpful` | boolean | ✗ | - | - |
| `feedback_text` | text | ✓ | - | - |
| `issue_type` | text | ✓ | - | - |
| `session_id` | uuid | ✓ | - | - |
| `created_at` | timestamp with time zone | ✗ | `now()` | - |

### `question_provenance`

> Audit log tracking the complete lifecycle of questions for transparency and compliance

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|----------|
| `id` | uuid | ✗ | `gen_random_uuid()` | - |
| `question_id` | uuid | ✗ | - | - |
| `event_type` | text | ✗ | - | - |
| `event_data` | jsonb | ✗ | `'{}'::jsonb` | - |
| `actor_id` | uuid | ✓ | - | - |
| `actor_type` | text | ✓ | - | - |
| `occurred_at` | timestamp with time zone | ✓ | `now()` | - |

### `question_type_alignment`

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|----------|
| `id` | uuid | ✗ | `gen_random_uuid()` | - |
| `question_id` | uuid | ✗ | - | - |
| `type_id` | uuid | ✗ | - | - |
| `created_at` | timestamp with time zone | ✓ | `now()` | - |

### `question_type_taxonomy`

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|----------|
| `id` | uuid | ✗ | `gen_random_uuid()` | - |
| `code` | character varying(30) | ✗ | - | - |
| `category` | character varying(50) | ✗ | - | - |
| `exam_board` | character varying(20) | ✗ | - | - |
| `type_name` | character varying(100) | ✗ | - | - |
| `type_description` | text | ✓ | - | - |
| `difficulty_range` | character varying(50) | ✓ | - | - |
| `typical_age_range` | character varying(20) | ✓ | - | - |
| `keywords` | ARRAY | ✓ | - | - |
| `created_at` | timestamp with time zone | ✓ | `now()` | - |

### `questions`

> Question bank - only questions with ember_score >= 60 are served to users

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|----------|
| `id` | uuid | ✗ | `uuid_generate_v4()` | - |
| `subject` | text | ✗ | - | - |
| `topic` | text | ✗ | - | - |
| `subtopic` | text | ✓ | - | - |
| `question_type` | text | ✓ | - | - |
| `question_text` | text | ✗ | - | - |
| `options` | jsonb | ✗ | - | - |
| `correct_answer` | text | ✗ | - | - |
| `explanations` | jsonb | ✗ | - | Three explanation styles for different learning preferences |
| `difficulty` | text | ✗ | - | foundation: easier questions for building confidence | standard: aligned with typical exam difficulty | challenge: harder questions for stretch and extension |
| `year_group` | integer(32) | ✓ | - | UK school year: 3 (age 7-8), 4 (age 8-9), 5 (age 9-10), 6 (age 10-11) |
| `curriculum_reference` | text | ✓ | - | - |
| `exam_board` | text | ✗ | `'generic'::text` | GL Assessment, CEM, ISEB, or generic (default for imported questions) |
| `ember_score` | integer(32) | ✗ | `66` | 0-100 quality score: 60+ required for publishing. Default 66 for verified imports. |
| `ember_score_breakdown` | jsonb | ✓ | - | - |
| `is_published` | boolean | ✗ | `false` | - |
| `created_by` | uuid | ✓ | `'a0000000-0000-0000-0000-000000000001'::...` | Content creator/admin. Defaults to system import profile. |
| `reviewed_by` | uuid | ✓ | - | - |
| `reviewed_at` | timestamp with time zone | ✓ | - | - |
| `created_at` | timestamp with time zone | ✗ | `now()` | - |
| `updated_at` | timestamp with time zone | ✗ | `now()` | - |
| `review_status` | text | ✓ | `'ai_only'::text` | Expert review status: reviewed (full review), spot_checked (quick verification), ai_only (no human review yet) |
| `helpful_count` | integer(32) | ✗ | `0` | - |
| `not_helpful_count` | integer(32) | ✗ | `0` | - |
| `primary_curriculum_code` | character varying(30) | ✓ | - | Primary curriculum objective code (e.g., Y5-MATH-F-03) or question type code (e.g., VR-GL-SYN) |
| `external_id` | character varying(50) | ✓ | - | Original question ID from import source (e.g., ENG-VOC-syno-F-Y3-00001). Used for deduplication during imports. |

### `session_feedback`

> Post-session experience feedback with ratings and suggestions

| Column | Type | Nullable | Default | Comment |
|--------|------|----------|---------|----------|
| `id` | uuid | ✗ | `gen_random_uuid()` | - |
| `session_id` | uuid | ✗ | - | - |
| `child_id` | uuid | ✗ | - | - |
| `parent_id` | uuid | ✗ | - | - |
| `rating` | integer(32) | ✗ | - | - |
| `positive_feedback` | text | ✓ | - | - |
| `improvement_suggestions` | text | ✓ | - | - |
| `difficulty_appropriate` | boolean | ✓ | - | - |
| `explanations_helpful` | boolean | ✓ | - | - |
| `would_recommend` | boolean | ✓ | - | - |
| `created_at` | timestamp with time zone | ✗ | `now()` | - |

## Primary Keys

| Table | Column |
|-------|--------|
| `child_question_history` | `id` |
| `child_topic_performance` | `id` |
| `children` | `id` |
| `content_attributions` | `id` |
| `curriculum_objectives` | `id` |
| `error_reports` | `id` |
| `nps_surveys` | `id` |
| `practice_sessions` | `id` |
| `profiles` | `id` |
| `question_attempts` | `id` |
| `question_curriculum_alignment` | `id` |
| `question_feedback` | `id` |
| `question_provenance` | `id` |
| `question_type_alignment` | `id` |
| `question_type_taxonomy` | `id` |
| `questions` | `id` |
| `session_feedback` | `id` |

## Foreign Key Relationships

| From Table | From Column | → | To Table | To Column |
|------------|-------------|---|----------|------------|
| `child_question_history` | `session_id` | → | `practice_sessions` | `id` |
| `child_question_history` | `question_id` | → | `questions` | `id` |
| `child_question_history` | `child_id` | → | `children` | `id` |
| `child_topic_performance` | `child_id` | → | `children` | `id` |
| `children` | `parent_id` | → | `profiles` | `id` |
| `error_reports` | `reported_by` | → | `profiles` | `id` |
| `error_reports` | `question_id` | → | `questions` | `id` |
| `error_reports` | `reviewed_by` | → | `profiles` | `id` |
| `nps_surveys` | `child_id` | → | `children` | `id` |
| `practice_sessions` | `child_id` | → | `children` | `id` |
| `question_attempts` | `question_id` | → | `questions` | `id` |
| `question_attempts` | `session_id` | → | `practice_sessions` | `id` |
| `question_attempts` | `child_id` | → | `children` | `id` |
| `question_curriculum_alignment` | `objective_id` | → | `curriculum_objectives` | `id` |
| `question_curriculum_alignment` | `question_id` | → | `questions` | `id` |
| `question_feedback` | `session_id` | → | `practice_sessions` | `id` |
| `question_feedback` | `child_id` | → | `children` | `id` |
| `question_feedback` | `question_id` | → | `questions` | `id` |
| `question_provenance` | `question_id` | → | `questions` | `id` |
| `question_type_alignment` | `type_id` | → | `question_type_taxonomy` | `id` |
| `question_type_alignment` | `question_id` | → | `questions` | `id` |
| `questions` | `created_by` | → | `profiles` | `id` |
| `questions` | `reviewed_by` | → | `profiles` | `id` |
| `session_feedback` | `session_id` | → | `practice_sessions` | `id` |
| `session_feedback` | `child_id` | → | `children` | `id` |

## Check Constraints

| Table | Constraint | Check Clause |
|-------|------------|---------------|
| `child_question_history` | valid_attempt_difficulty | `(difficulty_at_attempt = ANY (ARRAY['foundation'::text, 'sta...` |
| `child_topic_performance` | valid_difficulty | `(current_difficulty = ANY (ARRAY['foundation'::text, 'standa...` |
| `children` | valid_name | `(length(TRIM(BOTH FROM name)) >= 2)` |
| `children` | children_year_group_check | `(year_group = ANY (ARRAY[3, 4, 5, 6]))` |
| `content_attributions` | valid_content_type | `(content_type = ANY (ARRAY['question'::text, 'explanation'::...` |
| `content_attributions` | valid_source_type | `(source_type = ANY (ARRAY['ai_generated'::text, 'curriculum_...` |
| `curriculum_objectives` | curriculum_objectives_year_group_check | `((year_group >= 3) AND (year_group <= 6))` |
| `error_reports` | valid_description | `(length(TRIM(BOTH FROM description)) >= 10)` |
| `error_reports` | error_reports_report_type_check | `(report_type = ANY (ARRAY['incorrect_answer'::text, 'unclear...` |
| `error_reports` | error_reports_status_check | `(status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'fix...` |
| `nps_surveys` | nps_surveys_trigger_type_check | `(trigger_type = ANY (ARRAY['session_10'::text, 'session_30':...` |
| `nps_surveys` | nps_surveys_score_check | `((score >= 0) AND (score <= 10))` |
| `practice_sessions` | practice_sessions_session_type_check | `(session_type = ANY (ARRAY['quick'::text, 'focus'::text, 'mo...` |
| `practice_sessions` | practice_sessions_subject_check | `(subject = ANY (ARRAY['verbal_reasoning'::text, 'english'::t...` |
| `profiles` | profiles_subscription_status_check | `(subscription_status = ANY (ARRAY['active'::text, 'cancelled...` |
| `profiles` | profiles_subscription_tier_check | `(subscription_tier = ANY (ARRAY['free'::text, 'ascent'::text...` |
| `question_attempts` | question_attempts_time_taken_seconds_check | `(time_taken_seconds >= 0)` |
| `question_attempts` | question_attempts_explanation_viewed_check | `(explanation_viewed = ANY (ARRAY['step_by_step'::text, 'visu...` |
| `question_curriculum_alignment` | question_curriculum_alignment_alignment_confidence_check | `((alignment_confidence >= 0) AND (alignment_confidence <= 10...` |
| `question_feedback` | question_feedback_issue_type_check | `(issue_type = ANY (ARRAY['unclear'::text, 'incorrect'::text,...` |
| `question_provenance` | valid_event_type | `(event_type = ANY (ARRAY['created'::text, 'modified'::text, ...` |
| `questions` | questions_review_status_check | `(review_status = ANY (ARRAY['reviewed'::text, 'spot_checked'...` |
| `questions` | questions_difficulty_check | `(difficulty = ANY (ARRAY['foundation'::text, 'standard'::tex...` |
| `questions` | questions_subject_check | `(subject = ANY (ARRAY['verbal_reasoning'::text, 'english'::t...` |
| `questions` | questions_year_group_check | `(year_group = ANY (ARRAY[3, 4, 5, 6]))` |
| `questions` | valid_options | `(jsonb_array_length(options) = 5)` |
| `questions` | valid_ember_score | `((is_published = false) OR (ember_score >= 60))` |
| `questions` | questions_ember_score_check | `((ember_score >= 0) AND (ember_score <= 100))` |
| `questions` | questions_exam_board_check | `(exam_board = ANY (ARRAY['gl'::text, 'cem'::text, 'iseb'::te...` |
| `session_feedback` | session_feedback_rating_check | `((rating >= 1) AND (rating <= 5))` |

## Unique Constraints

| Table | Constraint | Columns |
|-------|------------|----------|
| `child_question_history` | child_question_history_child_id_question_id_session_id_key | `child_id, question_id, session_id` |
| `child_topic_performance` | child_topic_performance_child_id_topic_id_key | `child_id, topic_id` |
| `curriculum_objectives` | curriculum_objectives_code_key | `code` |
| `profiles` | profiles_email_key | `email` |
| `profiles` | profiles_stripe_customer_id_key | `stripe_customer_id` |
| `question_curriculum_alignment` | question_curriculum_alignment_question_id_objective_id_key | `question_id, objective_id` |
| `question_type_alignment` | question_type_alignment_question_id_type_id_key | `question_id, type_id` |
| `question_type_taxonomy` | question_type_taxonomy_code_key | `code` |

## Indexes

- **idx_child_daily_stats_child_date** on `child_daily_stats`
  ```sql
  CREATE INDEX idx_child_daily_stats_child_date ON public.child_daily_stats USING btree (child_id, practice_date)
  ```
- **idx_child_daily_stats_subject** on `child_daily_stats`
  ```sql
  CREATE INDEX idx_child_daily_stats_subject ON public.child_daily_stats USING btree (subject)
  ```
- **idx_child_daily_stats_unique** on `child_daily_stats`
  ```sql
  CREATE UNIQUE INDEX idx_child_daily_stats_unique ON public.child_daily_stats USING btree (child_id, practice_date, subject)
  ```
- **child_question_history_child_id_question_id_session_id_key** on `child_question_history`
  ```sql
  CREATE UNIQUE INDEX child_question_history_child_id_question_id_session_id_key ON public.child_question_history USING btree (child_id, question_id, session_id)
  ```
- **child_question_history_pkey** on `child_question_history`
  ```sql
  CREATE UNIQUE INDEX child_question_history_pkey ON public.child_question_history USING btree (id)
  ```
- **idx_question_history_attempted** on `child_question_history`
  ```sql
  CREATE INDEX idx_question_history_attempted ON public.child_question_history USING btree (attempted_at DESC)
  ```
- **idx_question_history_child** on `child_question_history`
  ```sql
  CREATE INDEX idx_question_history_child ON public.child_question_history USING btree (child_id)
  ```
- **idx_question_history_child_topic** on `child_question_history`
  ```sql
  CREATE INDEX idx_question_history_child_topic ON public.child_question_history USING btree (child_id, topic_id)
  ```
- **idx_question_history_question** on `child_question_history`
  ```sql
  CREATE INDEX idx_question_history_question ON public.child_question_history USING btree (question_id)
  ```
- **idx_question_history_session** on `child_question_history`
  ```sql
  CREATE INDEX idx_question_history_session ON public.child_question_history USING btree (session_id)
  ```
- **idx_question_history_topic** on `child_question_history`
  ```sql
  CREATE INDEX idx_question_history_topic ON public.child_question_history USING btree (topic_id)
  ```
- **idx_child_subject_summary_child** on `child_subject_summary`
  ```sql
  CREATE INDEX idx_child_subject_summary_child ON public.child_subject_summary USING btree (child_id)
  ```
- **idx_child_subject_summary_unique** on `child_subject_summary`
  ```sql
  CREATE UNIQUE INDEX idx_child_subject_summary_unique ON public.child_subject_summary USING btree (child_id, subject)
  ```
- **idx_child_topic_mastery_child** on `child_topic_mastery`
  ```sql
  CREATE INDEX idx_child_topic_mastery_child ON public.child_topic_mastery USING btree (child_id)
  ```
- **idx_child_topic_mastery_needs_focus** on `child_topic_mastery`
  ```sql
  CREATE INDEX idx_child_topic_mastery_needs_focus ON public.child_topic_mastery USING btree (child_id, needs_focus) WHERE (needs_focus = true)
  ```
- **idx_child_topic_mastery_unique** on `child_topic_mastery`
  ```sql
  CREATE UNIQUE INDEX idx_child_topic_mastery_unique ON public.child_topic_mastery USING btree (child_id, subject, topic)
  ```
- **child_topic_performance_child_id_topic_id_key** on `child_topic_performance`
  ```sql
  CREATE UNIQUE INDEX child_topic_performance_child_id_topic_id_key ON public.child_topic_performance USING btree (child_id, topic_id)
  ```
- **child_topic_performance_pkey** on `child_topic_performance`
  ```sql
  CREATE UNIQUE INDEX child_topic_performance_pkey ON public.child_topic_performance USING btree (id)
  ```
- **idx_topic_performance_child** on `child_topic_performance`
  ```sql
  CREATE INDEX idx_topic_performance_child ON public.child_topic_performance USING btree (child_id)
  ```
- **idx_topic_performance_difficulty** on `child_topic_performance`
  ```sql
  CREATE INDEX idx_topic_performance_difficulty ON public.child_topic_performance USING btree (current_difficulty)
  ```
- **idx_topic_performance_last_attempted** on `child_topic_performance`
  ```sql
  CREATE INDEX idx_topic_performance_last_attempted ON public.child_topic_performance USING btree (last_attempted_at DESC)
  ```
- **idx_topic_performance_topic** on `child_topic_performance`
  ```sql
  CREATE INDEX idx_topic_performance_topic ON public.child_topic_performance USING btree (topic_id)
  ```
- **idx_child_weekly_summary_child** on `child_weekly_summary`
  ```sql
  CREATE INDEX idx_child_weekly_summary_child ON public.child_weekly_summary USING btree (child_id)
  ```
- **idx_child_weekly_summary_unique** on `child_weekly_summary`
  ```sql
  CREATE UNIQUE INDEX idx_child_weekly_summary_unique ON public.child_weekly_summary USING btree (child_id, week_start)
  ```
- **children_pkey** on `children`
  ```sql
  CREATE UNIQUE INDEX children_pkey ON public.children USING btree (id)
  ```
- **idx_children_parent** on `children`
  ```sql
  CREATE INDEX idx_children_parent ON public.children USING btree (parent_id) WHERE (is_active = true)
  ```
- **idx_children_year_group** on `children`
  ```sql
  CREATE INDEX idx_children_year_group ON public.children USING btree (year_group)
  ```
- **content_attributions_pkey** on `content_attributions`
  ```sql
  CREATE UNIQUE INDEX content_attributions_pkey ON public.content_attributions USING btree (id)
  ```
- **idx_content_attributions_content** on `content_attributions`
  ```sql
  CREATE INDEX idx_content_attributions_content ON public.content_attributions USING btree (content_type, content_id)
  ```
- **curriculum_objectives_code_key** on `curriculum_objectives`
  ```sql
  CREATE UNIQUE INDEX curriculum_objectives_code_key ON public.curriculum_objectives USING btree (code)
  ```
- **curriculum_objectives_pkey** on `curriculum_objectives`
  ```sql
  CREATE UNIQUE INDEX curriculum_objectives_pkey ON public.curriculum_objectives USING btree (id)
  ```
- **idx_curriculum_objectives_code** on `curriculum_objectives`
  ```sql
  CREATE INDEX idx_curriculum_objectives_code ON public.curriculum_objectives USING btree (code)
  ```
- **idx_curriculum_objectives_keywords** on `curriculum_objectives`
  ```sql
  CREATE INDEX idx_curriculum_objectives_keywords ON public.curriculum_objectives USING gin (keywords)
  ```
- **idx_curriculum_objectives_strand** on `curriculum_objectives`
  ```sql
  CREATE INDEX idx_curriculum_objectives_strand ON public.curriculum_objectives USING btree (strand)
  ```
- **idx_curriculum_objectives_subject** on `curriculum_objectives`
  ```sql
  CREATE INDEX idx_curriculum_objectives_subject ON public.curriculum_objectives USING btree (subject)
  ```
- **idx_curriculum_objectives_year** on `curriculum_objectives`
  ```sql
  CREATE INDEX idx_curriculum_objectives_year ON public.curriculum_objectives USING btree (year_group)
  ```
- **error_reports_pkey** on `error_reports`
  ```sql
  CREATE UNIQUE INDEX error_reports_pkey ON public.error_reports USING btree (id)
  ```
- **idx_error_reports_pending** on `error_reports`
  ```sql
  CREATE INDEX idx_error_reports_pending ON public.error_reports USING btree (question_id) WHERE (status = 'pending'::text)
  ```
- **idx_error_reports_question** on `error_reports`
  ```sql
  CREATE INDEX idx_error_reports_question ON public.error_reports USING btree (question_id)
  ```
- **idx_error_reports_status** on `error_reports`
  ```sql
  CREATE INDEX idx_error_reports_status ON public.error_reports USING btree (status, created_at)
  ```
- **idx_nps_created** on `nps_surveys`
  ```sql
  CREATE INDEX idx_nps_created ON public.nps_surveys USING btree (created_at DESC)
  ```
- **idx_nps_parent** on `nps_surveys`
  ```sql
  CREATE INDEX idx_nps_parent ON public.nps_surveys USING btree (parent_id)
  ```
- **idx_nps_score** on `nps_surveys`
  ```sql
  CREATE INDEX idx_nps_score ON public.nps_surveys USING btree (score)
  ```
- **idx_nps_segment** on `nps_surveys`
  ```sql
  CREATE INDEX idx_nps_segment ON public.nps_surveys USING btree (segment)
  ```
- **nps_surveys_pkey** on `nps_surveys`
  ```sql
  CREATE UNIQUE INDEX nps_surveys_pkey ON public.nps_surveys USING btree (id)
  ```
- **idx_sessions_active** on `practice_sessions`
  ```sql
  CREATE INDEX idx_sessions_active ON public.practice_sessions USING btree (child_id) WHERE (completed_at IS NULL)
  ```
- **idx_sessions_child** on `practice_sessions`
  ```sql
  CREATE INDEX idx_sessions_child ON public.practice_sessions USING btree (child_id, created_at DESC)
  ```
- **idx_sessions_subject** on `practice_sessions`
  ```sql
  CREATE INDEX idx_sessions_subject ON public.practice_sessions USING btree (subject, session_type)
  ```
- **practice_sessions_pkey** on `practice_sessions`
  ```sql
  CREATE UNIQUE INDEX practice_sessions_pkey ON public.practice_sessions USING btree (id)
  ```
- **idx_profiles_subscription** on `profiles`
  ```sql
  CREATE INDEX idx_profiles_subscription ON public.profiles USING btree (subscription_tier, subscription_status)
  ```
- **profiles_email_key** on `profiles`
  ```sql
  CREATE UNIQUE INDEX profiles_email_key ON public.profiles USING btree (email)
  ```
- **profiles_pkey** on `profiles`
  ```sql
  CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id)
  ```
- **profiles_stripe_customer_id_key** on `profiles`
  ```sql
  CREATE UNIQUE INDEX profiles_stripe_customer_id_key ON public.profiles USING btree (stripe_customer_id)
  ```
- **idx_attempts_analytics** on `question_attempts`
  ```sql
  CREATE INDEX idx_attempts_analytics ON public.question_attempts USING btree (child_id, question_id, is_correct)
  ```
- **idx_attempts_child** on `question_attempts`
  ```sql
  CREATE INDEX idx_attempts_child ON public.question_attempts USING btree (child_id, created_at DESC)
  ```
- **idx_attempts_question** on `question_attempts`
  ```sql
  CREATE INDEX idx_attempts_question ON public.question_attempts USING btree (question_id)
  ```
- **idx_attempts_session** on `question_attempts`
  ```sql
  CREATE INDEX idx_attempts_session ON public.question_attempts USING btree (session_id)
  ```
- **question_attempts_pkey** on `question_attempts`
  ```sql
  CREATE UNIQUE INDEX question_attempts_pkey ON public.question_attempts USING btree (id)
  ```
- **idx_question_curriculum_objective** on `question_curriculum_alignment`
  ```sql
  CREATE INDEX idx_question_curriculum_objective ON public.question_curriculum_alignment USING btree (objective_id)
  ```
- **idx_question_curriculum_question** on `question_curriculum_alignment`
  ```sql
  CREATE INDEX idx_question_curriculum_question ON public.question_curriculum_alignment USING btree (question_id)
  ```
- **question_curriculum_alignment_pkey** on `question_curriculum_alignment`
  ```sql
  CREATE UNIQUE INDEX question_curriculum_alignment_pkey ON public.question_curriculum_alignment USING btree (id)
  ```
- **question_curriculum_alignment_question_id_objective_id_key** on `question_curriculum_alignment`
  ```sql
  CREATE UNIQUE INDEX question_curriculum_alignment_question_id_objective_id_key ON public.question_curriculum_alignment USING btree (question_id, objective_id)
  ```
- **idx_question_feedback_child** on `question_feedback`
  ```sql
  CREATE INDEX idx_question_feedback_child ON public.question_feedback USING btree (child_id)
  ```
- **idx_question_feedback_created** on `question_feedback`
  ```sql
  CREATE INDEX idx_question_feedback_created ON public.question_feedback USING btree (created_at DESC)
  ```
- **idx_question_feedback_question** on `question_feedback`
  ```sql
  CREATE INDEX idx_question_feedback_question ON public.question_feedback USING btree (question_id)
  ```
- **idx_question_feedback_unique** on `question_feedback`
  ```sql
  CREATE UNIQUE INDEX idx_question_feedback_unique ON public.question_feedback USING btree (question_id, child_id)
  ```
- **question_feedback_pkey** on `question_feedback`
  ```sql
  CREATE UNIQUE INDEX question_feedback_pkey ON public.question_feedback USING btree (id)
  ```
- **idx_question_provenance_event_type** on `question_provenance`
  ```sql
  CREATE INDEX idx_question_provenance_event_type ON public.question_provenance USING btree (event_type)
  ```
- **idx_question_provenance_occurred** on `question_provenance`
  ```sql
  CREATE INDEX idx_question_provenance_occurred ON public.question_provenance USING btree (occurred_at DESC)
  ```
- **idx_question_provenance_question** on `question_provenance`
  ```sql
  CREATE INDEX idx_question_provenance_question ON public.question_provenance USING btree (question_id)
  ```
- **question_provenance_pkey** on `question_provenance`
  ```sql
  CREATE UNIQUE INDEX question_provenance_pkey ON public.question_provenance USING btree (id)
  ```
- **idx_question_stats_attempts** on `question_stats`
  ```sql
  CREATE INDEX idx_question_stats_attempts ON public.question_stats USING btree (total_attempts)
  ```
- **idx_question_stats_errors** on `question_stats`
  ```sql
  CREATE INDEX idx_question_stats_errors ON public.question_stats USING btree (error_report_count)
  ```
- **idx_question_stats_question_id** on `question_stats`
  ```sql
  CREATE UNIQUE INDEX idx_question_stats_question_id ON public.question_stats USING btree (question_id)
  ```
- **question_type_alignment_pkey** on `question_type_alignment`
  ```sql
  CREATE UNIQUE INDEX question_type_alignment_pkey ON public.question_type_alignment USING btree (id)
  ```
- **question_type_alignment_question_id_type_id_key** on `question_type_alignment`
  ```sql
  CREATE UNIQUE INDEX question_type_alignment_question_id_type_id_key ON public.question_type_alignment USING btree (question_id, type_id)
  ```
- **idx_question_type_taxonomy_category** on `question_type_taxonomy`
  ```sql
  CREATE INDEX idx_question_type_taxonomy_category ON public.question_type_taxonomy USING btree (category)
  ```
- **idx_question_type_taxonomy_exam** on `question_type_taxonomy`
  ```sql
  CREATE INDEX idx_question_type_taxonomy_exam ON public.question_type_taxonomy USING btree (exam_board)
  ```
- **question_type_taxonomy_code_key** on `question_type_taxonomy`
  ```sql
  CREATE UNIQUE INDEX question_type_taxonomy_code_key ON public.question_type_taxonomy USING btree (code)
  ```
- **question_type_taxonomy_pkey** on `question_type_taxonomy`
  ```sql
  CREATE UNIQUE INDEX question_type_taxonomy_pkey ON public.question_type_taxonomy USING btree (id)
  ```
- **idx_questions_curriculum_code** on `questions`
  ```sql
  CREATE INDEX idx_questions_curriculum_code ON public.questions USING btree (primary_curriculum_code)
  ```
- **idx_questions_ember_score** on `questions`
  ```sql
  CREATE INDEX idx_questions_ember_score ON public.questions USING btree (ember_score) WHERE (is_published = true)
  ```
- **idx_questions_ember_score_published** on `questions`
  ```sql
  CREATE INDEX idx_questions_ember_score_published ON public.questions USING btree (ember_score DESC, is_published) WHERE (is_published = true)
  ```
- **idx_questions_external_id** on `questions`
  ```sql
  CREATE UNIQUE INDEX idx_questions_external_id ON public.questions USING btree (external_id) WHERE (external_id IS NOT NULL)
  ```
- **idx_questions_helpful** on `questions`
  ```sql
  CREATE INDEX idx_questions_helpful ON public.questions USING btree (helpful_count DESC)
  ```
- **idx_questions_published** on `questions`
  ```sql
  CREATE INDEX idx_questions_published ON public.questions USING btree (subject, difficulty, year_group) WHERE ((is_published = true) AND (ember_score >= 60))
  ```
- **idx_questions_review** on `questions`
  ```sql
  CREATE INDEX idx_questions_review ON public.questions USING btree (is_published, reviewed_at)
  ```
- **idx_questions_review_status** on `questions`
  ```sql
  CREATE INDEX idx_questions_review_status ON public.questions USING btree (review_status)
  ```
- **idx_questions_topic** on `questions`
  ```sql
  CREATE INDEX idx_questions_topic ON public.questions USING btree (topic, subtopic) WHERE (is_published = true)
  ```
- **questions_pkey** on `questions`
  ```sql
  CREATE UNIQUE INDEX questions_pkey ON public.questions USING btree (id)
  ```
- **idx_session_feedback_child** on `session_feedback`
  ```sql
  CREATE INDEX idx_session_feedback_child ON public.session_feedback USING btree (child_id)
  ```
- **idx_session_feedback_rating** on `session_feedback`
  ```sql
  CREATE INDEX idx_session_feedback_rating ON public.session_feedback USING btree (rating)
  ```
- **idx_session_feedback_session** on `session_feedback`
  ```sql
  CREATE INDEX idx_session_feedback_session ON public.session_feedback USING btree (session_id)
  ```
- **idx_session_feedback_unique** on `session_feedback`
  ```sql
  CREATE UNIQUE INDEX idx_session_feedback_unique ON public.session_feedback USING btree (session_id)
  ```
- **session_feedback_pkey** on `session_feedback`
  ```sql
  CREATE UNIQUE INDEX session_feedback_pkey ON public.session_feedback USING btree (id)
  ```

## Triggers

| Table | Trigger | Event | Timing |
|-------|---------|-------|--------|
| `children` | update_children_updated_at | UPDATE | BEFORE |
| `curriculum_objectives` | update_curriculum_objectives_updated_at | UPDATE | BEFORE |
| `error_reports` | update_error_reports_updated_at | UPDATE | BEFORE |
| `error_reports` | log_error_report | INSERT | AFTER |
| `error_reports` | after_error_report_change | UPDATE | AFTER |
| `error_reports` | after_error_report_change | INSERT | AFTER |
| `error_reports` | log_error_report | UPDATE | AFTER |
| `profiles` | update_profiles_updated_at | UPDATE | BEFORE |
| `question_feedback` | trigger_update_helpful_counts | INSERT | AFTER |
| `question_feedback` | trigger_update_helpful_counts | UPDATE | AFTER |
| `question_feedback` | trigger_update_helpful_counts | DELETE | AFTER |
| `questions` | log_question_modification | UPDATE | AFTER |
| `questions` | log_question_creation | INSERT | AFTER |
| `questions` | update_questions_updated_at | UPDATE | BEFORE |

## Row Level Security Policies

### `child_question_history`

- **System can insert history records** (INSERT, PERMISSIVE)
  - WITH CHECK: `(child_id IN ( SELECT c.id
   FROM children c
  WHERE (c.parent_id = auth.uid())...`
- **Parents can view their children's history** (SELECT, PERMISSIVE)
  - USING: `(child_id IN ( SELECT c.id
   FROM children c
  WHERE (c.parent_id = auth.uid())...`

### `child_topic_performance`

- **System can update performance records** (UPDATE, PERMISSIVE)
  - USING: `(child_id IN ( SELECT c.id
   FROM children c
  WHERE (c.parent_id = auth.uid())...`
- **System can insert performance records** (INSERT, PERMISSIVE)
  - WITH CHECK: `(child_id IN ( SELECT c.id
   FROM children c
  WHERE (c.parent_id = auth.uid())...`
- **Parents can view their children's performance** (SELECT, PERMISSIVE)
  - USING: `(child_id IN ( SELECT c.id
   FROM children c
  WHERE (c.parent_id = auth.uid())...`

### `children`

- **children_insert_own** (INSERT, PERMISSIVE)
  - WITH CHECK: `(parent_id = auth.uid())`
- **children_select_own** (SELECT, PERMISSIVE)
  - USING: `((parent_id = auth.uid()) AND (is_active = true))`
- **children_update_own** (UPDATE, PERMISSIVE)
  - USING: `(parent_id = auth.uid())`
  - WITH CHECK: `(parent_id = auth.uid())`
- **children_delete_own** (DELETE, PERMISSIVE)
  - USING: `(parent_id = auth.uid())`
- **children_service_role_all** (ALL, PERMISSIVE)
  - USING: `true`
  - WITH CHECK: `true`

### `content_attributions`

- **Attributions visible to all** (SELECT, PERMISSIVE)
  - USING: `true`

### `curriculum_objectives`

- **Curriculum objectives are viewable by everyone** (SELECT, PERMISSIVE)
  - USING: `true`

### `error_reports`

- **error_reports_insert_authenticated** (INSERT, PERMISSIVE)
  - WITH CHECK: `((reported_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM questions q
  WHERE (...`
- **error_reports_select_own** (SELECT, PERMISSIVE)
  - USING: `(reported_by = auth.uid())`
- **error_reports_service_role_update** (UPDATE, PERMISSIVE)
  - USING: `true`
  - WITH CHECK: `true`

### `nps_surveys`

- **Users can create NPS surveys** (INSERT, PERMISSIVE)
  - WITH CHECK: `(parent_id = auth.uid())`
- **Users can view their own NPS surveys** (SELECT, PERMISSIVE)
  - USING: `(parent_id = auth.uid())`

### `practice_sessions`

- **sessions_insert_own_children** (INSERT, PERMISSIVE)
  - WITH CHECK: `is_parent_of(child_id)`
- **sessions_update_own_children** (UPDATE, PERMISSIVE)
  - USING: `is_parent_of(child_id)`
  - WITH CHECK: `is_parent_of(child_id)`
- **sessions_service_role_all** (ALL, PERMISSIVE)
  - USING: `true`
  - WITH CHECK: `true`
- **sessions_select_own_children** (SELECT, PERMISSIVE)
  - USING: `is_parent_of(child_id)`

### `profiles`

- **profiles_service_role_all** (ALL, PERMISSIVE)
  - USING: `true`
  - WITH CHECK: `true`
- **profiles_select_own** (SELECT, PERMISSIVE)
  - USING: `(auth.uid() = id)`
- **profiles_update_own** (UPDATE, PERMISSIVE)
  - USING: `(auth.uid() = id)`
  - WITH CHECK: `(auth.uid() = id)`

### `question_attempts`

- **attempts_select_own_children** (SELECT, PERMISSIVE)
  - USING: `is_parent_of(child_id)`
- **attempts_insert_own_children** (INSERT, PERMISSIVE)
  - WITH CHECK: `(is_parent_of(child_id) AND owns_session(session_id) AND (EXISTS ( SELECT 1
   F...`
- **attempts_service_role_all** (ALL, PERMISSIVE)
  - USING: `true`
  - WITH CHECK: `true`

### `question_curriculum_alignment`

- **Alignments are viewable by everyone** (SELECT, PERMISSIVE)
  - USING: `true`

### `question_feedback`

- **Users can create feedback for their children** (INSERT, PERMISSIVE)
  - WITH CHECK: `((parent_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM children
  WHERE ((chil...`
- **Users can update their own feedback** (UPDATE, PERMISSIVE)
  - USING: `(parent_id = auth.uid())`
  - WITH CHECK: `(parent_id = auth.uid())`
- **Users can view their own feedback** (SELECT, PERMISSIVE)
  - USING: `(parent_id = auth.uid())`

### `question_provenance`

- **Only admins can create provenance records** (INSERT, PERMISSIVE)
  - WITH CHECK: `(EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (pro...`
- **Provenance visible to all authenticated users** (SELECT, PERMISSIVE)
  - USING: `true`

### `question_type_alignment`

- **Type alignments are viewable by everyone** (SELECT, PERMISSIVE)
  - USING: `true`

### `question_type_taxonomy`

- **Question types are viewable by everyone** (SELECT, PERMISSIVE)
  - USING: `true`

### `questions`

- **questions_service_role_all** (ALL, PERMISSIVE)
  - USING: `true`
  - WITH CHECK: `true`
- **questions_select_published** (SELECT, PERMISSIVE)
  - USING: `((is_published = true) AND (ember_score >= 60))`

### `session_feedback`

- **Users can create session feedback for their children** (INSERT, PERMISSIVE)
  - WITH CHECK: `((parent_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM children
  WHERE ((chil...`
- **Users can view their own session feedback** (SELECT, PERMISSIVE)
  - USING: `(parent_id = auth.uid())`

## Database Functions

| Function | Arguments | Returns | Security | Comment |
|----------|-----------|---------|----------|----------|
| `calculate_benchmark_percentiles` | p_child_id uuid, p_days integer DEFAULT ... | json | SECURITY DEFINER | Calculates percentile rankings... |
| `calculate_ember_score` | p_question_id uuid | integer | SECURITY DEFINER | Calculates ember_score for a q... |
| `calculate_fatigue_dropoff` | p_child_id uuid, p_days integer DEFAULT ... | numeric | SECURITY INVOKER | Calculates accuracy drop betwe... |
| `calculate_learning_health_v2` | p_child_id uuid, p_days integer DEFAULT ... | json | SECURITY DEFINER | Calculates rush factor, fatigu... |
| `calculate_nps` | start_date timestamp with time zone DEFA... | TABLE(total_responses bigint, promoters bigint, passives bigint, detractors bigint, nps_score numeric) | SECURITY DEFINER | - |
| `calculate_readiness_score` | p_child_id uuid | json | SECURITY DEFINER | Calculates 11+ exam readiness ... |
| `calculate_readiness_score_v2` | p_child_id uuid, p_days integer DEFAULT ... | json | SECURITY DEFINER | Calculates exam readiness scor... |
| `calculate_rush_factor` | p_child_id uuid, p_days integer DEFAULT ... | numeric | SECURITY INVOKER | Calculates percentage of quest... |
| `calculate_stagnant_topics` | p_child_id uuid | integer | SECURITY INVOKER | Counts topics with no improvem... |
| `exec_sql_to_json` | sql_query text | jsonb | SECURITY DEFINER | Helper function to execute SQL... |
| `get_child_analytics` | p_child_id uuid, p_start_date date, p_en... | json | SECURITY DEFINER | Returns comprehensive analytic... |
| `get_child_performance_tracker` | p_child_id uuid, p_topic_id text | TABLE(tracker_child_id uuid, tracker_topic_id text, current_difficulty text, recent_correct integer, recent_incorrect integer, recent_total integer, recent_accuracy numeric, questions_since_last_adjustment integer, total_questions_in_topic integer, last_adjustment_at timestamp with time zone, total_correct integer, total_incorrect integer, overall_accuracy numeric, current_streak integer, best_streak integer, last_attempted_at timestamp with time zone) | SECURITY DEFINER | - |
| `get_comprehensive_analytics` | p_child_id uuid, p_days integer DEFAULT ... | json | SECURITY DEFINER | Returns comprehensive analytic... |
| `get_learning_health_check` | p_child_id uuid, p_days integer DEFAULT ... | json | SECURITY INVOKER | Returns all learning health me... |
| `get_question_curriculum_alignment` | p_question_id uuid | TABLE(objective_code character varying, objective_text text, strand character varying, year_group integer, alignment_strength character varying) | SECURITY DEFINER | - |
| `get_question_feedback_summary` | question_uuid uuid | TABLE(total_feedback bigint, helpful_count bigint, not_helpful_count bigint, helpful_percentage numeric, common_issues jsonb) | SECURITY DEFINER | - |
| `get_question_provenance` | p_question_id uuid | TABLE(id uuid, event_type text, event_data jsonb, actor_name text, actor_type text, occurred_at timestamp with time zone) | SECURITY DEFINER | Retrieves the complete provena... |
| `get_topic_mastery_level` | p_child_id uuid, p_topic_id text | text | SECURITY DEFINER | Calculates mastery level (begi... |
| `get_weakness_heatmap` | p_child_id uuid | json | SECURITY DEFINER | Returns heatmap data showing p... |
| `get_weakness_heatmap_v2` | p_child_id uuid, p_days integer DEFAULT ... | json | SECURITY DEFINER | Returns topic-based performanc... |
| `handle_new_user` | - | trigger | SECURITY DEFINER | - |
| `is_parent_of` | child_id uuid | boolean | SECURITY DEFINER | Returns true if current user i... |
| `log_provenance_event` | p_question_id uuid, p_event_type text, p... | uuid | SECURITY DEFINER | Logs a provenance event for a ... |
| `owns_session` | session_id uuid | boolean | SECURITY DEFINER | Returns true if current user o... |
| `recalculate_ember_score` | question_uuid uuid | jsonb | SECURITY DEFINER | Recalculates Ember Score for a... |
| `refresh_analytics_views` | - | void | SECURITY DEFINER | Refreshes all analytics materi... |
| `refresh_question_stats` | - | void | SECURITY DEFINER | Refreshes the question_stats m... |
| `test_rls_access` | - | TABLE(table_name text, can_select boolean, can_insert boolean, can_update boolean, can_delete boolean) | SECURITY DEFINER | Helper to understand current u... |
| `trigger_log_error_report` | - | trigger | SECURITY DEFINER | - |
| `trigger_log_question_creation` | - | trigger | SECURITY DEFINER | - |
| `trigger_log_question_modification` | - | trigger | SECURITY DEFINER | - |
| `trigger_recalculate_ember_score_on_error` | - | trigger | SECURITY INVOKER | - |
| `update_all_ember_scores` | - | TABLE(question_id uuid, old_score integer, new_score integer) | SECURITY DEFINER | Recalculates ember_score for a... |
| `update_question_helpful_counts` | - | trigger | SECURITY DEFINER | - |
| `update_topic_performance` | p_child_id uuid, p_topic_id text, p_is_c... | TABLE(current_difficulty text, should_adjust boolean, recommended_difficulty text, adjustment_reason text) | SECURITY DEFINER | Updates performance tracker af... |
| `update_updated_at_column` | - | trigger | SECURITY INVOKER | - |

