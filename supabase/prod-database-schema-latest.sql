-- DROP SCHEMA public;

CREATE SCHEMA public AUTHORIZATION pg_database_owner;

COMMENT ON SCHEMA public IS 'standard public schema';
-- public.content_attributions definition

-- Drop table

-- DROP TABLE public.content_attributions;

CREATE TABLE public.content_attributions (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	content_type text NOT NULL,
	content_id uuid NOT NULL,
	source_type text NOT NULL,
	source_details jsonb DEFAULT '{}'::jsonb NOT NULL,
	license text DEFAULT 'OGL-3.0'::text NOT NULL,
	attribution_text text NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT content_attributions_pkey PRIMARY KEY (id),
	CONSTRAINT valid_content_type CHECK ((content_type = ANY (ARRAY['question'::text, 'explanation'::text, 'image'::text]))),
	CONSTRAINT valid_source_type CHECK ((source_type = ANY (ARRAY['ai_generated'::text, 'curriculum_derived'::text, 'expert_created'::text, 'community'::text])))
);
CREATE INDEX idx_content_attributions_content ON public.content_attributions USING btree (content_type, content_id);
COMMENT ON TABLE public.content_attributions IS 'Tracks content sources and licensing information for OGL v3.0 compliance';

-- Permissions

ALTER TABLE public.content_attributions OWNER TO postgres;
GRANT ALL ON TABLE public.content_attributions TO postgres;
GRANT ALL ON TABLE public.content_attributions TO anon;
GRANT ALL ON TABLE public.content_attributions TO authenticated;
GRANT ALL ON TABLE public.content_attributions TO service_role;


-- public.curriculum_objectives definition

-- Drop table

-- DROP TABLE public.curriculum_objectives;

CREATE TABLE public.curriculum_objectives (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	running_number varchar(20) NULL,
	code varchar(30) NOT NULL,
	dfe_code varchar(20) NULL,
	subject varchar(50) NOT NULL,
	key_stage varchar(10) DEFAULT 'KS2'::character varying NOT NULL,
	year_group int4 NOT NULL,
	strand varchar(100) NOT NULL,
	sub_strand varchar(100) NULL,
	objective_text text NOT NULL,
	keywords _text NULL,
	statutory bool DEFAULT true NULL,
	source_document varchar(255) NULL,
	source_link varchar(255) NULL,
	source_page int4 NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT curriculum_objectives_code_key UNIQUE (code),
	CONSTRAINT curriculum_objectives_pkey PRIMARY KEY (id),
	CONSTRAINT curriculum_objectives_year_group_check CHECK (((year_group >= 3) AND (year_group <= 6)))
);
CREATE INDEX idx_curriculum_objectives_code ON public.curriculum_objectives USING btree (code);
CREATE INDEX idx_curriculum_objectives_keywords ON public.curriculum_objectives USING gin (keywords);
CREATE INDEX idx_curriculum_objectives_strand ON public.curriculum_objectives USING btree (strand);
CREATE INDEX idx_curriculum_objectives_subject ON public.curriculum_objectives USING btree (subject);
CREATE INDEX idx_curriculum_objectives_year ON public.curriculum_objectives USING btree (year_group);

-- Table Triggers

create trigger update_curriculum_objectives_updated_at before
update
    on
    public.curriculum_objectives for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.curriculum_objectives OWNER TO postgres;
GRANT ALL ON TABLE public.curriculum_objectives TO postgres;
GRANT ALL ON TABLE public.curriculum_objectives TO anon;
GRANT ALL ON TABLE public.curriculum_objectives TO authenticated;
GRANT ALL ON TABLE public.curriculum_objectives TO service_role;


-- public.question_type_taxonomy definition

-- Drop table

-- DROP TABLE public.question_type_taxonomy;

CREATE TABLE public.question_type_taxonomy (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	code varchar(30) NOT NULL,
	category varchar(50) NOT NULL,
	exam_board varchar(20) NOT NULL,
	type_name varchar(100) NOT NULL,
	type_description text NULL,
	difficulty_range varchar(50) NULL,
	typical_age_range varchar(20) NULL,
	keywords _text NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT question_type_taxonomy_code_key UNIQUE (code),
	CONSTRAINT question_type_taxonomy_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_question_type_taxonomy_category ON public.question_type_taxonomy USING btree (category);
CREATE INDEX idx_question_type_taxonomy_exam ON public.question_type_taxonomy USING btree (exam_board);

-- Permissions

ALTER TABLE public.question_type_taxonomy OWNER TO postgres;
GRANT ALL ON TABLE public.question_type_taxonomy TO postgres;
GRANT ALL ON TABLE public.question_type_taxonomy TO anon;
GRANT ALL ON TABLE public.question_type_taxonomy TO authenticated;
GRANT ALL ON TABLE public.question_type_taxonomy TO service_role;


-- public.admin_audit_log definition

-- Drop table

-- DROP TABLE public.admin_audit_log;

CREATE TABLE public.admin_audit_log (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	admin_id uuid NOT NULL, -- Admin user who performed the action
	"action" text NOT NULL, -- Description of action taken (e.g., "Updated user profile")
	entity_type text NOT NULL, -- Type of entity affected (profile, child, question, etc.)
	entity_id uuid NULL, -- ID of the affected entity (if applicable)
	changes jsonb NULL, -- JSON object describing what changed
	ip_address text NULL, -- IP address of admin user
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT admin_audit_log_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_admin_audit_log_admin ON public.admin_audit_log USING btree (admin_id, created_at DESC);
CREATE INDEX idx_admin_audit_log_created ON public.admin_audit_log USING btree (created_at DESC);
CREATE INDEX idx_admin_audit_log_entity ON public.admin_audit_log USING btree (entity_type, entity_id);
COMMENT ON TABLE public.admin_audit_log IS 'Audit trail of admin actions for security and compliance';

-- Column comments

COMMENT ON COLUMN public.admin_audit_log.admin_id IS 'Admin user who performed the action';
COMMENT ON COLUMN public.admin_audit_log."action" IS 'Description of action taken (e.g., "Updated user profile")';
COMMENT ON COLUMN public.admin_audit_log.entity_type IS 'Type of entity affected (profile, child, question, etc.)';
COMMENT ON COLUMN public.admin_audit_log.entity_id IS 'ID of the affected entity (if applicable)';
COMMENT ON COLUMN public.admin_audit_log.changes IS 'JSON object describing what changed';
COMMENT ON COLUMN public.admin_audit_log.ip_address IS 'IP address of admin user';

-- Permissions

ALTER TABLE public.admin_audit_log OWNER TO postgres;
GRANT ALL ON TABLE public.admin_audit_log TO postgres;
GRANT ALL ON TABLE public.admin_audit_log TO anon;
GRANT ALL ON TABLE public.admin_audit_log TO authenticated;
GRANT ALL ON TABLE public.admin_audit_log TO service_role;


-- public.child_question_history definition

-- Drop table

-- DROP TABLE public.child_question_history;

CREATE TABLE public.child_question_history (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	child_id uuid NOT NULL,
	question_id uuid NOT NULL,
	difficulty_at_attempt text NOT NULL,
	is_correct bool NOT NULL,
	time_spent_seconds int4 NULL,
	session_id uuid NULL,
	topic_id text NOT NULL,
	subtopic_name text NULL,
	selection_score numeric(5, 4) NULL,
	attempted_at timestamptz DEFAULT now() NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT child_question_history_child_id_question_id_session_id_key UNIQUE (child_id, question_id, session_id),
	CONSTRAINT child_question_history_pkey PRIMARY KEY (id),
	CONSTRAINT valid_attempt_difficulty CHECK ((difficulty_at_attempt = ANY (ARRAY['foundation'::text, 'standard'::text, 'challenge'::text])))
);
CREATE INDEX idx_question_history_attempted ON public.child_question_history USING btree (attempted_at DESC);
CREATE INDEX idx_question_history_child ON public.child_question_history USING btree (child_id);
CREATE INDEX idx_question_history_child_topic ON public.child_question_history USING btree (child_id, topic_id);
CREATE INDEX idx_question_history_question ON public.child_question_history USING btree (question_id);
CREATE INDEX idx_question_history_session ON public.child_question_history USING btree (session_id);
CREATE INDEX idx_question_history_topic ON public.child_question_history USING btree (topic_id);
COMMENT ON TABLE public.child_question_history IS 'Individual question attempt history for recency avoidance and analysis';

-- Permissions

ALTER TABLE public.child_question_history OWNER TO postgres;
GRANT ALL ON TABLE public.child_question_history TO postgres;
GRANT ALL ON TABLE public.child_question_history TO anon;
GRANT ALL ON TABLE public.child_question_history TO authenticated;
GRANT ALL ON TABLE public.child_question_history TO service_role;


-- public.child_topic_performance definition

-- Drop table

-- DROP TABLE public.child_topic_performance;

CREATE TABLE public.child_topic_performance (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	child_id uuid NOT NULL,
	topic_id text NOT NULL,
	current_difficulty text DEFAULT 'foundation'::text NOT NULL,
	recent_correct int4 DEFAULT 0 NOT NULL,
	recent_incorrect int4 DEFAULT 0 NOT NULL,
	recent_total int4 DEFAULT 0 NOT NULL,
	recent_accuracy numeric(5, 4) GENERATED ALWAYS AS (
CASE
    WHEN recent_total > 0 THEN recent_correct::numeric / recent_total::numeric
    ELSE 0::numeric
END) STORED NULL,
	questions_since_last_adjustment int4 DEFAULT 0 NOT NULL,
	total_questions_in_topic int4 DEFAULT 0 NOT NULL,
	last_adjustment_at timestamptz NULL,
	adjustment_count int4 DEFAULT 0 NOT NULL,
	total_correct int4 DEFAULT 0 NOT NULL,
	total_incorrect int4 DEFAULT 0 NOT NULL,
	total_attempts int4 GENERATED ALWAYS AS (total_correct + total_incorrect) STORED NULL,
	overall_accuracy numeric(5, 4) GENERATED ALWAYS AS (
CASE
    WHEN (total_correct + total_incorrect) > 0 THEN total_correct::numeric / (total_correct + total_incorrect)::numeric
    ELSE 0::numeric
END) STORED NULL,
	current_streak int4 DEFAULT 0 NOT NULL,
	best_streak int4 DEFAULT 0 NOT NULL,
	first_attempted_at timestamptz DEFAULT now() NOT NULL,
	last_attempted_at timestamptz DEFAULT now() NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT child_topic_performance_child_id_topic_id_key UNIQUE (child_id, topic_id),
	CONSTRAINT child_topic_performance_pkey PRIMARY KEY (id),
	CONSTRAINT valid_difficulty CHECK ((current_difficulty = ANY (ARRAY['foundation'::text, 'standard'::text, 'challenge'::text])))
);
CREATE INDEX idx_topic_performance_child ON public.child_topic_performance USING btree (child_id);
CREATE INDEX idx_topic_performance_difficulty ON public.child_topic_performance USING btree (current_difficulty);
CREATE INDEX idx_topic_performance_last_attempted ON public.child_topic_performance USING btree (last_attempted_at DESC);
CREATE INDEX idx_topic_performance_topic ON public.child_topic_performance USING btree (topic_id);
COMMENT ON TABLE public.child_topic_performance IS 'Tracks adaptive difficulty and performance metrics per child per topic';

-- Permissions

ALTER TABLE public.child_topic_performance OWNER TO postgres;
GRANT ALL ON TABLE public.child_topic_performance TO postgres;
GRANT ALL ON TABLE public.child_topic_performance TO anon;
GRANT ALL ON TABLE public.child_topic_performance TO authenticated;
GRANT ALL ON TABLE public.child_topic_performance TO service_role;


-- public.children definition

-- Drop table

-- DROP TABLE public.children;

CREATE TABLE public.children (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	parent_id uuid NOT NULL,
	"name" text NOT NULL,
	year_group int4 NULL, -- UK school year: 3 (age 7-8), 4 (age 8-9), 5 (age 9-10), 6 (age 10-11)
	target_school text NULL, -- Optional: target grammar school name
	avatar_url text NULL,
	is_active bool DEFAULT true NOT NULL, -- Soft delete flag - inactive children hidden from UI
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT children_pkey PRIMARY KEY (id),
	CONSTRAINT children_year_group_check CHECK ((year_group = ANY (ARRAY[3, 4, 5, 6]))),
	CONSTRAINT valid_name CHECK ((length(TRIM(BOTH FROM name)) >= 2))
);
CREATE INDEX idx_children_parent ON public.children USING btree (parent_id) WHERE (is_active = true);
CREATE INDEX idx_children_year_group ON public.children USING btree (year_group);
COMMENT ON TABLE public.children IS 'Child/learner profiles - no direct login, accessed via parent';

-- Column comments

COMMENT ON COLUMN public.children.year_group IS 'UK school year: 3 (age 7-8), 4 (age 8-9), 5 (age 9-10), 6 (age 10-11)';
COMMENT ON COLUMN public.children.target_school IS 'Optional: target grammar school name';
COMMENT ON COLUMN public.children.is_active IS 'Soft delete flag - inactive children hidden from UI';

-- Table Triggers

create trigger update_children_updated_at before
update
    on
    public.children for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.children OWNER TO postgres;
GRANT ALL ON TABLE public.children TO postgres;
GRANT ALL ON TABLE public.children TO anon;
GRANT ALL ON TABLE public.children TO authenticated;
GRANT ALL ON TABLE public.children TO service_role;


-- public.error_reports definition

-- Drop table

-- DROP TABLE public.error_reports;

CREATE TABLE public.error_reports (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	question_id uuid NOT NULL,
	reported_by uuid NOT NULL,
	report_type text NOT NULL,
	description text NOT NULL,
	status text DEFAULT 'pending'::text NOT NULL, -- pending: new | reviewed: admin seen | fixed: question updated | dismissed: not an issue
	reviewed_by uuid NULL,
	admin_notes text NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT error_reports_pkey PRIMARY KEY (id),
	CONSTRAINT error_reports_report_type_check CHECK ((report_type = ANY (ARRAY['incorrect_answer'::text, 'unclear'::text, 'typo'::text, 'inappropriate'::text, 'other'::text]))),
	CONSTRAINT error_reports_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'reviewed'::text, 'fixed'::text, 'dismissed'::text]))),
	CONSTRAINT valid_description CHECK ((length(TRIM(BOTH FROM description)) >= 10))
);
CREATE INDEX idx_error_reports_pending ON public.error_reports USING btree (question_id) WHERE (status = 'pending'::text);
CREATE INDEX idx_error_reports_question ON public.error_reports USING btree (question_id);
CREATE INDEX idx_error_reports_status ON public.error_reports USING btree (status, created_at);
COMMENT ON TABLE public.error_reports IS 'Community feedback on question quality - feeds into ember_score calculation';

-- Column comments

COMMENT ON COLUMN public.error_reports.status IS 'pending: new | reviewed: admin seen | fixed: question updated | dismissed: not an issue';

-- Table Triggers

create trigger after_error_report_change after
insert
    or
update
    of status on
    public.error_reports for each row execute function trigger_recalculate_ember_score_on_error();

COMMENT ON TRIGGER after_error_report_change ON public.error_reports IS 'Automatically recalculates Ember Score when error report status changes';
create trigger log_error_report after
insert
    or
update
    on
    public.error_reports for each row execute function trigger_log_error_report();
create trigger update_error_reports_updated_at before
update
    on
    public.error_reports for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.error_reports OWNER TO postgres;
GRANT ALL ON TABLE public.error_reports TO postgres;
GRANT ALL ON TABLE public.error_reports TO anon;
GRANT ALL ON TABLE public.error_reports TO authenticated;
GRANT ALL ON TABLE public.error_reports TO service_role;


-- public.impersonation_sessions definition

-- Drop table

-- DROP TABLE public.impersonation_sessions;

CREATE TABLE public.impersonation_sessions (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	admin_id uuid NOT NULL,
	target_user_id uuid NOT NULL,
	reason text NULL,
	started_at timestamptz DEFAULT now() NOT NULL,
	ended_at timestamptz NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT impersonation_sessions_admin_target_chk CHECK ((admin_id <> target_user_id)),
	CONSTRAINT impersonation_sessions_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX impersonation_sessions_admin_active_idx ON public.impersonation_sessions USING btree (admin_id) WHERE (ended_at IS NULL);
CREATE INDEX impersonation_sessions_admin_idx ON public.impersonation_sessions USING btree (admin_id, started_at DESC);
CREATE INDEX impersonation_sessions_target_idx ON public.impersonation_sessions USING btree (target_user_id, started_at DESC);

-- Table Triggers

create trigger update_impersonation_sessions_updated_at before
update
    on
    public.impersonation_sessions for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.impersonation_sessions OWNER TO postgres;
GRANT ALL ON TABLE public.impersonation_sessions TO postgres;
GRANT ALL ON TABLE public.impersonation_sessions TO anon;
GRANT ALL ON TABLE public.impersonation_sessions TO authenticated;
GRANT ALL ON TABLE public.impersonation_sessions TO service_role;


-- public.nps_surveys definition

-- Drop table

-- DROP TABLE public.nps_surveys;

CREATE TABLE public.nps_surveys (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	parent_id uuid NOT NULL,
	child_id uuid NULL,
	score int4 NOT NULL,
	segment text GENERATED ALWAYS AS (
CASE
    WHEN score >= 9 THEN 'promoter'::text
    WHEN score >= 7 THEN 'passive'::text
    ELSE 'detractor'::text
END) STORED NULL,
	feedback_text text NULL,
	trigger_type text NOT NULL,
	total_sessions_at_time int4 DEFAULT 0 NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT nps_surveys_pkey PRIMARY KEY (id),
	CONSTRAINT nps_surveys_score_check CHECK (((score >= 0) AND (score <= 10))),
	CONSTRAINT nps_surveys_trigger_type_check CHECK ((trigger_type = ANY (ARRAY['session_10'::text, 'session_30'::text, 'manual'::text, 'prompted'::text])))
);
CREATE INDEX idx_nps_created ON public.nps_surveys USING btree (created_at DESC);
CREATE INDEX idx_nps_parent ON public.nps_surveys USING btree (parent_id);
CREATE INDEX idx_nps_score ON public.nps_surveys USING btree (score);
CREATE INDEX idx_nps_segment ON public.nps_surveys USING btree (segment);
COMMENT ON TABLE public.nps_surveys IS 'Net Promoter Score surveys for overall platform satisfaction';

-- Permissions

ALTER TABLE public.nps_surveys OWNER TO postgres;
GRANT ALL ON TABLE public.nps_surveys TO postgres;
GRANT ALL ON TABLE public.nps_surveys TO anon;
GRANT ALL ON TABLE public.nps_surveys TO authenticated;
GRANT ALL ON TABLE public.nps_surveys TO service_role;


-- public.practice_sessions definition

-- Drop table

-- DROP TABLE public.practice_sessions;

CREATE TABLE public.practice_sessions (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	child_id uuid NOT NULL,
	session_type text NOT NULL, -- quick: 10 questions | focus: topic-specific | mock: timed exam simulation | quick_byte: 4 quick questions on home page (daily)
	subject text NULL,
	topic text NULL,
	started_at timestamptz DEFAULT now() NOT NULL,
	completed_at timestamptz NULL, -- NULL = in progress
	total_questions int4 DEFAULT 0 NOT NULL,
	correct_answers int4 DEFAULT 0 NOT NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT practice_sessions_pkey PRIMARY KEY (id),
	CONSTRAINT practice_sessions_session_type_check CHECK ((session_type = ANY (ARRAY['quick'::text, 'focus'::text, 'mock'::text, 'quick_byte'::text]))),
	CONSTRAINT practice_sessions_subject_check CHECK ((subject = ANY (ARRAY['verbal_reasoning'::text, 'english'::text, 'mathematics'::text])))
);
CREATE INDEX idx_sessions_active ON public.practice_sessions USING btree (child_id) WHERE (completed_at IS NULL);
CREATE INDEX idx_sessions_child ON public.practice_sessions USING btree (child_id, created_at DESC);
CREATE INDEX idx_sessions_subject ON public.practice_sessions USING btree (subject, session_type);
COMMENT ON TABLE public.practice_sessions IS 'Practice sessions group question attempts';

-- Column comments

COMMENT ON COLUMN public.practice_sessions.session_type IS 'quick: 10 questions | focus: topic-specific | mock: timed exam simulation | quick_byte: 4 quick questions on home page (daily)';
COMMENT ON COLUMN public.practice_sessions.completed_at IS 'NULL = in progress';

-- Permissions

ALTER TABLE public.practice_sessions OWNER TO postgres;
GRANT ALL ON TABLE public.practice_sessions TO postgres;
GRANT ALL ON TABLE public.practice_sessions TO anon;
GRANT ALL ON TABLE public.practice_sessions TO authenticated;
GRANT ALL ON TABLE public.practice_sessions TO service_role;


-- public.profiles definition

-- Drop table

-- DROP TABLE public.profiles;

CREATE TABLE public.profiles (
	id uuid NOT NULL,
	email text NOT NULL,
	full_name text NULL,
	subscription_tier text DEFAULT 'free'::text NOT NULL, -- free: basic access | ascent: analytics dashboard | summit: AI tutor (future)
	subscription_status text DEFAULT 'active'::text NOT NULL, -- Stripe subscription status
	stripe_customer_id text NULL,
	stripe_subscription_id text NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	"role" text DEFAULT 'user'::text NOT NULL,
	CONSTRAINT profiles_email_key UNIQUE (email),
	CONSTRAINT profiles_pkey PRIMARY KEY (id),
	CONSTRAINT profiles_stripe_customer_id_key UNIQUE (stripe_customer_id),
	CONSTRAINT profiles_subscription_status_check CHECK ((subscription_status = ANY (ARRAY['active'::text, 'cancelled'::text, 'past_due'::text, 'trialing'::text]))),
	CONSTRAINT profiles_subscription_tier_check CHECK ((subscription_tier = ANY (ARRAY['free'::text, 'ascent'::text, 'summit'::text])))
);
CREATE INDEX idx_profiles_subscription ON public.profiles USING btree (subscription_tier, subscription_status);
COMMENT ON TABLE public.profiles IS 'Parent/guardian profiles - extends Supabase auth.users';

-- Column comments

COMMENT ON COLUMN public.profiles.subscription_tier IS 'free: basic access | ascent: analytics dashboard | summit: AI tutor (future)';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Stripe subscription status';

-- Table Triggers

create trigger update_profiles_updated_at before
update
    on
    public.profiles for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.profiles OWNER TO postgres;
GRANT ALL ON TABLE public.profiles TO postgres;
GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


-- public.question_attempts definition

-- Drop table

-- DROP TABLE public.question_attempts;

CREATE TABLE public.question_attempts (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	session_id uuid NOT NULL,
	child_id uuid NOT NULL,
	question_id uuid NOT NULL,
	selected_answer text NOT NULL,
	is_correct bool NOT NULL,
	time_taken_seconds int4 NOT NULL,
	explanation_viewed text NULL, -- Which explanation style the child viewed (if any)
	flagged_for_review bool DEFAULT false NOT NULL, -- Child marked for later review
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT question_attempts_explanation_viewed_check CHECK ((explanation_viewed = ANY (ARRAY['step_by_step'::text, 'visual'::text, 'worked_example'::text]))),
	CONSTRAINT question_attempts_pkey PRIMARY KEY (id),
	CONSTRAINT question_attempts_time_taken_seconds_check CHECK ((time_taken_seconds >= 0))
);
CREATE INDEX idx_attempts_analytics ON public.question_attempts USING btree (child_id, question_id, is_correct);
CREATE INDEX idx_attempts_child ON public.question_attempts USING btree (child_id, created_at DESC);
CREATE INDEX idx_attempts_question ON public.question_attempts USING btree (question_id);
CREATE INDEX idx_attempts_session ON public.question_attempts USING btree (session_id);
COMMENT ON TABLE public.question_attempts IS 'Individual question answers - used for progress tracking and adaptive learning';

-- Column comments

COMMENT ON COLUMN public.question_attempts.explanation_viewed IS 'Which explanation style the child viewed (if any)';
COMMENT ON COLUMN public.question_attempts.flagged_for_review IS 'Child marked for later review';

-- Permissions

ALTER TABLE public.question_attempts OWNER TO postgres;
GRANT ALL ON TABLE public.question_attempts TO postgres;
GRANT ALL ON TABLE public.question_attempts TO anon;
GRANT ALL ON TABLE public.question_attempts TO authenticated;
GRANT ALL ON TABLE public.question_attempts TO service_role;


-- public.question_curriculum_alignment definition

-- Drop table

-- DROP TABLE public.question_curriculum_alignment;

CREATE TABLE public.question_curriculum_alignment (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	question_id uuid NOT NULL,
	objective_id uuid NOT NULL,
	alignment_strength varchar(20) DEFAULT 'primary'::character varying NULL,
	alignment_confidence int4 NULL,
	validated_by varchar(50) NULL,
	validated_at timestamptz NULL,
	validator_notes text NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT question_curriculum_alignment_alignment_confidence_check CHECK (((alignment_confidence >= 0) AND (alignment_confidence <= 100))),
	CONSTRAINT question_curriculum_alignment_pkey PRIMARY KEY (id),
	CONSTRAINT question_curriculum_alignment_question_id_objective_id_key UNIQUE (question_id, objective_id)
);
CREATE INDEX idx_question_curriculum_objective ON public.question_curriculum_alignment USING btree (objective_id);
CREATE INDEX idx_question_curriculum_question ON public.question_curriculum_alignment USING btree (question_id);

-- Permissions

ALTER TABLE public.question_curriculum_alignment OWNER TO postgres;
GRANT ALL ON TABLE public.question_curriculum_alignment TO postgres;
GRANT ALL ON TABLE public.question_curriculum_alignment TO anon;
GRANT ALL ON TABLE public.question_curriculum_alignment TO authenticated;
GRANT ALL ON TABLE public.question_curriculum_alignment TO service_role;


-- public.question_feedback definition

-- Drop table

-- DROP TABLE public.question_feedback;

CREATE TABLE public.question_feedback (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	question_id uuid NOT NULL,
	child_id uuid NOT NULL,
	parent_id uuid NOT NULL,
	is_helpful bool NOT NULL,
	feedback_text text NULL,
	issue_type text NULL,
	session_id uuid NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT question_feedback_issue_type_check CHECK ((issue_type = ANY (ARRAY['unclear'::text, 'incorrect'::text, 'too_easy'::text, 'too_hard'::text, 'other'::text]))),
	CONSTRAINT question_feedback_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_question_feedback_child ON public.question_feedback USING btree (child_id);
CREATE INDEX idx_question_feedback_created ON public.question_feedback USING btree (created_at DESC);
CREATE INDEX idx_question_feedback_question ON public.question_feedback USING btree (question_id);
CREATE UNIQUE INDEX idx_question_feedback_unique ON public.question_feedback USING btree (question_id, child_id);
COMMENT ON TABLE public.question_feedback IS 'Individual question quality feedback (helpful/not helpful)';

-- Table Triggers

create trigger trigger_update_helpful_counts after
insert
    or
delete
    or
update
    on
    public.question_feedback for each row execute function update_question_helpful_counts();

-- Permissions

ALTER TABLE public.question_feedback OWNER TO postgres;
GRANT ALL ON TABLE public.question_feedback TO postgres;
GRANT ALL ON TABLE public.question_feedback TO anon;
GRANT ALL ON TABLE public.question_feedback TO authenticated;
GRANT ALL ON TABLE public.question_feedback TO service_role;


-- public.question_provenance definition

-- Drop table

-- DROP TABLE public.question_provenance;

CREATE TABLE public.question_provenance (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	question_id uuid NOT NULL,
	event_type text NOT NULL,
	event_data jsonb DEFAULT '{}'::jsonb NOT NULL,
	actor_id uuid NULL,
	actor_type text NULL,
	occurred_at timestamptz DEFAULT now() NULL,
	CONSTRAINT question_provenance_pkey PRIMARY KEY (id),
	CONSTRAINT valid_event_type CHECK ((event_type = ANY (ARRAY['created'::text, 'modified'::text, 'reviewed'::text, 'published'::text, 'unpublished'::text, 'score_changed'::text, 'error_reported'::text, 'error_resolved'::text, 'feedback_received'::text])))
);
CREATE INDEX idx_question_provenance_event_type ON public.question_provenance USING btree (event_type);
CREATE INDEX idx_question_provenance_occurred ON public.question_provenance USING btree (occurred_at DESC);
CREATE INDEX idx_question_provenance_question ON public.question_provenance USING btree (question_id);
COMMENT ON TABLE public.question_provenance IS 'Audit log tracking the complete lifecycle of questions for transparency and compliance';

-- Permissions

ALTER TABLE public.question_provenance OWNER TO postgres;
GRANT ALL ON TABLE public.question_provenance TO postgres;
GRANT ALL ON TABLE public.question_provenance TO anon;
GRANT ALL ON TABLE public.question_provenance TO authenticated;
GRANT ALL ON TABLE public.question_provenance TO service_role;


-- public.question_type_alignment definition

-- Drop table

-- DROP TABLE public.question_type_alignment;

CREATE TABLE public.question_type_alignment (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	question_id uuid NOT NULL,
	type_id uuid NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT question_type_alignment_pkey PRIMARY KEY (id),
	CONSTRAINT question_type_alignment_question_id_type_id_key UNIQUE (question_id, type_id)
);

-- Permissions

ALTER TABLE public.question_type_alignment OWNER TO postgres;
GRANT ALL ON TABLE public.question_type_alignment TO postgres;
GRANT ALL ON TABLE public.question_type_alignment TO anon;
GRANT ALL ON TABLE public.question_type_alignment TO authenticated;
GRANT ALL ON TABLE public.question_type_alignment TO service_role;


-- public.question_validations definition

-- Drop table

-- DROP TABLE public.question_validations;

CREATE TABLE public.question_validations (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	question_id text NOT NULL,
	validation_run_at timestamptz DEFAULT now() NULL,
	passed bool NOT NULL,
	checks jsonb NOT NULL, -- Array of check results from all validation layers (consistency, arithmetic, fractions)
	errors jsonb NULL, -- Array of validation errors with severity and suggested fixes
	warnings jsonb NULL,
	auto_corrected bool DEFAULT false NULL,
	corrections_applied jsonb NULL, -- Auto-corrections that were applied to pass validation
	reviewed_by uuid NULL,
	reviewed_at timestamptz NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT question_validations_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_validations_failed ON public.question_validations USING btree (passed) WHERE (passed = false);
CREATE INDEX idx_validations_question_id ON public.question_validations USING btree (question_id);
CREATE INDEX idx_validations_run_at ON public.question_validations USING btree (validation_run_at DESC);
COMMENT ON TABLE public.question_validations IS 'Stores validation results for AI-generated questions. Part of the quality control pipeline.';

-- Column comments

COMMENT ON COLUMN public.question_validations.checks IS 'Array of check results from all validation layers (consistency, arithmetic, fractions)';
COMMENT ON COLUMN public.question_validations.errors IS 'Array of validation errors with severity and suggested fixes';
COMMENT ON COLUMN public.question_validations.corrections_applied IS 'Auto-corrections that were applied to pass validation';

-- Permissions

ALTER TABLE public.question_validations OWNER TO postgres;
GRANT ALL ON TABLE public.question_validations TO postgres;
GRANT ALL ON TABLE public.question_validations TO anon;
GRANT ALL ON TABLE public.question_validations TO authenticated;
GRANT ALL ON TABLE public.question_validations TO service_role;


-- public.questions definition

-- Drop table

-- DROP TABLE public.questions;

CREATE TABLE public.questions (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	subject text NOT NULL,
	topic text NOT NULL,
	subtopic text NULL,
	question_type text NULL,
	question_text text NOT NULL,
	"options" jsonb NOT NULL,
	correct_answer text NOT NULL,
	explanations jsonb NOT NULL, -- Three explanation styles for different learning preferences
	difficulty text NOT NULL, -- foundation: easier questions for building confidence | standard: aligned with typical exam difficulty | challenge: harder questions for stretch and extension
	year_group int4 NULL, -- UK school year: 3 (age 7-8), 4 (age 8-9), 5 (age 9-10), 6 (age 10-11)
	curriculum_reference text NULL,
	exam_board text DEFAULT 'generic'::text NOT NULL, -- GL Assessment, CEM, ISEB, or generic (default for imported questions)
	ember_score int4 DEFAULT 66 NOT NULL, -- 0-100 quality score: 60+ required for publishing. Default 66 for verified imports.
	ember_score_breakdown jsonb NULL,
	is_published bool DEFAULT false NOT NULL,
	created_by uuid DEFAULT 'a0000000-0000-0000-0000-000000000001'::uuid NULL, -- Content creator/admin. Defaults to system import profile.
	reviewed_by uuid NULL,
	reviewed_at timestamptz NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	updated_at timestamptz DEFAULT now() NOT NULL,
	review_status text DEFAULT 'ai_only'::text NULL, -- Expert review status: reviewed (full review), spot_checked (quick verification), ai_only (no human review yet)
	helpful_count int4 DEFAULT 0 NOT NULL,
	not_helpful_count int4 DEFAULT 0 NOT NULL,
	primary_curriculum_code varchar(30) NULL, -- Primary curriculum objective code (e.g., Y5-MATH-F-03) or question type code (e.g., VR-GL-SYN)
	external_id varchar(50) NULL, -- Original question ID from import source (e.g., ENG-VOC-syno-F-Y3-00001). Used for deduplication during imports.
	CONSTRAINT questions_difficulty_check CHECK ((difficulty = ANY (ARRAY['foundation'::text, 'standard'::text, 'challenge'::text]))),
	CONSTRAINT questions_ember_score_check CHECK (((ember_score >= 0) AND (ember_score <= 100))),
	CONSTRAINT questions_exam_board_check CHECK ((exam_board = ANY (ARRAY['gl'::text, 'cem'::text, 'iseb'::text, 'generic'::text]))),
	CONSTRAINT questions_pkey PRIMARY KEY (id),
	CONSTRAINT questions_review_status_check CHECK ((review_status = ANY (ARRAY['reviewed'::text, 'spot_checked'::text, 'ai_only'::text]))),
	CONSTRAINT questions_subject_check CHECK ((subject = ANY (ARRAY['verbal_reasoning'::text, 'english'::text, 'mathematics'::text]))),
	CONSTRAINT questions_year_group_check CHECK ((year_group = ANY (ARRAY[3, 4, 5, 6]))),
	CONSTRAINT valid_ember_score CHECK (((is_published = false) OR (ember_score >= 60))),
	CONSTRAINT valid_options CHECK ((jsonb_array_length(options) = 5))
);
CREATE INDEX idx_questions_curriculum_code ON public.questions USING btree (primary_curriculum_code);
CREATE INDEX idx_questions_ember_score ON public.questions USING btree (ember_score) WHERE (is_published = true);
CREATE INDEX idx_questions_ember_score_published ON public.questions USING btree (ember_score DESC, is_published) WHERE (is_published = true);
CREATE UNIQUE INDEX idx_questions_external_id ON public.questions USING btree (external_id) WHERE (external_id IS NOT NULL);
CREATE INDEX idx_questions_helpful ON public.questions USING btree (helpful_count DESC);
CREATE INDEX idx_questions_published ON public.questions USING btree (subject, difficulty, year_group) WHERE ((is_published = true) AND (ember_score >= 60));
CREATE INDEX idx_questions_review ON public.questions USING btree (is_published, reviewed_at);
CREATE INDEX idx_questions_review_status ON public.questions USING btree (review_status);
CREATE INDEX idx_questions_topic ON public.questions USING btree (topic, subtopic) WHERE (is_published = true);
COMMENT ON TABLE public.questions IS 'Question bank - only questions with ember_score >= 60 are served to users';

-- Column comments

COMMENT ON COLUMN public.questions.explanations IS 'Three explanation styles for different learning preferences';
COMMENT ON COLUMN public.questions.difficulty IS 'foundation: easier questions for building confidence | standard: aligned with typical exam difficulty | challenge: harder questions for stretch and extension';
COMMENT ON COLUMN public.questions.year_group IS 'UK school year: 3 (age 7-8), 4 (age 8-9), 5 (age 9-10), 6 (age 10-11)';
COMMENT ON COLUMN public.questions.exam_board IS 'GL Assessment, CEM, ISEB, or generic (default for imported questions)';
COMMENT ON COLUMN public.questions.ember_score IS '0-100 quality score: 60+ required for publishing. Default 66 for verified imports.';
COMMENT ON COLUMN public.questions.created_by IS 'Content creator/admin. Defaults to system import profile.';
COMMENT ON COLUMN public.questions.review_status IS 'Expert review status: reviewed (full review), spot_checked (quick verification), ai_only (no human review yet)';
COMMENT ON COLUMN public.questions.primary_curriculum_code IS 'Primary curriculum objective code (e.g., Y5-MATH-F-03) or question type code (e.g., VR-GL-SYN)';
COMMENT ON COLUMN public.questions.external_id IS 'Original question ID from import source (e.g., ENG-VOC-syno-F-Y3-00001). Used for deduplication during imports.';

-- Table Triggers

create trigger log_question_creation after
insert
    on
    public.questions for each row execute function trigger_log_question_creation();
create trigger log_question_modification after
update
    on
    public.questions for each row execute function trigger_log_question_modification();
create trigger update_questions_updated_at before
update
    on
    public.questions for each row execute function update_updated_at_column();

-- Permissions

ALTER TABLE public.questions OWNER TO postgres;
GRANT ALL ON TABLE public.questions TO postgres;
GRANT ALL ON TABLE public.questions TO anon;
GRANT ALL ON TABLE public.questions TO authenticated;
GRANT ALL ON TABLE public.questions TO service_role;


-- public.session_feedback definition

-- Drop table

-- DROP TABLE public.session_feedback;

CREATE TABLE public.session_feedback (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	session_id uuid NOT NULL,
	child_id uuid NOT NULL,
	parent_id uuid NOT NULL,
	rating int4 NOT NULL,
	positive_feedback text NULL,
	improvement_suggestions text NULL,
	difficulty_appropriate bool NULL,
	explanations_helpful bool NULL,
	would_recommend bool NULL,
	created_at timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT session_feedback_pkey PRIMARY KEY (id),
	CONSTRAINT session_feedback_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);
CREATE INDEX idx_session_feedback_child ON public.session_feedback USING btree (child_id);
CREATE INDEX idx_session_feedback_rating ON public.session_feedback USING btree (rating);
CREATE INDEX idx_session_feedback_session ON public.session_feedback USING btree (session_id);
CREATE UNIQUE INDEX idx_session_feedback_unique ON public.session_feedback USING btree (session_id);
COMMENT ON TABLE public.session_feedback IS 'Post-session experience feedback with ratings and suggestions';

-- Permissions

ALTER TABLE public.session_feedback OWNER TO postgres;
GRANT ALL ON TABLE public.session_feedback TO postgres;
GRANT ALL ON TABLE public.session_feedback TO anon;
GRANT ALL ON TABLE public.session_feedback TO authenticated;
GRANT ALL ON TABLE public.session_feedback TO service_role;


-- public.admin_audit_log foreign keys

ALTER TABLE public.admin_audit_log ADD CONSTRAINT admin_audit_log_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


-- public.child_question_history foreign keys

ALTER TABLE public.child_question_history ADD CONSTRAINT child_question_history_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;
ALTER TABLE public.child_question_history ADD CONSTRAINT child_question_history_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;
ALTER TABLE public.child_question_history ADD CONSTRAINT child_question_history_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.practice_sessions(id) ON DELETE SET NULL;


-- public.child_topic_performance foreign keys

ALTER TABLE public.child_topic_performance ADD CONSTRAINT child_topic_performance_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


-- public.children foreign keys

ALTER TABLE public.children ADD CONSTRAINT children_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


-- public.error_reports foreign keys

ALTER TABLE public.error_reports ADD CONSTRAINT error_reports_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;
ALTER TABLE public.error_reports ADD CONSTRAINT error_reports_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.error_reports ADD CONSTRAINT error_reports_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id);


-- public.impersonation_sessions foreign keys

ALTER TABLE public.impersonation_sessions ADD CONSTRAINT impersonation_sessions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.impersonation_sessions ADD CONSTRAINT impersonation_sessions_target_user_id_fkey FOREIGN KEY (target_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


-- public.nps_surveys foreign keys

ALTER TABLE public.nps_surveys ADD CONSTRAINT nps_surveys_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;
ALTER TABLE public.nps_surveys ADD CONSTRAINT nps_surveys_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- public.practice_sessions foreign keys

ALTER TABLE public.practice_sessions ADD CONSTRAINT practice_sessions_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;


-- public.profiles foreign keys

ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- public.question_attempts foreign keys

ALTER TABLE public.question_attempts ADD CONSTRAINT question_attempts_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;
ALTER TABLE public.question_attempts ADD CONSTRAINT question_attempts_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;
ALTER TABLE public.question_attempts ADD CONSTRAINT question_attempts_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.practice_sessions(id) ON DELETE CASCADE;


-- public.question_curriculum_alignment foreign keys

ALTER TABLE public.question_curriculum_alignment ADD CONSTRAINT question_curriculum_alignment_objective_id_fkey FOREIGN KEY (objective_id) REFERENCES public.curriculum_objectives(id) ON DELETE CASCADE;
ALTER TABLE public.question_curriculum_alignment ADD CONSTRAINT question_curriculum_alignment_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


-- public.question_feedback foreign keys

ALTER TABLE public.question_feedback ADD CONSTRAINT question_feedback_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;
ALTER TABLE public.question_feedback ADD CONSTRAINT question_feedback_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.question_feedback ADD CONSTRAINT question_feedback_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;
ALTER TABLE public.question_feedback ADD CONSTRAINT question_feedback_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.practice_sessions(id) ON DELETE SET NULL;


-- public.question_provenance foreign keys

ALTER TABLE public.question_provenance ADD CONSTRAINT question_provenance_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id);
ALTER TABLE public.question_provenance ADD CONSTRAINT question_provenance_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;


-- public.question_type_alignment foreign keys

ALTER TABLE public.question_type_alignment ADD CONSTRAINT question_type_alignment_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;
ALTER TABLE public.question_type_alignment ADD CONSTRAINT question_type_alignment_type_id_fkey FOREIGN KEY (type_id) REFERENCES public.question_type_taxonomy(id) ON DELETE CASCADE;


-- public.question_validations foreign keys

ALTER TABLE public.question_validations ADD CONSTRAINT question_validations_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id);


-- public.questions foreign keys

ALTER TABLE public.questions ADD CONSTRAINT questions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);
ALTER TABLE public.questions ADD CONSTRAINT questions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id);


-- public.session_feedback foreign keys

ALTER TABLE public.session_feedback ADD CONSTRAINT session_feedback_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE;
ALTER TABLE public.session_feedback ADD CONSTRAINT session_feedback_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.session_feedback ADD CONSTRAINT session_feedback_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.practice_sessions(id) ON DELETE CASCADE;


-- public.child_daily_stats source

CREATE MATERIALIZED VIEW public.child_daily_stats
TABLESPACE pg_default
AS SELECT qa.child_id,
    date(qa.created_at) AS practice_date,
    q.subject,
    count(*) AS questions_attempted,
    count(*) FILTER (WHERE qa.is_correct) AS correct_answers,
    round(count(*) FILTER (WHERE qa.is_correct)::numeric / NULLIF(count(*), 0)::numeric * 100::numeric, 2) AS accuracy_percentage,
    round(avg(qa.time_taken_seconds), 2) AS avg_time_seconds,
    sum(qa.time_taken_seconds)::numeric / 60.0 AS total_minutes,
    count(DISTINCT qa.session_id) AS sessions_completed,
    count(DISTINCT q.topic) AS topics_covered,
    array_agg(DISTINCT q.topic) AS topics_practiced
   FROM question_attempts qa
     JOIN questions q ON qa.question_id = q.id
  GROUP BY qa.child_id, (date(qa.created_at)), q.subject
  ORDER BY qa.child_id, (date(qa.created_at)) DESC
WITH DATA;

-- View indexes:
CREATE INDEX idx_child_daily_stats_child_date ON public.child_daily_stats USING btree (child_id, practice_date);
CREATE INDEX idx_child_daily_stats_subject ON public.child_daily_stats USING btree (subject);
CREATE UNIQUE INDEX idx_child_daily_stats_unique ON public.child_daily_stats USING btree (child_id, practice_date, subject);


COMMENT ON MATERIALIZED VIEW public.child_daily_stats IS 'Aggregated daily performance statistics per child. Refreshed periodically.';

-- Permissions

ALTER TABLE public.child_daily_stats OWNER TO postgres;
GRANT ALL ON TABLE public.child_daily_stats TO postgres;
GRANT ALL ON TABLE public.child_daily_stats TO anon;
GRANT ALL ON TABLE public.child_daily_stats TO authenticated;
GRANT ALL ON TABLE public.child_daily_stats TO service_role;


-- public.child_progress_summary source

CREATE OR REPLACE VIEW public.child_progress_summary
AS SELECT c.id AS child_id,
    c.name AS child_name,
    c.parent_id,
    count(DISTINCT ps.id) AS total_sessions,
    count(qa.id) AS total_questions_answered,
    count(qa.id) FILTER (WHERE qa.is_correct) AS correct_answers,
    round(100.0 * count(qa.id) FILTER (WHERE qa.is_correct)::numeric / NULLIF(count(qa.id), 0)::numeric, 1) AS accuracy_percentage,
    max(ps.created_at) AS last_practice_date
   FROM children c
     LEFT JOIN practice_sessions ps ON ps.child_id = c.id
     LEFT JOIN question_attempts qa ON qa.child_id = c.id
  WHERE c.is_active = true
  GROUP BY c.id, c.name, c.parent_id;

COMMENT ON VIEW public.child_progress_summary IS 'High-level progress metrics per child';

-- Permissions

ALTER TABLE public.child_progress_summary OWNER TO postgres;
GRANT ALL ON TABLE public.child_progress_summary TO postgres;
GRANT ALL ON TABLE public.child_progress_summary TO anon;
GRANT ALL ON TABLE public.child_progress_summary TO authenticated;
GRANT ALL ON TABLE public.child_progress_summary TO service_role;


-- public.child_subject_summary source

CREATE MATERIALIZED VIEW public.child_subject_summary
TABLESPACE pg_default
AS WITH subject_stats AS (
         SELECT qa.child_id,
            q.subject,
            count(*) AS total_questions,
            count(*) FILTER (WHERE qa.is_correct) AS correct_answers,
            round(count(*) FILTER (WHERE qa.is_correct)::numeric / NULLIF(count(*), 0)::numeric * 100::numeric, 2) AS accuracy,
            round(avg(qa.time_taken_seconds), 2) AS avg_time_seconds,
            count(DISTINCT q.topic) AS topics_practiced,
            max(qa.created_at) AS last_practiced_at
           FROM question_attempts qa
             JOIN questions q ON qa.question_id = q.id
          GROUP BY qa.child_id, q.subject
        ), recent_stats AS (
         SELECT qa.child_id,
            q.subject,
            round(count(*) FILTER (WHERE qa.is_correct)::numeric / NULLIF(count(*), 0)::numeric * 100::numeric, 2) AS recent_accuracy
           FROM question_attempts qa
             JOIN questions q ON qa.question_id = q.id
          WHERE qa.created_at > (now() - '7 days'::interval)
          GROUP BY qa.child_id, q.subject
        ), total_topics AS (
         SELECT questions.subject,
            count(DISTINCT questions.topic) AS total_available_topics
           FROM questions
          WHERE questions.is_published = true
          GROUP BY questions.subject
        )
 SELECT ss.child_id,
    ss.subject,
        CASE ss.subject
            WHEN 'mathematics'::text THEN 'Mathematics'::text
            WHEN 'english'::text THEN 'English'::text
            WHEN 'verbal_reasoning'::text THEN 'Verbal Reasoning'::text
            ELSE ss.subject
        END AS subject_label,
    ss.total_questions,
    ss.correct_answers,
    ss.accuracy,
    ss.avg_time_seconds,
    ss.topics_practiced,
    COALESCE(tt.total_available_topics, 0::bigint) AS total_available_topics,
    round(ss.topics_practiced::numeric / NULLIF(tt.total_available_topics, 0)::numeric * 100::numeric, 2) AS topic_coverage_percentage,
    ss.last_practiced_at,
        CASE
            WHEN ss.accuracy >= 85::numeric THEN 'mastered'::text
            WHEN ss.accuracy >= 70::numeric THEN 'proficient'::text
            WHEN ss.accuracy >= 55::numeric THEN 'developing'::text
            ELSE 'needs_practice'::text
        END AS mastery_level,
        CASE
            WHEN rs.recent_accuracy IS NULL THEN 'stable'::text
            WHEN rs.recent_accuracy > (ss.accuracy + 5::numeric) THEN 'up'::text
            WHEN rs.recent_accuracy < (ss.accuracy - 5::numeric) THEN 'down'::text
            ELSE 'stable'::text
        END AS trend,
    rs.recent_accuracy
   FROM subject_stats ss
     LEFT JOIN recent_stats rs ON ss.child_id = rs.child_id AND ss.subject = rs.subject
     LEFT JOIN total_topics tt ON ss.subject = tt.subject
WITH DATA;

-- View indexes:
CREATE INDEX idx_child_subject_summary_child ON public.child_subject_summary USING btree (child_id);
CREATE UNIQUE INDEX idx_child_subject_summary_unique ON public.child_subject_summary USING btree (child_id, subject);


COMMENT ON MATERIALIZED VIEW public.child_subject_summary IS 'Subject-level performance summary with coverage metrics.';

-- Permissions

ALTER TABLE public.child_subject_summary OWNER TO postgres;
GRANT ALL ON TABLE public.child_subject_summary TO postgres;
GRANT ALL ON TABLE public.child_subject_summary TO anon;
GRANT ALL ON TABLE public.child_subject_summary TO authenticated;
GRANT ALL ON TABLE public.child_subject_summary TO service_role;


-- public.child_topic_mastery source

CREATE MATERIALIZED VIEW public.child_topic_mastery
TABLESPACE pg_default
AS WITH topic_stats AS (
         SELECT qa.child_id,
            q.subject,
            q.topic,
            count(*) AS total_questions,
            count(*) FILTER (WHERE qa.is_correct) AS correct_answers,
            round(count(*) FILTER (WHERE qa.is_correct)::numeric / NULLIF(count(*), 0)::numeric * 100::numeric, 2) AS accuracy,
            round(avg(qa.time_taken_seconds), 2) AS avg_time_seconds,
            max(qa.created_at) AS last_practiced_at,
            count(*) FILTER (WHERE q.difficulty = 'foundation'::text) AS foundation_count,
            count(*) FILTER (WHERE q.difficulty = 'standard'::text) AS standard_count,
            count(*) FILTER (WHERE q.difficulty = 'challenge'::text) AS challenge_count,
            round(count(*) FILTER (WHERE q.difficulty = 'foundation'::text AND qa.is_correct)::numeric / NULLIF(count(*) FILTER (WHERE q.difficulty = 'foundation'::text), 0)::numeric * 100::numeric, 2) AS foundation_accuracy,
            round(count(*) FILTER (WHERE q.difficulty = 'standard'::text AND qa.is_correct)::numeric / NULLIF(count(*) FILTER (WHERE q.difficulty = 'standard'::text), 0)::numeric * 100::numeric, 2) AS standard_accuracy,
            round(count(*) FILTER (WHERE q.difficulty = 'challenge'::text AND qa.is_correct)::numeric / NULLIF(count(*) FILTER (WHERE q.difficulty = 'challenge'::text), 0)::numeric * 100::numeric, 2) AS challenge_accuracy
           FROM question_attempts qa
             JOIN questions q ON qa.question_id = q.id
          GROUP BY qa.child_id, q.subject, q.topic
        ), recent_trend AS (
         SELECT qa.child_id,
            q.subject,
            q.topic,
            round(count(*) FILTER (WHERE qa.is_correct AND qa.created_at > (now() - '7 days'::interval))::numeric / NULLIF(count(*) FILTER (WHERE qa.created_at > (now() - '7 days'::interval)), 0)::numeric * 100::numeric, 2) AS recent_accuracy,
            count(*) FILTER (WHERE qa.created_at > (now() - '7 days'::interval)) AS recent_count
           FROM question_attempts qa
             JOIN questions q ON qa.question_id = q.id
          GROUP BY qa.child_id, q.subject, q.topic
        )
 SELECT ts.child_id,
    ts.subject,
    ts.topic,
    ts.total_questions,
    ts.correct_answers,
    ts.accuracy,
    ts.avg_time_seconds,
    ts.last_practiced_at,
        CASE
            WHEN ts.accuracy >= 85::numeric THEN 'mastered'::text
            WHEN ts.accuracy >= 70::numeric THEN 'proficient'::text
            WHEN ts.accuracy >= 55::numeric THEN 'developing'::text
            ELSE 'needs_practice'::text
        END AS mastery_level,
        CASE
            WHEN rt.recent_count < 3 THEN 'stable'::text
            WHEN rt.recent_accuracy > (ts.accuracy + 5::numeric) THEN 'up'::text
            WHEN rt.recent_accuracy < (ts.accuracy - 5::numeric) THEN 'down'::text
            ELSE 'stable'::text
        END AS trend,
    ts.foundation_count,
    ts.standard_count,
    ts.challenge_count,
    ts.foundation_accuracy,
    ts.standard_accuracy,
    ts.challenge_accuracy,
    ts.accuracy < 60::numeric AS needs_focus,
    rt.recent_accuracy,
    rt.recent_count
   FROM topic_stats ts
     LEFT JOIN recent_trend rt ON ts.child_id = rt.child_id AND ts.subject = rt.subject AND ts.topic = rt.topic
WITH DATA;

-- View indexes:
CREATE INDEX idx_child_topic_mastery_child ON public.child_topic_mastery USING btree (child_id);
CREATE INDEX idx_child_topic_mastery_needs_focus ON public.child_topic_mastery USING btree (child_id, needs_focus) WHERE (needs_focus = true);
CREATE UNIQUE INDEX idx_child_topic_mastery_unique ON public.child_topic_mastery USING btree (child_id, subject, topic);


COMMENT ON MATERIALIZED VIEW public.child_topic_mastery IS 'Topic-level mastery tracking including difficulty breakdown and trends.';

-- Permissions

ALTER TABLE public.child_topic_mastery OWNER TO postgres;
GRANT ALL ON TABLE public.child_topic_mastery TO postgres;
GRANT ALL ON TABLE public.child_topic_mastery TO anon;
GRANT ALL ON TABLE public.child_topic_mastery TO authenticated;
GRANT ALL ON TABLE public.child_topic_mastery TO service_role;


-- public.child_weekly_summary source

CREATE MATERIALIZED VIEW public.child_weekly_summary
TABLESPACE pg_default
AS SELECT qa.child_id,
    date_trunc('week'::text, qa.created_at)::date AS week_start,
    (date_trunc('week'::text, qa.created_at) + '6 days'::interval)::date AS week_end,
    count(*) AS total_questions,
    count(DISTINCT date(qa.created_at)) AS days_practiced,
    count(DISTINCT qa.session_id) AS sessions_completed,
    count(*) FILTER (WHERE qa.is_correct) AS correct_answers,
    round(count(*) FILTER (WHERE qa.is_correct)::numeric / NULLIF(count(*), 0)::numeric * 100::numeric, 2) AS accuracy_percentage,
    sum(qa.time_taken_seconds)::numeric / 60.0 AS total_practice_minutes,
    round(avg(qa.time_taken_seconds), 2) AS avg_time_per_question,
    count(*) FILTER (WHERE q.subject = 'mathematics'::text) AS maths_questions,
    count(*) FILTER (WHERE q.subject = 'english'::text) AS english_questions,
    count(*) FILTER (WHERE q.subject = 'verbal_reasoning'::text) AS vr_questions,
    count(*) FILTER (WHERE q.difficulty = 'foundation'::text) AS foundation_questions,
    count(*) FILTER (WHERE q.difficulty = 'standard'::text) AS standard_questions,
    count(*) FILTER (WHERE q.difficulty = 'challenge'::text) AS challenge_questions,
    count(DISTINCT q.topic) AS unique_topics
   FROM question_attempts qa
     JOIN questions q ON qa.question_id = q.id
  GROUP BY qa.child_id, (date_trunc('week'::text, qa.created_at))
  ORDER BY qa.child_id, (date_trunc('week'::text, qa.created_at)::date) DESC
WITH DATA;

-- View indexes:
CREATE INDEX idx_child_weekly_summary_child ON public.child_weekly_summary USING btree (child_id);
CREATE UNIQUE INDEX idx_child_weekly_summary_unique ON public.child_weekly_summary USING btree (child_id, week_start);


COMMENT ON MATERIALIZED VIEW public.child_weekly_summary IS 'Weekly aggregated performance summaries for trend analysis.';

-- Permissions

ALTER TABLE public.child_weekly_summary OWNER TO postgres;
GRANT ALL ON TABLE public.child_weekly_summary TO postgres;
GRANT ALL ON TABLE public.child_weekly_summary TO anon;
GRANT ALL ON TABLE public.child_weekly_summary TO authenticated;
GRANT ALL ON TABLE public.child_weekly_summary TO service_role;


-- public.question_stats source

CREATE MATERIALIZED VIEW public.question_stats
TABLESPACE pg_default
AS SELECT q.id AS question_id,
    count(DISTINCT qa.id) AS total_attempts,
    round(count(
        CASE
            WHEN qa.is_correct THEN 1
            ELSE NULL::integer
        END)::numeric / NULLIF(count(qa.id), 0)::numeric * 100::numeric, 2) AS correct_percentage,
    round(avg(qa.time_taken_seconds), 2) AS avg_time_seconds,
    ( SELECT count(*) AS count
           FROM error_reports er
          WHERE er.question_id = q.id AND er.status = 'pending'::text) AS error_report_count,
    0 AS helpful_votes,
    0 AS not_helpful_votes,
    now() AS last_updated
   FROM questions q
     LEFT JOIN question_attempts qa ON q.id = qa.question_id
  GROUP BY q.id
WITH DATA;

-- View indexes:
CREATE INDEX idx_question_stats_attempts ON public.question_stats USING btree (total_attempts);
CREATE INDEX idx_question_stats_errors ON public.question_stats USING btree (error_report_count);
CREATE UNIQUE INDEX idx_question_stats_question_id ON public.question_stats USING btree (question_id);


COMMENT ON MATERIALIZED VIEW public.question_stats IS 'Aggregated statistics for Ember Score community feedback calculation. Refresh periodically or on-demand.';

-- Permissions

ALTER TABLE public.question_stats OWNER TO postgres;
GRANT ALL ON TABLE public.question_stats TO postgres;
GRANT ALL ON TABLE public.question_stats TO anon;
GRANT ALL ON TABLE public.question_stats TO authenticated;
GRANT ALL ON TABLE public.question_stats TO service_role;


-- public.validation_review_queue source

CREATE OR REPLACE VIEW public.validation_review_queue
AS SELECT qv.id,
    qv.question_id,
    qv.validation_run_at,
    qv.passed,
    qv.checks,
    qv.errors,
    qv.warnings,
    qv.auto_corrected,
    qv.corrections_applied,
    qv.reviewed_by,
    qv.reviewed_at,
    qv.created_at,
    q.question_text,
    q.topic,
    q.subtopic,
    q.difficulty
   FROM question_validations qv
     LEFT JOIN questions q ON q.external_id::text = qv.question_id OR q.id::text = qv.question_id
  WHERE qv.passed = false AND qv.reviewed_at IS NULL
  ORDER BY qv.validation_run_at DESC;

-- Permissions

ALTER TABLE public.validation_review_queue OWNER TO postgres;
GRANT ALL ON TABLE public.validation_review_queue TO postgres;
GRANT ALL ON TABLE public.validation_review_queue TO anon;
GRANT ALL ON TABLE public.validation_review_queue TO authenticated;
GRANT ALL ON TABLE public.validation_review_queue TO service_role;



-- DROP FUNCTION public.calculate_benchmark_percentiles(uuid, int4);

CREATE OR REPLACE FUNCTION public.calculate_benchmark_percentiles(p_child_id uuid, p_days integer DEFAULT 30)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSON;
  v_start_date TIMESTAMPTZ;
  v_year_group TEXT;
  v_child_accuracy NUMERIC;
  v_overall_percentile INT;
BEGIN
  v_start_date := CURRENT_DATE - (p_days || ' days')::INTERVAL;

  -- Get child's year group and accuracy
  SELECT 
    c.year_group::TEXT,
    ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1)
  INTO v_year_group, v_child_accuracy
  FROM children c
  LEFT JOIN question_attempts qa ON qa.child_id = c.id 
    AND qa.created_at >= v_start_date
  WHERE c.id = p_child_id
  GROUP BY c.year_group;

  -- Calculate overall percentile
  WITH cohort_accuracies AS (
    SELECT 
      qa.child_id,
      AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END) as accuracy
    FROM question_attempts qa
    JOIN children c ON c.id = qa.child_id
    WHERE c.year_group::TEXT = v_year_group
      AND qa.created_at >= v_start_date
    GROUP BY qa.child_id
    HAVING COUNT(*) >= 10
  )
  SELECT ROUND((COUNT(*) FILTER (WHERE accuracy <= v_child_accuracy)::NUMERIC / NULLIF(COUNT(*), 0)) * 100)
  INTO v_overall_percentile
  FROM cohort_accuracies;

  -- Calculate subject percentiles
  WITH subject_percentiles AS (
    SELECT 
      q.subject,
      ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1) as child_accuracy,
      (
        SELECT ROUND((COUNT(*) FILTER (WHERE acc <= ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1))::NUMERIC / NULLIF(COUNT(*), 0)) * 100)
        FROM (
          SELECT 
            qa2.child_id,
            AVG(CASE WHEN qa2.is_correct THEN 100.0 ELSE 0.0 END) as acc
          FROM question_attempts qa2
          JOIN questions q2 ON q2.id = qa2.question_id
          JOIN children c2 ON c2.id = qa2.child_id
          WHERE c2.year_group::TEXT = v_year_group
            AND q2.subject = q.subject
            AND qa2.created_at >= v_start_date
          GROUP BY qa2.child_id
          HAVING COUNT(*) >= 5
        ) cohort
      ) as percentile
    FROM question_attempts qa
    JOIN questions q ON q.id = qa.question_id
    WHERE qa.child_id = p_child_id
      AND qa.created_at >= v_start_date
    GROUP BY q.subject
  )
  SELECT json_build_object(
    'overallPercentile', COALESCE(v_overall_percentile, 50),
    'subjectPercentiles', COALESCE(json_agg(
      json_build_object(
        'subject', subject,
        'accuracy', child_accuracy,
        'percentile', COALESCE(percentile, 50)
      )
    ), '[]'::json),
    'cohortSize', (
      SELECT COUNT(DISTINCT child_id)
      FROM question_attempts qa
      JOIN children c ON c.id = qa.child_id
      WHERE c.year_group::TEXT = v_year_group
        AND qa.created_at >= v_start_date
    )
  ) INTO result
  FROM subject_percentiles;

  RETURN result;
END;
$function$
;

COMMENT ON FUNCTION public.calculate_benchmark_percentiles(uuid, int4) IS 'Calculates percentile rankings vs same year group cohort';

-- Permissions

ALTER FUNCTION public.calculate_benchmark_percentiles(uuid, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.calculate_benchmark_percentiles(uuid, int4) TO public;
GRANT ALL ON FUNCTION public.calculate_benchmark_percentiles(uuid, int4) TO postgres;
GRANT ALL ON FUNCTION public.calculate_benchmark_percentiles(uuid, int4) TO anon;
GRANT ALL ON FUNCTION public.calculate_benchmark_percentiles(uuid, int4) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_benchmark_percentiles(uuid, int4) TO service_role;

-- DROP FUNCTION public.calculate_ember_score(uuid);

CREATE OR REPLACE FUNCTION public.calculate_ember_score(p_question_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_curriculum_score INTEGER := 0;
  v_exam_pattern_score INTEGER := 0;
  v_community_score INTEGER := 0;
  v_technical_score INTEGER := 0;
  v_total_score INTEGER := 0;
  
  -- Metrics for calculation
  v_has_curriculum_ref BOOLEAN;
  v_has_curriculum_alignment BOOLEAN;
  v_helpful_count INTEGER;
  v_not_helpful_count INTEGER;
  v_total_attempts INTEGER;
  v_avg_time_seconds NUMERIC;
  v_has_complete_explanations BOOLEAN;
BEGIN
  -- Check if question exists
  IF NOT EXISTS (SELECT 1 FROM questions WHERE id = p_question_id) THEN
    RETURN 60; -- Return minimum valid score
  END IF;
  
  -- Get question data
  SELECT 
    curriculum_reference IS NOT NULL AND curriculum_reference != '',
    (explanations->>'step_by_step' IS NOT NULL AND explanations->>'step_by_step' != '')
      AND (explanations->>'visual' IS NOT NULL OR explanations->>'worked_example' IS NOT NULL)
  INTO v_has_curriculum_ref, v_has_complete_explanations
  FROM questions
  WHERE id = p_question_id;
  
  -- Check for curriculum alignment
  SELECT EXISTS(
    SELECT 1 FROM question_curriculum_alignment qca WHERE qca.question_id = p_question_id
  ) INTO v_has_curriculum_alignment;
  
  -- Get community feedback metrics
  SELECT 
    COUNT(*) FILTER (WHERE is_helpful = true),
    COUNT(*) FILTER (WHERE is_helpful = false)
  INTO v_helpful_count, v_not_helpful_count
  FROM question_feedback
  WHERE question_id = p_question_id;
  
  -- Get usage metrics
  SELECT 
    COUNT(*),
    AVG(time_taken_seconds)
  INTO v_total_attempts, v_avg_time_seconds
  FROM question_attempts
  WHERE question_id = p_question_id;
  
  -- =============================================================================
  -- CURRICULUM ALIGNMENT SCORE (0-25 points)
  -- =============================================================================
  IF v_has_curriculum_alignment THEN
    v_curriculum_score := 25;
  ELSIF v_has_curriculum_ref THEN
    v_curriculum_score := 20;
  ELSE
    v_curriculum_score := 15; -- Increased minimum to ensure >= 60 total
  END IF;
  
  -- =============================================================================
  -- EXAM PATTERN SCORE (0-25 points)
  -- Based on question structure and metadata
  -- =============================================================================
  v_exam_pattern_score := 20; -- Increased base score
  
  -- Bonus for complete explanations
  IF v_has_complete_explanations THEN
    v_exam_pattern_score := v_exam_pattern_score + 5;
  END IF;
  
  -- =============================================================================
  -- COMMUNITY SCORE (0-15 points)
  -- Based on user feedback
  -- =============================================================================
  IF v_helpful_count + v_not_helpful_count > 0 THEN
    v_community_score := LEAST(15, ROUND(
      (v_helpful_count::NUMERIC / (v_helpful_count + v_not_helpful_count)) * 15
    ));
  ELSE
    -- No feedback yet, give neutral score
    v_community_score := 10;
  END IF;
  
  -- =============================================================================
  -- TECHNICAL SCORE (0-10 points)
  -- Based on usage patterns and answer distribution
  -- =============================================================================
  v_technical_score := 8; -- Base score for valid structure
  
  -- Bonus if question has been attempted and has reasonable time
  IF v_total_attempts > 10 AND v_avg_time_seconds BETWEEN 5 AND 300 THEN
    v_technical_score := 10;
  END IF;
  
  -- =============================================================================
  -- TOTAL SCORE (minimum 60, maximum 100)
  -- =============================================================================
  v_total_score := v_curriculum_score + v_exam_pattern_score + v_community_score + v_technical_score;
  
  -- Ensure minimum score of 60 (required by valid_ember_score constraint)
  v_total_score := GREATEST(60, v_total_score);
  
  -- Cap at 100
  v_total_score := LEAST(100, v_total_score);
  
  RETURN v_total_score;
END;
$function$
;

COMMENT ON FUNCTION public.calculate_ember_score(uuid) IS 'Calculates ember_score for a question (60-100) based on curriculum alignment, exam pattern, community feedback, and technical metrics';

-- Permissions

ALTER FUNCTION public.calculate_ember_score(uuid) OWNER TO postgres;
GRANT ALL ON FUNCTION public.calculate_ember_score(uuid) TO public;
GRANT ALL ON FUNCTION public.calculate_ember_score(uuid) TO postgres;
GRANT ALL ON FUNCTION public.calculate_ember_score(uuid) TO anon;
GRANT ALL ON FUNCTION public.calculate_ember_score(uuid) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_ember_score(uuid) TO service_role;

-- DROP FUNCTION public.calculate_fatigue_dropoff(uuid, int4);

CREATE OR REPLACE FUNCTION public.calculate_fatigue_dropoff(p_child_id uuid, p_days integer DEFAULT 30)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_max_dropoff numeric;
BEGIN
  -- For each session with 10+ questions, calculate first 5 vs last 5 accuracy
  -- Return the maximum drop-off observed
  WITH session_data AS (
    SELECT 
      session_id,
      is_correct,
      ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at) as question_num,
      COUNT(*) OVER (PARTITION BY session_id) as total_questions
    FROM question_attempts
    WHERE child_id = p_child_id
      AND created_at >= NOW() - (p_days || ' days')::interval
  ),
  session_metrics AS (
    SELECT 
      session_id,
      MAX(total_questions) as total_q,
      -- First 5 accuracy: filter first 5, then average
      (SELECT AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END)
       FROM session_data sd2
       WHERE sd2.session_id = sd.session_id
         AND sd2.question_num <= 5
      ) as first_five_accuracy,
      -- Last 5 accuracy: filter last 5, then average
      (SELECT AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END)
       FROM session_data sd3
       WHERE sd3.session_id = sd.session_id
         AND sd3.question_num > sd3.total_questions - 5
      ) as last_five_accuracy
    FROM session_data sd
    WHERE total_questions >= 10  -- Only sessions with 10+ questions
    GROUP BY session_id
  )
  SELECT COALESCE(MAX(first_five_accuracy - last_five_accuracy), 0)
  INTO v_max_dropoff
  FROM session_metrics
  WHERE first_five_accuracy IS NOT NULL 
    AND last_five_accuracy IS NOT NULL
    AND (first_five_accuracy - last_five_accuracy) > 0;  -- Only drops, not improvements
  
  RETURN GREATEST(0, ROUND(COALESCE(v_max_dropoff, 0), 1));
END;
$function$
;

COMMENT ON FUNCTION public.calculate_fatigue_dropoff(uuid, int4) IS 'Calculates accuracy drop between first and last 5 questions of sessions';

-- Permissions

ALTER FUNCTION public.calculate_fatigue_dropoff(uuid, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.calculate_fatigue_dropoff(uuid, int4) TO public;
GRANT ALL ON FUNCTION public.calculate_fatigue_dropoff(uuid, int4) TO postgres;
GRANT ALL ON FUNCTION public.calculate_fatigue_dropoff(uuid, int4) TO anon;
GRANT ALL ON FUNCTION public.calculate_fatigue_dropoff(uuid, int4) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_fatigue_dropoff(uuid, int4) TO service_role;

-- DROP FUNCTION public.calculate_learning_health_v2(uuid, int4);

CREATE OR REPLACE FUNCTION public.calculate_learning_health_v2(p_child_id uuid, p_days integer DEFAULT 30)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSON;
  v_start_date TIMESTAMPTZ;
  v_rush_factor NUMERIC := 0;
  v_fatigue_dropoff NUMERIC := 0;
  v_stagnant_topics INT := 0;
  v_total_sessions INT;
  v_fast_sessions INT;
BEGIN
  v_start_date := CURRENT_DATE - (p_days || ' days')::INTERVAL;

  -- Calculate Rush Factor: % of sessions with < 15 sec per question
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE 
      EXTRACT(EPOCH FROM (completed_at - started_at)) / NULLIF(total_questions, 0) < 15
    )
  INTO v_total_sessions, v_fast_sessions
  FROM practice_sessions
  WHERE child_id = p_child_id
    AND completed_at IS NOT NULL
    AND started_at >= v_start_date;

  IF v_total_sessions > 0 THEN
    v_rush_factor := ROUND((v_fast_sessions::NUMERIC / v_total_sessions) * 100);
  END IF;

  -- Calculate Fatigue: Average accuracy decline within sessions
  WITH session_analysis AS (
    SELECT 
      session_id,
      COUNT(*) as total_q,
      AVG(CASE WHEN rn <= total_q / 2 THEN 
        CASE WHEN is_correct THEN 100.0 ELSE 0.0 END 
      END) as first_half_acc,
      AVG(CASE WHEN rn > total_q / 2 THEN 
        CASE WHEN is_correct THEN 100.0 ELSE 0.0 END 
      END) as second_half_acc
    FROM (
      SELECT 
        session_id,
        is_correct,
        ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY created_at) as rn,
        COUNT(*) OVER (PARTITION BY session_id) as total_q
      FROM question_attempts
      WHERE child_id = p_child_id
        AND session_id IS NOT NULL
        AND created_at >= v_start_date
    ) ranked
    GROUP BY session_id
    HAVING COUNT(*) >= 8
  )
  SELECT COALESCE(ROUND(AVG(GREATEST(0, first_half_acc - second_half_acc))), 0)
  INTO v_fatigue_dropoff
  FROM session_analysis;

  -- Calculate Stagnant Topics: Topics with >= 5 attempts and < 50% accuracy
  SELECT COUNT(*)
  INTO v_stagnant_topics
  FROM (
    SELECT q.topic
    FROM question_attempts qa
    JOIN questions q ON q.id = qa.question_id
    WHERE qa.child_id = p_child_id
      AND qa.created_at >= v_start_date
      AND q.topic IS NOT NULL
    GROUP BY q.topic
    HAVING COUNT(*) >= 5 
      AND AVG(CASE WHEN qa.is_correct THEN 1.0 ELSE 0.0 END) < 0.5
  ) stagnant;

  SELECT json_build_object(
    'rushFactor', v_rush_factor,
    'fatigueDropOff', v_fatigue_dropoff,
    'stagnantTopics', v_stagnant_topics
  ) INTO result;

  RETURN result;
END;
$function$
;

COMMENT ON FUNCTION public.calculate_learning_health_v2(uuid, int4) IS 'Calculates rush factor, fatigue drop-off, and stagnant topics';

-- Permissions

ALTER FUNCTION public.calculate_learning_health_v2(uuid, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.calculate_learning_health_v2(uuid, int4) TO public;
GRANT ALL ON FUNCTION public.calculate_learning_health_v2(uuid, int4) TO postgres;
GRANT ALL ON FUNCTION public.calculate_learning_health_v2(uuid, int4) TO anon;
GRANT ALL ON FUNCTION public.calculate_learning_health_v2(uuid, int4) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_learning_health_v2(uuid, int4) TO service_role;

-- DROP FUNCTION public.calculate_nps(timestamptz, timestamptz);

CREATE OR REPLACE FUNCTION public.calculate_nps(start_date timestamp with time zone DEFAULT (now() - '30 days'::interval), end_date timestamp with time zone DEFAULT now())
 RETURNS TABLE(total_responses bigint, promoters bigint, passives bigint, detractors bigint, nps_score numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_responses,
        COUNT(*) FILTER (WHERE segment = 'promoter')::BIGINT as promoters,
        COUNT(*) FILTER (WHERE segment = 'passive')::BIGINT as passives,
        COUNT(*) FILTER (WHERE segment = 'detractor')::BIGINT as detractors,
        CASE 
            WHEN COUNT(*) > 0 THEN
                ROUND(
                    ((COUNT(*) FILTER (WHERE segment = 'promoter')::NUMERIC - 
                      COUNT(*) FILTER (WHERE segment = 'detractor')::NUMERIC) / 
                     COUNT(*)::NUMERIC) * 100, 
                    1
                )
            ELSE 0
        END as nps_score
    FROM nps_surveys
    WHERE created_at BETWEEN start_date AND end_date;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.calculate_nps(timestamptz, timestamptz) OWNER TO postgres;
GRANT ALL ON FUNCTION public.calculate_nps(timestamptz, timestamptz) TO public;
GRANT ALL ON FUNCTION public.calculate_nps(timestamptz, timestamptz) TO postgres;
GRANT ALL ON FUNCTION public.calculate_nps(timestamptz, timestamptz) TO anon;
GRANT ALL ON FUNCTION public.calculate_nps(timestamptz, timestamptz) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_nps(timestamptz, timestamptz) TO service_role;

-- DROP FUNCTION public.calculate_readiness_score(uuid);

CREATE OR REPLACE FUNCTION public.calculate_readiness_score(p_child_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSON;
  v_overall_score NUMERIC;
  v_verbal_score NUMERIC;
  v_english_score NUMERIC;
  v_maths_score NUMERIC;
  v_consistency_score NUMERIC;
  v_volume_score NUMERIC;
  v_total_questions INT;
  v_days_active INT;
BEGIN
  -- Get subject scores (weighted accuracy from last 30 days)
  SELECT 
    COALESCE(ROUND(AVG(CASE WHEN q.subject = 'verbal_reasoning' THEN 
      CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END END), 1), 0),
    COALESCE(ROUND(AVG(CASE WHEN q.subject = 'english' THEN 
      CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END END), 1), 0),
    COALESCE(ROUND(AVG(CASE WHEN q.subject = 'mathematics' THEN 
      CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END END), 1), 0),
    COUNT(*)
  INTO v_verbal_score, v_english_score, v_maths_score, v_total_questions
  FROM question_attempts qa
  JOIN questions q ON q.id = qa.question_id
  WHERE qa.child_id = p_child_id
    AND qa.created_at >= CURRENT_DATE - INTERVAL '30 days';

  -- Calculate consistency (how regularly they practice)
  SELECT COUNT(DISTINCT DATE(created_at))
  INTO v_days_active
  FROM question_attempts
  WHERE child_id = p_child_id
    AND created_at >= CURRENT_DATE - INTERVAL '30 days';

  v_consistency_score := LEAST(100, (v_days_active::NUMERIC / 20) * 100);

  -- Volume score (target: 300 questions per month)
  v_volume_score := LEAST(100, (COALESCE(v_total_questions, 0)::NUMERIC / 300) * 100);

  -- Calculate overall score (weighted average)
  v_overall_score := ROUND(
    (COALESCE(v_verbal_score, 0) * 0.35) +
    (COALESCE(v_english_score, 0) * 0.25) +
    (COALESCE(v_maths_score, 0) * 0.25) +
    (v_consistency_score * 0.10) +
    (v_volume_score * 0.05)
  , 1);

  SELECT json_build_object(
    'overallScore', v_overall_score,
    'subjectScores', json_build_object(
      'verbal_reasoning', COALESCE(v_verbal_score, 0),
      'english', COALESCE(v_english_score, 0),
      'mathematics', COALESCE(v_maths_score, 0)
    ),
    'factors', json_build_object(
      'consistency', ROUND(v_consistency_score, 1),
      'volume', ROUND(v_volume_score, 1),
      'daysActive', v_days_active,
      'totalQuestions', v_total_questions
    ),
    'tier', CASE 
      WHEN v_overall_score >= 85 THEN 'exam_ready'
      WHEN v_overall_score >= 70 THEN 'on_track'
      WHEN v_overall_score >= 50 THEN 'developing'
      ELSE 'needs_focus'
    END,
    'recommendations', CASE 
      WHEN COALESCE(v_verbal_score, 0) < 60 THEN 'Focus on Verbal Reasoning practice'
      WHEN COALESCE(v_english_score, 0) < 60 THEN 'Strengthen English comprehension skills'
      WHEN COALESCE(v_maths_score, 0) < 60 THEN 'Work on Mathematics problem-solving'
      WHEN v_consistency_score < 50 THEN 'Try to practice more regularly'
      ELSE 'Keep up the great work!'
    END
  ) INTO result;

  RETURN result;
END;
$function$
;

COMMENT ON FUNCTION public.calculate_readiness_score(uuid) IS 'Calculates 11+ exam readiness score based on performance metrics';

-- Permissions

ALTER FUNCTION public.calculate_readiness_score(uuid) OWNER TO postgres;
GRANT ALL ON FUNCTION public.calculate_readiness_score(uuid) TO public;
GRANT ALL ON FUNCTION public.calculate_readiness_score(uuid) TO postgres;
GRANT ALL ON FUNCTION public.calculate_readiness_score(uuid) TO anon;
GRANT ALL ON FUNCTION public.calculate_readiness_score(uuid) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_readiness_score(uuid) TO service_role;

-- DROP FUNCTION public.calculate_readiness_score_v2(uuid, int4);

CREATE OR REPLACE FUNCTION public.calculate_readiness_score_v2(p_child_id uuid, p_days integer DEFAULT 30)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSON;
  v_start_date TIMESTAMPTZ;
  v_overall_accuracy NUMERIC;
  v_total_attempts INT;
  v_unique_topics INT;
  v_days_active INT;
  v_accuracy_score NUMERIC;
  v_coverage_score NUMERIC;
  v_consistency_score NUMERIC;
  v_speed_score NUMERIC;
  v_overall_score NUMERIC;
BEGIN
  v_start_date := CURRENT_DATE - (p_days || ' days')::INTERVAL;

  -- Get basic metrics
  SELECT 
    COUNT(*),
    ROUND(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END), 1),
    COUNT(DISTINCT DATE(created_at))
  INTO v_total_attempts, v_overall_accuracy, v_days_active
  FROM question_attempts
  WHERE child_id = p_child_id
    AND created_at >= v_start_date;

  -- Get unique topics
  SELECT COUNT(DISTINCT q.topic)
  INTO v_unique_topics
  FROM question_attempts qa
  JOIN questions q ON q.id = qa.question_id
  WHERE qa.child_id = p_child_id
    AND qa.created_at >= v_start_date
    AND q.topic IS NOT NULL;

  -- Calculate component scores (out of their max points)
  v_accuracy_score := LEAST(40, ROUND((COALESCE(v_overall_accuracy, 0) / 100) * 40));
  v_coverage_score := LEAST(20, ROUND((COALESCE(v_unique_topics, 0)::NUMERIC / 10) * 20));
  v_consistency_score := LEAST(15, ROUND((COALESCE(v_days_active, 0)::NUMERIC / 20) * 15));
  v_speed_score := LEAST(15, ROUND((COALESCE(v_total_attempts, 0)::NUMERIC / (GREATEST(p_days, 1) * 10)) * 15));

  v_overall_score := v_accuracy_score + v_coverage_score + v_consistency_score + v_speed_score;

  -- Return scores as percentages for direct display
  SELECT json_build_object(
    'overallScore', ROUND(v_overall_score),
    'accuracyPercent', ROUND((v_accuracy_score / 40) * 100),
    'coveragePercent', ROUND((v_coverage_score / 20) * 100),
    'consistencyPercent', ROUND((v_consistency_score / 15) * 100),
    'speedPercent', ROUND((v_speed_score / 15) * 100),
    'improvementPercent', 0
  ) INTO result;

  RETURN result;
END;
$function$
;

COMMENT ON FUNCTION public.calculate_readiness_score_v2(uuid, int4) IS 'Calculates exam readiness score with all component breakdowns';

-- Permissions

ALTER FUNCTION public.calculate_readiness_score_v2(uuid, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.calculate_readiness_score_v2(uuid, int4) TO public;
GRANT ALL ON FUNCTION public.calculate_readiness_score_v2(uuid, int4) TO postgres;
GRANT ALL ON FUNCTION public.calculate_readiness_score_v2(uuid, int4) TO anon;
GRANT ALL ON FUNCTION public.calculate_readiness_score_v2(uuid, int4) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_readiness_score_v2(uuid, int4) TO service_role;

-- DROP FUNCTION public.calculate_rush_factor(uuid, int4);

CREATE OR REPLACE FUNCTION public.calculate_rush_factor(p_child_id uuid, p_days integer DEFAULT 30)
 RETURNS numeric
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_total_questions integer;
  v_rushed_questions integer;
  v_rush_percentage numeric;
BEGIN
  -- Get total questions answered in the period
  SELECT COUNT(*)
  INTO v_total_questions
  FROM question_attempts
  WHERE child_id = p_child_id
    AND created_at >= NOW() - (p_days || ' days')::interval
    AND time_taken_seconds > 0; -- Exclude invalid times
  
  -- Return 0 if no questions answered
  IF v_total_questions = 0 THEN
    RETURN 0;
  END IF;
  
  -- Count questions answered in under 10 seconds
  SELECT COUNT(*)
  INTO v_rushed_questions
  FROM question_attempts
  WHERE child_id = p_child_id
    AND created_at >= NOW() - (p_days || ' days')::interval
    AND time_taken_seconds > 0
    AND time_taken_seconds < 10;
  
  -- Calculate percentage
  v_rush_percentage := (v_rushed_questions::numeric / v_total_questions::numeric) * 100;
  
  RETURN ROUND(v_rush_percentage, 1);
END;
$function$
;

COMMENT ON FUNCTION public.calculate_rush_factor(uuid, int4) IS 'Calculates percentage of questions answered in under 10 seconds';

-- Permissions

ALTER FUNCTION public.calculate_rush_factor(uuid, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.calculate_rush_factor(uuid, int4) TO public;
GRANT ALL ON FUNCTION public.calculate_rush_factor(uuid, int4) TO postgres;
GRANT ALL ON FUNCTION public.calculate_rush_factor(uuid, int4) TO anon;
GRANT ALL ON FUNCTION public.calculate_rush_factor(uuid, int4) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_rush_factor(uuid, int4) TO service_role;

-- DROP FUNCTION public.calculate_stagnant_topics(uuid);

CREATE OR REPLACE FUNCTION public.calculate_stagnant_topics(p_child_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_stagnant_count integer;
BEGIN
  WITH topic_performance AS (
    SELECT 
      q.subject,
      q.topic,
      -- Recent 7 days
      COUNT(CASE WHEN qa.created_at >= NOW() - interval '7 days' THEN 1 END) as recent_attempts,
      AVG(CASE 
        WHEN qa.created_at >= NOW() - interval '7 days' AND qa.is_correct 
        THEN 100.0 
        WHEN qa.created_at >= NOW() - interval '7 days'
        THEN 0.0
      END) as recent_accuracy,
      -- Previous 7 days (8-14 days ago)
      COUNT(CASE 
        WHEN qa.created_at >= NOW() - interval '14 days' 
        AND qa.created_at < NOW() - interval '7 days' 
        THEN 1 
      END) as previous_attempts,
      AVG(CASE 
        WHEN qa.created_at >= NOW() - interval '14 days' 
        AND qa.created_at < NOW() - interval '7 days' 
        AND qa.is_correct 
        THEN 100.0
        WHEN qa.created_at >= NOW() - interval '14 days' 
        AND qa.created_at < NOW() - interval '7 days'
        THEN 0.0
      END) as previous_accuracy
    FROM question_attempts qa
    INNER JOIN questions q ON qa.question_id = q.id
    WHERE qa.child_id = p_child_id
      AND qa.created_at >= NOW() - interval '14 days'
      AND q.topic IS NOT NULL
    GROUP BY q.subject, q.topic
  )
  SELECT COUNT(*)
  INTO v_stagnant_count
  FROM topic_performance
  WHERE 
    -- Topic has been attempted in both periods
    recent_attempts >= 3
    AND previous_attempts >= 3
    -- Accuracy has not improved (or has declined)
    AND COALESCE(recent_accuracy, 0) <= COALESCE(previous_accuracy, 0);
  
  RETURN COALESCE(v_stagnant_count, 0);
END;
$function$
;

COMMENT ON FUNCTION public.calculate_stagnant_topics(uuid) IS 'Counts topics with no improvement over 2 weeks';

-- Permissions

ALTER FUNCTION public.calculate_stagnant_topics(uuid) OWNER TO postgres;
GRANT ALL ON FUNCTION public.calculate_stagnant_topics(uuid) TO public;
GRANT ALL ON FUNCTION public.calculate_stagnant_topics(uuid) TO postgres;
GRANT ALL ON FUNCTION public.calculate_stagnant_topics(uuid) TO anon;
GRANT ALL ON FUNCTION public.calculate_stagnant_topics(uuid) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_stagnant_topics(uuid) TO service_role;

-- DROP FUNCTION public.exec_sql_to_json(text);

CREATE OR REPLACE FUNCTION public.exec_sql_to_json(sql_query text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSONB;
BEGIN
  -- Execute the query and convert result to JSONB array
  EXECUTE 'SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb) FROM (' || sql_query || ') t'
  INTO result;
  
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error as JSONB
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'detail', SQLSTATE
    );
END;
$function$
;

COMMENT ON FUNCTION public.exec_sql_to_json(text) IS 'Helper function to execute SQL queries and return results as JSONB array';

-- Permissions

ALTER FUNCTION public.exec_sql_to_json(text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.exec_sql_to_json(text) TO postgres;
GRANT ALL ON FUNCTION public.exec_sql_to_json(text) TO anon;
GRANT ALL ON FUNCTION public.exec_sql_to_json(text) TO authenticated;
GRANT ALL ON FUNCTION public.exec_sql_to_json(text) TO service_role;

-- DROP FUNCTION public.get_child_analytics(uuid, date, date);

CREATE OR REPLACE FUNCTION public.get_child_analytics(p_child_id uuid, p_start_date date, p_end_date date)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSON;
  v_total_questions INT;
  v_correct_answers INT;
  v_total_time INT;
  v_current_streak INT;
  v_best_streak INT;
  v_sessions_count INT;
BEGIN
  -- Get overall stats for the period
  SELECT 
    COUNT(*),
    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END),
    COALESCE(SUM(time_taken_seconds), 0)
  INTO v_total_questions, v_correct_answers, v_total_time
  FROM question_attempts qa
  WHERE qa.child_id = p_child_id
    AND qa.created_at >= p_start_date
    AND qa.created_at <= p_end_date + INTERVAL '1 day';

  -- Get session count
  SELECT COUNT(*)
  INTO v_sessions_count
  FROM practice_sessions ps
  WHERE ps.child_id = p_child_id
    AND ps.created_at >= p_start_date
    AND ps.created_at <= p_end_date + INTERVAL '1 day';

  -- Calculate current streak (consecutive days with practice)
  WITH daily_practice AS (
    SELECT DISTINCT DATE(created_at) as practice_date
    FROM question_attempts
    WHERE child_id = p_child_id
    ORDER BY practice_date DESC
  ),
  streak_calc AS (
    SELECT 
      practice_date,
      practice_date - (ROW_NUMBER() OVER (ORDER BY practice_date DESC))::INT as streak_group
    FROM daily_practice
  )
  SELECT COUNT(*)
  INTO v_current_streak
  FROM streak_calc
  WHERE streak_group = (SELECT MIN(streak_group) FROM streak_calc WHERE practice_date >= CURRENT_DATE - 1);

  -- Get subject performance
  WITH subject_stats AS (
    SELECT 
      q.subject,
      COUNT(*) as total,
      SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct,
      ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1) as accuracy
    FROM question_attempts qa
    JOIN questions q ON q.id = qa.question_id
    WHERE qa.child_id = p_child_id
      AND qa.created_at >= p_start_date
      AND qa.created_at <= p_end_date + INTERVAL '1 day'
    GROUP BY q.subject
  ),
  -- Get daily activity
  daily_activity AS (
    SELECT 
      DATE(qa.created_at) as date,
      COUNT(*) as questions,
      SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct,
      ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1) as accuracy,
      COALESCE(SUM(qa.time_taken_seconds), 0) as time_spent
    FROM question_attempts qa
    WHERE qa.child_id = p_child_id
      AND qa.created_at >= p_start_date
      AND qa.created_at <= p_end_date + INTERVAL '1 day'
    GROUP BY DATE(qa.created_at)
    ORDER BY date DESC
  ),
  -- Get topic performance
  topic_stats AS (
    SELECT 
      q.subject,
      q.topic,
      COUNT(*) as total,
      SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct,
      ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1) as accuracy
    FROM question_attempts qa
    JOIN questions q ON q.id = qa.question_id
    WHERE qa.child_id = p_child_id
      AND qa.created_at >= p_start_date
      AND qa.created_at <= p_end_date + INTERVAL '1 day'
    GROUP BY q.subject, q.topic
    HAVING COUNT(*) >= 3
    ORDER BY accuracy ASC
  )
  SELECT json_build_object(
    'summary', json_build_object(
      'totalQuestions', COALESCE(v_total_questions, 0),
      'correctAnswers', COALESCE(v_correct_answers, 0),
      'accuracy', CASE WHEN v_total_questions > 0 
        THEN ROUND((v_correct_answers::NUMERIC / v_total_questions) * 100, 1) 
        ELSE 0 END,
      'totalTimeMinutes', ROUND(COALESCE(v_total_time, 0) / 60.0, 1),
      'sessionsCount', COALESCE(v_sessions_count, 0),
      'currentStreak', COALESCE(v_current_streak, 0),
      'averageSessionLength', CASE WHEN v_sessions_count > 0 
        THEN ROUND(v_total_questions::NUMERIC / v_sessions_count, 1) 
        ELSE 0 END
    ),
    'subjectPerformance', COALESCE((SELECT json_agg(json_build_object(
      'subject', subject,
      'total', total,
      'correct', correct,
      'accuracy', accuracy
    )) FROM subject_stats), '[]'::json),
    'dailyActivity', COALESCE((SELECT json_agg(json_build_object(
      'date', date,
      'questions', questions,
      'correct', correct,
      'accuracy', accuracy,
      'timeSpent', time_spent
    )) FROM daily_activity), '[]'::json),
    'topicPerformance', COALESCE((SELECT json_agg(json_build_object(
      'subject', subject,
      'topic', topic,
      'total', total,
      'correct', correct,
      'accuracy', accuracy
    )) FROM topic_stats), '[]'::json),
    'weakestTopics', COALESCE((SELECT json_agg(json_build_object(
      'subject', subject,
      'topic', topic,
      'accuracy', accuracy,
      'total', total
    )) FROM (SELECT * FROM topic_stats ORDER BY accuracy ASC LIMIT 5) t), '[]'::json),
    'strongestTopics', COALESCE((SELECT json_agg(json_build_object(
      'subject', subject,
      'topic', topic,
      'accuracy', accuracy,
      'total', total
    )) FROM (SELECT * FROM topic_stats ORDER BY accuracy DESC LIMIT 5) t), '[]'::json)
  ) INTO result;

  RETURN result;
END;
$function$
;

COMMENT ON FUNCTION public.get_child_analytics(uuid, date, date) IS 'Returns comprehensive analytics data for a child within a date range';

-- Permissions

ALTER FUNCTION public.get_child_analytics(uuid, date, date) OWNER TO postgres;
GRANT ALL ON FUNCTION public.get_child_analytics(uuid, date, date) TO public;
GRANT ALL ON FUNCTION public.get_child_analytics(uuid, date, date) TO postgres;
GRANT ALL ON FUNCTION public.get_child_analytics(uuid, date, date) TO anon;
GRANT ALL ON FUNCTION public.get_child_analytics(uuid, date, date) TO authenticated;
GRANT ALL ON FUNCTION public.get_child_analytics(uuid, date, date) TO service_role;

-- DROP FUNCTION public.get_child_performance_tracker(uuid, text);

CREATE OR REPLACE FUNCTION public.get_child_performance_tracker(p_child_id uuid, p_topic_id text)
 RETURNS TABLE(tracker_child_id uuid, tracker_topic_id text, current_difficulty text, recent_correct integer, recent_incorrect integer, recent_total integer, recent_accuracy numeric, questions_since_last_adjustment integer, total_questions_in_topic integer, last_adjustment_at timestamp with time zone, total_correct integer, total_incorrect integer, overall_accuracy numeric, current_streak integer, best_streak integer, last_attempted_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Create tracker if doesn't exist
  INSERT INTO child_topic_performance (child_id, topic_id)
  VALUES (p_child_id, p_topic_id)
  ON CONFLICT (child_id, topic_id) DO NOTHING;
  
  -- Return tracker
  RETURN QUERY
  SELECT 
    ctp.child_id,
    ctp.topic_id,
    ctp.current_difficulty,
    ctp.recent_correct,
    ctp.recent_incorrect,
    ctp.recent_total,
    ctp.recent_accuracy,
    ctp.questions_since_last_adjustment,
    ctp.total_questions_in_topic,
    ctp.last_adjustment_at,
    ctp.total_correct,
    ctp.total_incorrect,
    ctp.overall_accuracy,
    ctp.current_streak,
    ctp.best_streak,
    ctp.last_attempted_at
  FROM child_topic_performance ctp
  WHERE ctp.child_id = p_child_id AND ctp.topic_id = p_topic_id;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.get_child_performance_tracker(uuid, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.get_child_performance_tracker(uuid, text) TO public;
GRANT ALL ON FUNCTION public.get_child_performance_tracker(uuid, text) TO postgres;
GRANT ALL ON FUNCTION public.get_child_performance_tracker(uuid, text) TO anon;
GRANT ALL ON FUNCTION public.get_child_performance_tracker(uuid, text) TO authenticated;
GRANT ALL ON FUNCTION public.get_child_performance_tracker(uuid, text) TO service_role;

-- DROP FUNCTION public.get_comprehensive_analytics(uuid, int4);

CREATE OR REPLACE FUNCTION public.get_comprehensive_analytics(p_child_id uuid, p_days integer DEFAULT 30)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSON;
  v_start_date TIMESTAMPTZ;
  v_total_attempts INT;
  v_overall_accuracy NUMERIC;
BEGIN
  v_start_date := CURRENT_DATE - (p_days || ' days')::INTERVAL;

  -- Get overall stats
  SELECT 
    COUNT(*),
    ROUND(AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END), 1)
  INTO v_total_attempts, v_overall_accuracy
  FROM question_attempts qa
  WHERE qa.child_id = p_child_id
    AND qa.created_at >= v_start_date;

  -- Build complete response
  SELECT json_build_object(
    'totalQuestions', COALESCE(v_total_attempts, 0),
    'accuracy', COALESCE(v_overall_accuracy, 0),
    'subjectBreakdown', (
      SELECT COALESCE(json_agg(subject_data), '[]'::json)
      FROM (
        SELECT 
          q.subject,
          COUNT(*) as total,
          SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct,
          ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1) as accuracy
        FROM question_attempts qa
        JOIN questions q ON q.id = qa.question_id
        WHERE qa.child_id = p_child_id
          AND qa.created_at >= v_start_date
        GROUP BY q.subject
      ) subject_data
    ),
    'difficultyBreakdown', (
      SELECT COALESCE(json_agg(diff_data), '[]'::json)
      FROM (
        SELECT 
          q.difficulty,
          COUNT(*) as total,
          SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct,
          ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1) as accuracy
        FROM question_attempts qa
        JOIN questions q ON q.id = qa.question_id
        WHERE qa.child_id = p_child_id
          AND qa.created_at >= v_start_date
        GROUP BY q.difficulty
      ) diff_data
    ),
    'subjects', (
      SELECT COUNT(DISTINCT q.subject)
      FROM question_attempts qa
      JOIN questions q ON q.id = qa.question_id
      WHERE qa.child_id = p_child_id
        AND qa.created_at >= v_start_date
    )
  ) INTO result;

  RETURN result;
END;
$function$
;

COMMENT ON FUNCTION public.get_comprehensive_analytics(uuid, int4) IS 'Returns comprehensive analytics: total questions, accuracy, subject/difficulty breakdowns';

-- Permissions

ALTER FUNCTION public.get_comprehensive_analytics(uuid, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.get_comprehensive_analytics(uuid, int4) TO public;
GRANT ALL ON FUNCTION public.get_comprehensive_analytics(uuid, int4) TO postgres;
GRANT ALL ON FUNCTION public.get_comprehensive_analytics(uuid, int4) TO anon;
GRANT ALL ON FUNCTION public.get_comprehensive_analytics(uuid, int4) TO authenticated;
GRANT ALL ON FUNCTION public.get_comprehensive_analytics(uuid, int4) TO service_role;

-- DROP FUNCTION public.get_learning_health_check(uuid, int4);

CREATE OR REPLACE FUNCTION public.get_learning_health_check(p_child_id uuid, p_days integer DEFAULT 30)
 RETURNS json
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'rushFactor', calculate_rush_factor(p_child_id, p_days),
    'fatigueDropOff', calculate_fatigue_dropoff(p_child_id, p_days),
    'stagnantTopics', calculate_stagnant_topics(p_child_id),
    'calculatedAt', NOW()
  )
  INTO v_result;
  
  RETURN v_result;
END;
$function$
;

COMMENT ON FUNCTION public.get_learning_health_check(uuid, int4) IS 'Returns all learning health metrics for a child in JSON format';

-- Permissions

ALTER FUNCTION public.get_learning_health_check(uuid, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.get_learning_health_check(uuid, int4) TO public;
GRANT ALL ON FUNCTION public.get_learning_health_check(uuid, int4) TO postgres;
GRANT ALL ON FUNCTION public.get_learning_health_check(uuid, int4) TO anon;
GRANT ALL ON FUNCTION public.get_learning_health_check(uuid, int4) TO authenticated;
GRANT ALL ON FUNCTION public.get_learning_health_check(uuid, int4) TO service_role;

-- DROP FUNCTION public.get_question_curriculum_alignment(uuid);

CREATE OR REPLACE FUNCTION public.get_question_curriculum_alignment(p_question_id uuid)
 RETURNS TABLE(objective_code character varying, objective_text text, strand character varying, year_group integer, alignment_strength character varying)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    co.code,
    co.objective_text,
    co.strand,
    co.year_group,
    qca.alignment_strength
  FROM question_curriculum_alignment qca
  JOIN curriculum_objectives co ON co.id = qca.objective_id
  WHERE qca.question_id = p_question_id
  ORDER BY 
    CASE qca.alignment_strength 
      WHEN 'primary' THEN 1 
      WHEN 'secondary' THEN 2 
      ELSE 3 
    END;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.get_question_curriculum_alignment(uuid) OWNER TO postgres;
GRANT ALL ON FUNCTION public.get_question_curriculum_alignment(uuid) TO public;
GRANT ALL ON FUNCTION public.get_question_curriculum_alignment(uuid) TO postgres;
GRANT ALL ON FUNCTION public.get_question_curriculum_alignment(uuid) TO anon;
GRANT ALL ON FUNCTION public.get_question_curriculum_alignment(uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_question_curriculum_alignment(uuid) TO service_role;

-- DROP FUNCTION public.get_question_feedback_summary(uuid);

CREATE OR REPLACE FUNCTION public.get_question_feedback_summary(question_uuid uuid)
 RETURNS TABLE(total_feedback bigint, helpful_count bigint, not_helpful_count bigint, helpful_percentage numeric, common_issues jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_feedback,
        COUNT(*) FILTER (WHERE is_helpful = true)::BIGINT as helpful_count,
        COUNT(*) FILTER (WHERE is_helpful = false)::BIGINT as not_helpful_count,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ROUND((COUNT(*) FILTER (WHERE is_helpful = true)::NUMERIC / COUNT(*)::NUMERIC) * 100, 1)
            ELSE 0
        END as helpful_percentage,
        jsonb_agg(
            DISTINCT jsonb_build_object(
                'issue_type', issue_type,
                'count', (SELECT COUNT(*) FROM question_feedback qf2 
                         WHERE qf2.question_id = question_uuid 
                         AND qf2.issue_type = qf.issue_type)
            )
        ) FILTER (WHERE issue_type IS NOT NULL) as common_issues
    FROM question_feedback qf
    WHERE question_id = question_uuid;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.get_question_feedback_summary(uuid) OWNER TO postgres;
GRANT ALL ON FUNCTION public.get_question_feedback_summary(uuid) TO public;
GRANT ALL ON FUNCTION public.get_question_feedback_summary(uuid) TO postgres;
GRANT ALL ON FUNCTION public.get_question_feedback_summary(uuid) TO anon;
GRANT ALL ON FUNCTION public.get_question_feedback_summary(uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_question_feedback_summary(uuid) TO service_role;

-- DROP FUNCTION public.get_question_provenance(uuid);

CREATE OR REPLACE FUNCTION public.get_question_provenance(p_question_id uuid)
 RETURNS TABLE(id uuid, event_type text, event_data jsonb, actor_name text, actor_type text, occurred_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    qp.id,
    qp.event_type,
    qp.event_data,
    COALESCE(p.full_name, 'System') as actor_name,
    qp.actor_type,
    qp.occurred_at
  FROM question_provenance qp
  LEFT JOIN profiles p ON p.id = qp.actor_id
  WHERE qp.question_id = p_question_id
  ORDER BY qp.occurred_at DESC;
END;
$function$
;

COMMENT ON FUNCTION public.get_question_provenance(uuid) IS 'Retrieves the complete provenance timeline for a question';

-- Permissions

ALTER FUNCTION public.get_question_provenance(uuid) OWNER TO postgres;
GRANT ALL ON FUNCTION public.get_question_provenance(uuid) TO public;
GRANT ALL ON FUNCTION public.get_question_provenance(uuid) TO postgres;
GRANT ALL ON FUNCTION public.get_question_provenance(uuid) TO anon;
GRANT ALL ON FUNCTION public.get_question_provenance(uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_question_provenance(uuid) TO service_role;

-- DROP FUNCTION public.get_topic_mastery_level(uuid, text);

CREATE OR REPLACE FUNCTION public.get_topic_mastery_level(p_child_id uuid, p_topic_id text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_performance RECORD;
  v_mastery TEXT;
BEGIN
  -- Get performance
  SELECT * INTO v_performance
  FROM child_topic_performance
  WHERE child_id = p_child_id AND topic_id = p_topic_id;
  
  -- If no attempts, return beginner
  IF v_performance IS NULL OR v_performance.total_questions_in_topic = 0 THEN
    RETURN 'beginner';
  END IF;
  
  -- Calculate mastery based on difficulty, accuracy, and experience
  IF v_performance.current_difficulty = 'challenge' AND 
     v_performance.overall_accuracy >= 0.75 AND 
     v_performance.total_questions_in_topic >= 20 THEN
    v_mastery := 'mastered';
  
  ELSIF v_performance.current_difficulty = 'challenge' OR
        (v_performance.current_difficulty = 'standard' AND v_performance.overall_accuracy >= 0.70) THEN
    v_mastery := 'advanced';
  
  ELSIF v_performance.current_difficulty = 'standard' OR
        (v_performance.current_difficulty = 'foundation' AND v_performance.overall_accuracy >= 0.65) THEN
    v_mastery := 'progressing';
  
  ELSE
    v_mastery := 'developing';
  END IF;
  
  RETURN v_mastery;
END;
$function$
;

COMMENT ON FUNCTION public.get_topic_mastery_level(uuid, text) IS 'Calculates mastery level (beginner/developing/progressing/advanced/mastered)';

-- Permissions

ALTER FUNCTION public.get_topic_mastery_level(uuid, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.get_topic_mastery_level(uuid, text) TO public;
GRANT ALL ON FUNCTION public.get_topic_mastery_level(uuid, text) TO postgres;
GRANT ALL ON FUNCTION public.get_topic_mastery_level(uuid, text) TO anon;
GRANT ALL ON FUNCTION public.get_topic_mastery_level(uuid, text) TO authenticated;
GRANT ALL ON FUNCTION public.get_topic_mastery_level(uuid, text) TO service_role;

-- DROP FUNCTION public.get_validation_stats(timestamptz);

CREATE OR REPLACE FUNCTION public.get_validation_stats(since_date timestamp with time zone DEFAULT (now() - '7 days'::interval))
 RETURNS TABLE(total_validations bigint, passed_count bigint, failed_count bigint, auto_corrected_count bigint, pass_rate numeric, needs_review bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_validations,
    COUNT(*) FILTER (WHERE passed = TRUE) as passed_count,
    COUNT(*) FILTER (WHERE passed = FALSE) as failed_count,
    COUNT(*) FILTER (WHERE auto_corrected = TRUE) as auto_corrected_count,
    ROUND(
      COUNT(*) FILTER (WHERE passed = TRUE)::NUMERIC / 
      NULLIF(COUNT(*), 0) * 100, 
      2
    ) as pass_rate,
    COUNT(*) FILTER (WHERE passed = FALSE AND reviewed_at IS NULL) as needs_review
  FROM question_validations
  WHERE validation_run_at >= since_date;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.get_validation_stats(timestamptz) OWNER TO postgres;
GRANT ALL ON FUNCTION public.get_validation_stats(timestamptz) TO public;
GRANT ALL ON FUNCTION public.get_validation_stats(timestamptz) TO postgres;
GRANT ALL ON FUNCTION public.get_validation_stats(timestamptz) TO anon;
GRANT ALL ON FUNCTION public.get_validation_stats(timestamptz) TO authenticated;
GRANT ALL ON FUNCTION public.get_validation_stats(timestamptz) TO service_role;

-- DROP FUNCTION public.get_weakness_heatmap(uuid);

CREATE OR REPLACE FUNCTION public.get_weakness_heatmap(p_child_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSON;
BEGIN
  WITH topic_performance AS (
    SELECT 
      q.subject,
      q.topic,
      COUNT(*) as attempts,
      SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct,
      ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1) as accuracy,
      -- Calculate trend (compare last 7 days to previous 7 days)
      ROUND(AVG(CASE WHEN qa.created_at >= CURRENT_DATE - INTERVAL '7 days' 
        THEN CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END END), 1) as recent_accuracy,
      ROUND(AVG(CASE WHEN qa.created_at < CURRENT_DATE - INTERVAL '7 days' 
        AND qa.created_at >= CURRENT_DATE - INTERVAL '14 days'
        THEN CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END END), 1) as previous_accuracy
    FROM question_attempts qa
    JOIN questions q ON q.id = qa.question_id
    WHERE qa.child_id = p_child_id
      AND qa.created_at >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY q.subject, q.topic
    HAVING COUNT(*) >= 2
  ),
  with_trends AS (
    SELECT 
      subject,
      topic,
      attempts,
      correct,
      accuracy,
      recent_accuracy,
      previous_accuracy,
      CASE 
        WHEN recent_accuracy IS NULL OR previous_accuracy IS NULL THEN 'stable'
        WHEN recent_accuracy > previous_accuracy + 5 THEN 'improving'
        WHEN recent_accuracy < previous_accuracy - 5 THEN 'declining'
        ELSE 'stable'
      END as trend
    FROM topic_performance
  )
  SELECT json_build_object(
    'subjects', (
      SELECT json_agg(DISTINCT subject)
      FROM with_trends
    ),
    'topics', (
      SELECT json_agg(json_build_object(
        'subject', subject,
        'topic', topic,
        'attempts', attempts,
        'correct', correct,
        'accuracy', accuracy,
        'trend', trend,
        'mastery', CASE 
          WHEN accuracy >= 85 THEN 'mastered'
          WHEN accuracy >= 70 THEN 'proficient'
          WHEN accuracy >= 55 THEN 'developing'
          ELSE 'needs_focus'
        END
      ) ORDER BY subject, accuracy)
      FROM with_trends
    ),
    'summary', json_build_object(
      'totalTopics', (SELECT COUNT(*) FROM with_trends),
      'mastered', (SELECT COUNT(*) FROM with_trends WHERE accuracy >= 85),
      'proficient', (SELECT COUNT(*) FROM with_trends WHERE accuracy >= 70 AND accuracy < 85),
      'developing', (SELECT COUNT(*) FROM with_trends WHERE accuracy >= 55 AND accuracy < 70),
      'needsFocus', (SELECT COUNT(*) FROM with_trends WHERE accuracy < 55)
    )
  ) INTO result;

  RETURN result;
END;
$function$
;

COMMENT ON FUNCTION public.get_weakness_heatmap(uuid) IS 'Returns heatmap data showing performance by subject and topic';

-- Permissions

ALTER FUNCTION public.get_weakness_heatmap(uuid) OWNER TO postgres;
GRANT ALL ON FUNCTION public.get_weakness_heatmap(uuid) TO public;
GRANT ALL ON FUNCTION public.get_weakness_heatmap(uuid) TO postgres;
GRANT ALL ON FUNCTION public.get_weakness_heatmap(uuid) TO anon;
GRANT ALL ON FUNCTION public.get_weakness_heatmap(uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_weakness_heatmap(uuid) TO service_role;

-- DROP FUNCTION public.get_weakness_heatmap_v2(uuid, int4);

CREATE OR REPLACE FUNCTION public.get_weakness_heatmap_v2(p_child_id uuid, p_days integer DEFAULT 30)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  result JSON;
  v_start_date TIMESTAMPTZ;
BEGIN
  v_start_date := CURRENT_DATE - (p_days || ' days')::INTERVAL;

  SELECT COALESCE(json_agg(heatmap_data), '[]'::json)
  INTO result
  FROM (
    SELECT 
      q.topic,
      q.subject,
      COUNT(*) as total_attempts,
      SUM(CASE WHEN qa.is_correct THEN 1 ELSE 0 END) as correct_attempts,
      ROUND(AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END), 1) as accuracy,
      CASE 
        WHEN AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END) >= 80 THEN 'mastered'
        WHEN AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END) >= 60 THEN 'progressing'
        ELSE 'needs-work'
      END as mastery_level,
      CASE 
        WHEN AVG(CASE WHEN qa.is_correct THEN 100.0 ELSE 0.0 END) < 60 THEN true
        ELSE false
      END as needs_focus
    FROM question_attempts qa
    JOIN questions q ON q.id = qa.question_id
    WHERE qa.child_id = p_child_id
      AND qa.created_at >= v_start_date
      AND q.topic IS NOT NULL
    GROUP BY q.topic, q.subject
    HAVING COUNT(*) >= 3
    ORDER BY accuracy ASC, total_attempts DESC
  ) heatmap_data;

  RETURN result;
END;
$function$
;

COMMENT ON FUNCTION public.get_weakness_heatmap_v2(uuid, int4) IS 'Returns topic-based performance heatmap with mastery levels';

-- Permissions

ALTER FUNCTION public.get_weakness_heatmap_v2(uuid, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.get_weakness_heatmap_v2(uuid, int4) TO public;
GRANT ALL ON FUNCTION public.get_weakness_heatmap_v2(uuid, int4) TO postgres;
GRANT ALL ON FUNCTION public.get_weakness_heatmap_v2(uuid, int4) TO anon;
GRANT ALL ON FUNCTION public.get_weakness_heatmap_v2(uuid, int4) TO authenticated;
GRANT ALL ON FUNCTION public.get_weakness_heatmap_v2(uuid, int4) TO service_role;

-- DROP FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.handle_new_user() OWNER TO postgres;
GRANT ALL ON FUNCTION public.handle_new_user() TO public;
GRANT ALL ON FUNCTION public.handle_new_user() TO postgres;
GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;

-- DROP FUNCTION public.is_admin();

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
END;
$function$
;

-- Permissions

ALTER FUNCTION public.is_admin() OWNER TO postgres;
GRANT ALL ON FUNCTION public.is_admin() TO public;
GRANT ALL ON FUNCTION public.is_admin() TO postgres;
GRANT ALL ON FUNCTION public.is_admin() TO anon;
GRANT ALL ON FUNCTION public.is_admin() TO authenticated;
GRANT ALL ON FUNCTION public.is_admin() TO service_role;

-- DROP FUNCTION public.is_parent_of(uuid);

CREATE OR REPLACE FUNCTION public.is_parent_of(child_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM children
        WHERE id = child_id
        AND parent_id = auth.uid()
        AND is_active = true
    );
END;
$function$
;

COMMENT ON FUNCTION public.is_parent_of(uuid) IS 'Returns true if current user is the parent of the specified child';

-- Permissions

ALTER FUNCTION public.is_parent_of(uuid) OWNER TO postgres;
GRANT ALL ON FUNCTION public.is_parent_of(uuid) TO public;
GRANT ALL ON FUNCTION public.is_parent_of(uuid) TO postgres;
GRANT ALL ON FUNCTION public.is_parent_of(uuid) TO anon;
GRANT ALL ON FUNCTION public.is_parent_of(uuid) TO authenticated;
GRANT ALL ON FUNCTION public.is_parent_of(uuid) TO service_role;

-- DROP FUNCTION public.log_provenance_event(uuid, text, jsonb, text);

CREATE OR REPLACE FUNCTION public.log_provenance_event(p_question_id uuid, p_event_type text, p_event_data jsonb DEFAULT '{}'::jsonb, p_actor_type text DEFAULT 'system'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO question_provenance (
    question_id,
    event_type,
    event_data,
    actor_id,
    actor_type
  ) VALUES (
    p_question_id,
    p_event_type,
    p_event_data,
    auth.uid(),
    p_actor_type
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$function$
;

COMMENT ON FUNCTION public.log_provenance_event(uuid, text, jsonb, text) IS 'Logs a provenance event for a question';

-- Permissions

ALTER FUNCTION public.log_provenance_event(uuid, text, jsonb, text) OWNER TO postgres;
GRANT ALL ON FUNCTION public.log_provenance_event(uuid, text, jsonb, text) TO public;
GRANT ALL ON FUNCTION public.log_provenance_event(uuid, text, jsonb, text) TO postgres;
GRANT ALL ON FUNCTION public.log_provenance_event(uuid, text, jsonb, text) TO anon;
GRANT ALL ON FUNCTION public.log_provenance_event(uuid, text, jsonb, text) TO authenticated;
GRANT ALL ON FUNCTION public.log_provenance_event(uuid, text, jsonb, text) TO service_role;

-- DROP FUNCTION public.owns_session(uuid);

CREATE OR REPLACE FUNCTION public.owns_session(session_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM practice_sessions ps
        JOIN children c ON c.id = ps.child_id
        WHERE ps.id = session_id
        AND c.parent_id = auth.uid()
        AND c.is_active = true
    );
END;
$function$
;

COMMENT ON FUNCTION public.owns_session(uuid) IS 'Returns true if current user owns the practice session (via child)';

-- Permissions

ALTER FUNCTION public.owns_session(uuid) OWNER TO postgres;
GRANT ALL ON FUNCTION public.owns_session(uuid) TO public;
GRANT ALL ON FUNCTION public.owns_session(uuid) TO postgres;
GRANT ALL ON FUNCTION public.owns_session(uuid) TO anon;
GRANT ALL ON FUNCTION public.owns_session(uuid) TO authenticated;
GRANT ALL ON FUNCTION public.owns_session(uuid) TO service_role;

-- DROP FUNCTION public.recalculate_ember_score(uuid);

CREATE OR REPLACE FUNCTION public.recalculate_ember_score(question_uuid uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_curriculum_score INTEGER;
    v_expert_score INTEGER;
    v_community_score INTEGER;
    v_total_score INTEGER;
    v_stats RECORD;
    v_question RECORD;
    v_breakdown JSONB;
BEGIN
    -- Get question data
    SELECT 
        curriculum_reference,
        review_status
    INTO v_question
    FROM questions
    WHERE id = question_uuid;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Question not found: %', question_uuid;
    END IF;

    -- Get stats from materialized view
    SELECT 
        total_attempts,
        error_report_count,
        helpful_votes,
        not_helpful_votes
    INTO v_stats
    FROM question_stats
    WHERE question_id = question_uuid;

    -- If no stats record (no attempts yet), use defaults
    IF NOT FOUND THEN
        v_stats.total_attempts := 0;
        v_stats.error_report_count := 0;
        v_stats.helpful_votes := 0;
        v_stats.not_helpful_votes := 0;
    END IF;

    -- Calculate Curriculum Alignment Score (0-40)
    IF v_question.curriculum_reference IS NOT NULL 
        AND v_question.curriculum_reference ~ '^(KS[1-4]|Y[3-6]|Year [3-6])' THEN
        v_curriculum_score := 40; -- Valid NC reference
    ELSIF v_question.curriculum_reference IS NOT NULL 
        AND LENGTH(TRIM(v_question.curriculum_reference)) > 0 THEN
        v_curriculum_score := 20; -- Some reference
    ELSE
        v_curriculum_score := 0; -- No reference
    END IF;

    -- Calculate Expert Verification Score (0-40)
    v_expert_score := CASE v_question.review_status
        WHEN 'reviewed' THEN 40
        WHEN 'spot_checked' THEN 25
        ELSE 10 -- ai_only or null
    END;

    -- Calculate Community Feedback Score (0-20)
    -- Base: 16, Error penalty: -2 each, Helpful bonus: +0.5 each (max +4), Usage bonus: +0.1 per 100 attempts (max +4)
    v_community_score := 16;
    
    -- Error penalty
    v_community_score := v_community_score - (v_stats.error_report_count * 2);
    
    -- Helpful votes bonus (max +4)
    v_community_score := v_community_score + LEAST(4, v_stats.helpful_votes * 0.5);
    
    -- Usage bonus (only if no errors, max +4)
    IF v_stats.error_report_count = 0 AND v_stats.total_attempts > 0 THEN
        v_community_score := v_community_score + LEAST(4, (v_stats.total_attempts / 100.0) * 0.1);
    END IF;
    
    -- Clamp community score to 0-20 range
    v_community_score := GREATEST(0, LEAST(20, v_community_score));

    -- Calculate total score
    v_total_score := v_curriculum_score + v_expert_score + v_community_score;
    v_total_score := GREATEST(0, LEAST(100, v_total_score)); -- Clamp to 0-100

    -- Build breakdown JSON
    v_breakdown := jsonb_build_object(
        'curriculumAlignment', v_curriculum_score,
        'expertVerification', v_expert_score,
        'communityFeedback', v_community_score
    );

    -- Update question record
    UPDATE questions
    SET 
        ember_score = v_total_score,
        ember_score_breakdown = v_breakdown,
        updated_at = NOW()
    WHERE id = question_uuid;

    -- Return result
    RETURN jsonb_build_object(
        'questionId', question_uuid,
        'score', v_total_score,
        'breakdown', v_breakdown,
        'updatedAt', NOW()
    );
END;
$function$
;

COMMENT ON FUNCTION public.recalculate_ember_score(uuid) IS 'Recalculates Ember Score for a specific question based on current data. Returns updated score and breakdown.';

-- Permissions

ALTER FUNCTION public.recalculate_ember_score(uuid) OWNER TO postgres;
GRANT ALL ON FUNCTION public.recalculate_ember_score(uuid) TO public;
GRANT ALL ON FUNCTION public.recalculate_ember_score(uuid) TO postgres;
GRANT ALL ON FUNCTION public.recalculate_ember_score(uuid) TO anon;
GRANT ALL ON FUNCTION public.recalculate_ember_score(uuid) TO authenticated;
GRANT ALL ON FUNCTION public.recalculate_ember_score(uuid) TO service_role;

-- DROP FUNCTION public.refresh_analytics_views();

CREATE OR REPLACE FUNCTION public.refresh_analytics_views()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Refresh concurrently to avoid locking reads
    REFRESH MATERIALIZED VIEW CONCURRENTLY child_daily_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY child_topic_mastery;
    REFRESH MATERIALIZED VIEW CONCURRENTLY child_weekly_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY child_subject_summary;
END;
$function$
;

COMMENT ON FUNCTION public.refresh_analytics_views() IS 'Refreshes all analytics materialized views. Should be called periodically.';

-- Permissions

ALTER FUNCTION public.refresh_analytics_views() OWNER TO postgres;
GRANT ALL ON FUNCTION public.refresh_analytics_views() TO public;
GRANT ALL ON FUNCTION public.refresh_analytics_views() TO postgres;
GRANT ALL ON FUNCTION public.refresh_analytics_views() TO anon;
GRANT ALL ON FUNCTION public.refresh_analytics_views() TO authenticated;
GRANT ALL ON FUNCTION public.refresh_analytics_views() TO service_role;

-- DROP FUNCTION public.refresh_question_stats();

CREATE OR REPLACE FUNCTION public.refresh_question_stats()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY question_stats;
END;
$function$
;

COMMENT ON FUNCTION public.refresh_question_stats() IS 'Refreshes the question_stats materialized view. Call periodically (e.g., every 15 minutes) via cron or manually after bulk data changes.';

-- Permissions

ALTER FUNCTION public.refresh_question_stats() OWNER TO postgres;
GRANT ALL ON FUNCTION public.refresh_question_stats() TO public;
GRANT ALL ON FUNCTION public.refresh_question_stats() TO postgres;
GRANT ALL ON FUNCTION public.refresh_question_stats() TO anon;
GRANT ALL ON FUNCTION public.refresh_question_stats() TO authenticated;
GRANT ALL ON FUNCTION public.refresh_question_stats() TO service_role;

-- DROP FUNCTION public.test_rls_access();

CREATE OR REPLACE FUNCTION public.test_rls_access()
 RETURNS TABLE(table_name text, can_select boolean, can_insert boolean, can_update boolean, can_delete boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- This function helps test what the current user can access
    -- Run as authenticated user to see their permissions
    
    RETURN QUERY
    SELECT 
        'Summary of RLS policies - run specific queries to test access'::TEXT as table_name,
        true as can_select,
        true as can_insert,
        true as can_update,
        true as can_delete;
    
END;
$function$
;

COMMENT ON FUNCTION public.test_rls_access() IS 'Helper to understand current user RLS permissions';

-- Permissions

ALTER FUNCTION public.test_rls_access() OWNER TO postgres;
GRANT ALL ON FUNCTION public.test_rls_access() TO public;
GRANT ALL ON FUNCTION public.test_rls_access() TO postgres;
GRANT ALL ON FUNCTION public.test_rls_access() TO anon;
GRANT ALL ON FUNCTION public.test_rls_access() TO authenticated;
GRANT ALL ON FUNCTION public.test_rls_access() TO service_role;

-- DROP FUNCTION public.trigger_log_error_report();

CREATE OR REPLACE FUNCTION public.trigger_log_error_report()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_provenance_event(
      NEW.question_id,
      'error_reported',
      jsonb_build_object(
        'report_type', NEW.report_type,
        'description', NEW.description,
        'report_id', NEW.id
      ),
      'system'
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status IN ('fixed', 'dismissed') THEN
    PERFORM log_provenance_event(
      NEW.question_id,
      'error_resolved',
      jsonb_build_object(
        'report_type', NEW.report_type,
        'resolution', NEW.status,
        'admin_notes', NEW.admin_notes,
        'report_id', NEW.id
      ),
      'admin'
    );
  END IF;
  
  RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.trigger_log_error_report() OWNER TO postgres;
GRANT ALL ON FUNCTION public.trigger_log_error_report() TO public;
GRANT ALL ON FUNCTION public.trigger_log_error_report() TO postgres;
GRANT ALL ON FUNCTION public.trigger_log_error_report() TO anon;
GRANT ALL ON FUNCTION public.trigger_log_error_report() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_log_error_report() TO service_role;

-- DROP FUNCTION public.trigger_log_question_creation();

CREATE OR REPLACE FUNCTION public.trigger_log_question_creation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  PERFORM log_provenance_event(
    NEW.id,
    'created',
    jsonb_build_object(
      'subject', NEW.subject,
      'topic', NEW.topic,
      'difficulty', NEW.difficulty,
      'curriculum_reference', NEW.curriculum_reference,
      'created_by', NEW.created_by
    ),
    'ai' -- Most questions created by AI
  );
  
  RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.trigger_log_question_creation() OWNER TO postgres;
GRANT ALL ON FUNCTION public.trigger_log_question_creation() TO public;
GRANT ALL ON FUNCTION public.trigger_log_question_creation() TO postgres;
GRANT ALL ON FUNCTION public.trigger_log_question_creation() TO anon;
GRANT ALL ON FUNCTION public.trigger_log_question_creation() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_log_question_creation() TO service_role;

-- DROP FUNCTION public.trigger_log_question_modification();

CREATE OR REPLACE FUNCTION public.trigger_log_question_modification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_changes JSONB;
BEGIN
  -- Build changes object
  v_changes := jsonb_build_object(
    'before', row_to_json(OLD)::jsonb,
    'after', row_to_json(NEW)::jsonb
  );
  
  -- Log review status changes
  IF OLD.review_status IS DISTINCT FROM NEW.review_status THEN
    PERFORM log_provenance_event(
      NEW.id,
      'reviewed',
      jsonb_build_object(
        'old_status', OLD.review_status,
        'new_status', NEW.review_status,
        'reviewed_by', NEW.reviewed_by
      ),
      CASE 
        WHEN NEW.review_status = 'reviewed' THEN 'expert'
        WHEN NEW.review_status = 'spot_checked' THEN 'admin'
        ELSE 'system'
      END
    );
  END IF;
  
  -- Log publication changes
  IF OLD.is_published IS DISTINCT FROM NEW.is_published THEN
    PERFORM log_provenance_event(
      NEW.id,
      CASE WHEN NEW.is_published THEN 'published' ELSE 'unpublished' END,
      jsonb_build_object(
        'reason', CASE 
          WHEN NOT NEW.is_published AND NEW.ember_score < 60 THEN 'score_below_threshold'
          ELSE 'manual'
        END
      ),
      'system'
    );
  END IF;
  
  -- Log Ember Score changes (significant changes only)
  IF OLD.ember_score IS DISTINCT FROM NEW.ember_score 
     AND ABS(OLD.ember_score - NEW.ember_score) >= 5 THEN
    PERFORM log_provenance_event(
      NEW.id,
      'score_changed',
      jsonb_build_object(
        'old_score', OLD.ember_score,
        'new_score', NEW.ember_score,
        'old_tier', 
          CASE 
            WHEN OLD.ember_score >= 90 THEN 'verified'
            WHEN OLD.ember_score >= 75 THEN 'confident'
            ELSE 'draft'
          END,
        'new_tier',
          CASE 
            WHEN NEW.ember_score >= 90 THEN 'verified'
            WHEN NEW.ember_score >= 75 THEN 'confident'
            ELSE 'draft'
          END
      ),
      'system'
    );
  END IF;
  
  RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.trigger_log_question_modification() OWNER TO postgres;
GRANT ALL ON FUNCTION public.trigger_log_question_modification() TO public;
GRANT ALL ON FUNCTION public.trigger_log_question_modification() TO postgres;
GRANT ALL ON FUNCTION public.trigger_log_question_modification() TO anon;
GRANT ALL ON FUNCTION public.trigger_log_question_modification() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_log_question_modification() TO service_role;

-- DROP FUNCTION public.trigger_recalculate_ember_score_on_error();

CREATE OR REPLACE FUNCTION public.trigger_recalculate_ember_score_on_error()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Refresh the materialized view for this question's stats
    -- Note: This is a simplified approach. In production, consider async job queue.
    REFRESH MATERIALIZED VIEW CONCURRENTLY question_stats;
    
    -- Recalculate the score
    PERFORM recalculate_ember_score(NEW.question_id);
    
    RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.trigger_recalculate_ember_score_on_error() OWNER TO postgres;
GRANT ALL ON FUNCTION public.trigger_recalculate_ember_score_on_error() TO public;
GRANT ALL ON FUNCTION public.trigger_recalculate_ember_score_on_error() TO postgres;
GRANT ALL ON FUNCTION public.trigger_recalculate_ember_score_on_error() TO anon;
GRANT ALL ON FUNCTION public.trigger_recalculate_ember_score_on_error() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_recalculate_ember_score_on_error() TO service_role;

-- DROP FUNCTION public.update_all_ember_scores();

CREATE OR REPLACE FUNCTION public.update_all_ember_scores()
 RETURNS TABLE(question_id uuid, old_score integer, new_score integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  WITH score_updates AS (
    SELECT 
      q.id,
      q.ember_score as old_score,
      calculate_ember_score(q.id) as new_score
    FROM questions q
    WHERE q.is_published = true
  )
  UPDATE questions q
  SET 
    ember_score = su.new_score,
    ember_score_breakdown = jsonb_build_object(
      'curriculum', CASE 
        WHEN EXISTS(
          SELECT 1 
          FROM question_curriculum_alignment qca
          WHERE qca.question_id = q.id
        ) THEN 25 
        ELSE 15 
      END,
      'exam_pattern', 25,
      'community', 10,
      'technical', 8,
      'calculated_at', NOW()
    ),
    updated_at = NOW()
  FROM score_updates su
  WHERE q.id = su.id
  RETURNING q.id, su.old_score::INTEGER, su.new_score::INTEGER;
END;
$function$
;

COMMENT ON FUNCTION public.update_all_ember_scores() IS 'Recalculates ember_score for all published questions using calculate_ember_score function. Fixed ambiguous column reference issue.';

-- Permissions

ALTER FUNCTION public.update_all_ember_scores() OWNER TO postgres;
GRANT ALL ON FUNCTION public.update_all_ember_scores() TO public;
GRANT ALL ON FUNCTION public.update_all_ember_scores() TO postgres;
GRANT ALL ON FUNCTION public.update_all_ember_scores() TO anon;
GRANT ALL ON FUNCTION public.update_all_ember_scores() TO authenticated;
GRANT ALL ON FUNCTION public.update_all_ember_scores() TO service_role;

-- DROP FUNCTION public.update_question_helpful_counts();

CREATE OR REPLACE FUNCTION public.update_question_helpful_counts()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Update counts for the affected question
    UPDATE questions
    SET 
        helpful_count = (
            SELECT COUNT(*) 
            FROM question_feedback 
            WHERE question_id = COALESCE(NEW.question_id, OLD.question_id) 
            AND is_helpful = true
        ),
        not_helpful_count = (
            SELECT COUNT(*) 
            FROM question_feedback 
            WHERE question_id = COALESCE(NEW.question_id, OLD.question_id) 
            AND is_helpful = false
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.question_id, OLD.question_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_question_helpful_counts() OWNER TO postgres;
GRANT ALL ON FUNCTION public.update_question_helpful_counts() TO public;
GRANT ALL ON FUNCTION public.update_question_helpful_counts() TO postgres;
GRANT ALL ON FUNCTION public.update_question_helpful_counts() TO anon;
GRANT ALL ON FUNCTION public.update_question_helpful_counts() TO authenticated;
GRANT ALL ON FUNCTION public.update_question_helpful_counts() TO service_role;

-- DROP FUNCTION public.update_topic_performance(uuid, text, bool, int4);

CREATE OR REPLACE FUNCTION public.update_topic_performance(p_child_id uuid, p_topic_id text, p_is_correct boolean, p_window_size integer DEFAULT 5)
 RETURNS TABLE(current_difficulty text, should_adjust boolean, recommended_difficulty text, adjustment_reason text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_performance RECORD;
  v_new_difficulty TEXT;
  v_accuracy DECIMAL;
  v_questions_since_adjustment INTEGER;
BEGIN
  -- Get or create performance record
  INSERT INTO child_topic_performance (child_id, topic_id)
  VALUES (p_child_id, p_topic_id)
  ON CONFLICT (child_id, topic_id) DO NOTHING;
  
  -- Get current state
  SELECT * INTO v_performance
  FROM child_topic_performance
  WHERE child_id = p_child_id AND topic_id = p_topic_id;
  
  -- Update rolling window counts
  -- Add new attempt
  v_performance.recent_correct := v_performance.recent_correct + (CASE WHEN p_is_correct THEN 1 ELSE 0 END);
  v_performance.recent_incorrect := v_performance.recent_incorrect + (CASE WHEN p_is_correct THEN 0 ELSE 1 END);
  v_performance.recent_total := v_performance.recent_total + 1;
  
  -- Keep window size limited
  IF v_performance.recent_total > p_window_size THEN
    -- Scale down proportionally
    v_performance.recent_correct := ROUND(v_performance.recent_correct::DECIMAL * p_window_size / v_performance.recent_total);
    v_performance.recent_incorrect := p_window_size - v_performance.recent_correct;
    v_performance.recent_total := p_window_size;
  END IF;
  
  -- Calculate accuracy
  v_accuracy := CASE 
    WHEN v_performance.recent_total > 0 
    THEN v_performance.recent_correct::DECIMAL / v_performance.recent_total
    ELSE 0
  END;
  
  -- Update overall stats
  v_performance.total_correct := v_performance.total_correct + (CASE WHEN p_is_correct THEN 1 ELSE 0 END);
  v_performance.total_incorrect := v_performance.total_incorrect + (CASE WHEN p_is_correct THEN 0 ELSE 1 END);
  v_performance.total_questions_in_topic := v_performance.total_questions_in_topic + 1;
  v_performance.questions_since_last_adjustment := v_performance.questions_since_last_adjustment + 1;
  
  -- Update streaks
  IF p_is_correct THEN
    v_performance.current_streak := v_performance.current_streak + 1;
    IF v_performance.current_streak > v_performance.best_streak THEN
      v_performance.best_streak := v_performance.current_streak;
    END IF;
  ELSE
    v_performance.current_streak := 0;
  END IF;
  
  -- Determine difficulty adjustment
  v_new_difficulty := v_performance.current_difficulty;
  should_adjust := FALSE;
  adjustment_reason := 'No adjustment needed';
  
  -- Check if adjustment criteria met
  IF v_performance.recent_total >= 3 AND v_performance.questions_since_last_adjustment >= 3 THEN
    -- High accuracy: increase difficulty
    IF v_accuracy > 0.75 THEN
      IF v_performance.current_difficulty = 'foundation' THEN
        v_new_difficulty := 'standard';
        should_adjust := TRUE;
        adjustment_reason := 'High accuracy - increasing challenge';
      ELSIF v_performance.current_difficulty = 'standard' THEN
        v_new_difficulty := 'challenge';
        should_adjust := TRUE;
        adjustment_reason := 'High accuracy - increasing challenge';
      ELSE
        adjustment_reason := 'Already at hardest difficulty';
      END IF;
    
    -- Low accuracy: decrease difficulty
    ELSIF v_accuracy < 0.45 THEN
      IF v_performance.current_difficulty = 'challenge' THEN
        v_new_difficulty := 'standard';
        should_adjust := TRUE;
        adjustment_reason := 'Low accuracy - making questions easier';
      ELSIF v_performance.current_difficulty = 'standard' THEN
        v_new_difficulty := 'foundation';
        should_adjust := TRUE;
        adjustment_reason := 'Low accuracy - making questions easier';
      ELSE
        adjustment_reason := 'Already at easiest difficulty';
      END IF;
    
    ELSE
      adjustment_reason := 'Accuracy in target range';
    END IF;
  ELSIF v_performance.recent_total < 3 THEN
    adjustment_reason := 'Need more questions before adjusting';
  ELSE
    adjustment_reason := 'Cooldown period active';
  END IF;
  
  -- Apply adjustment if needed
  IF should_adjust THEN
    v_performance.current_difficulty := v_new_difficulty;
    v_performance.questions_since_last_adjustment := 0;
    v_performance.last_adjustment_at := NOW();
    v_performance.adjustment_count := v_performance.adjustment_count + 1;
  END IF;
  
  -- Update database
  UPDATE child_topic_performance SET
    current_difficulty = v_performance.current_difficulty,
    recent_correct = v_performance.recent_correct,
    recent_incorrect = v_performance.recent_incorrect,
    recent_total = v_performance.recent_total,
    questions_since_last_adjustment = v_performance.questions_since_last_adjustment,
    total_questions_in_topic = v_performance.total_questions_in_topic,
    total_correct = v_performance.total_correct,
    total_incorrect = v_performance.total_incorrect,
    current_streak = v_performance.current_streak,
    best_streak = v_performance.best_streak,
    last_adjustment_at = v_performance.last_adjustment_at,
    adjustment_count = v_performance.adjustment_count,
    last_attempted_at = NOW(),
    updated_at = NOW()
  WHERE child_id = p_child_id AND topic_id = p_topic_id;
  
  -- Return adjustment info
  RETURN QUERY
  SELECT 
    v_performance.current_difficulty,
    should_adjust,
    v_new_difficulty AS recommended_difficulty,
    adjustment_reason;
END;
$function$
;

COMMENT ON FUNCTION public.update_topic_performance(uuid, text, bool, int4) IS 'Updates performance tracker after question attempt with rolling window';

-- Permissions

ALTER FUNCTION public.update_topic_performance(uuid, text, bool, int4) OWNER TO postgres;
GRANT ALL ON FUNCTION public.update_topic_performance(uuid, text, bool, int4) TO public;
GRANT ALL ON FUNCTION public.update_topic_performance(uuid, text, bool, int4) TO postgres;
GRANT ALL ON FUNCTION public.update_topic_performance(uuid, text, bool, int4) TO anon;
GRANT ALL ON FUNCTION public.update_topic_performance(uuid, text, bool, int4) TO authenticated;
GRANT ALL ON FUNCTION public.update_topic_performance(uuid, text, bool, int4) TO service_role;

-- DROP FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$
;

-- Permissions

ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO public;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO postgres;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


-- Permissions

GRANT ALL ON SCHEMA public TO pg_database_owner;
GRANT USAGE ON SCHEMA public TO public;
GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT TRUNCATE, MAINTAIN, INSERT, REFERENCES, UPDATE, TRIGGER, SELECT, DELETE ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT TRUNCATE, MAINTAIN, INSERT, REFERENCES, UPDATE, TRIGGER, SELECT, DELETE ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT TRUNCATE, MAINTAIN, INSERT, REFERENCES, UPDATE, TRIGGER, SELECT, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT TRUNCATE, MAINTAIN, INSERT, REFERENCES, UPDATE, TRIGGER, SELECT, DELETE ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT USAGE, UPDATE, SELECT ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT USAGE, UPDATE, SELECT ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT USAGE, UPDATE, SELECT ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT USAGE, UPDATE, SELECT ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT USAGE, UPDATE, SELECT ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT USAGE, UPDATE, SELECT ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT USAGE, UPDATE, SELECT ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT USAGE, UPDATE, SELECT ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT TRUNCATE, MAINTAIN, INSERT, REFERENCES, UPDATE, TRIGGER, SELECT, DELETE ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT TRUNCATE, MAINTAIN, INSERT, REFERENCES, UPDATE, TRIGGER, SELECT, DELETE ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT TRUNCATE, MAINTAIN, INSERT, REFERENCES, UPDATE, TRIGGER, SELECT, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT TRUNCATE, MAINTAIN, INSERT, REFERENCES, UPDATE, TRIGGER, SELECT, DELETE ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO service_role;