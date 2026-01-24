-- ============================================================================
-- Admin Audit Log Table
-- ============================================================================
-- Creates table for tracking admin actions across the platform.
-- Used for compliance, security monitoring, and debugging.
-- ============================================================================

-- =============================================================================
-- TABLE: admin_audit_log
-- =============================================================================

CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    changes JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE admin_audit_log IS 'Audit trail of admin actions for security and compliance';
COMMENT ON COLUMN admin_audit_log.admin_id IS 'Admin user who performed the action';
COMMENT ON COLUMN admin_audit_log.action IS 'Description of action taken (e.g., "Updated user profile")';
COMMENT ON COLUMN admin_audit_log.entity_type IS 'Type of entity affected (profile, child, question, etc.)';
COMMENT ON COLUMN admin_audit_log.entity_id IS 'ID of the affected entity (if applicable)';
COMMENT ON COLUMN admin_audit_log.changes IS 'JSON object describing what changed';
COMMENT ON COLUMN admin_audit_log.ip_address IS 'IP address of admin user';

-- Indexes for common queries
CREATE INDEX idx_admin_audit_log_admin ON admin_audit_log(admin_id, created_at DESC);
CREATE INDEX idx_admin_audit_log_entity ON admin_audit_log(entity_type, entity_id);
CREATE INDEX idx_admin_audit_log_created ON admin_audit_log(created_at DESC);

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "admin_audit_log_admin_view"
    ON admin_audit_log FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Only admins can insert audit logs (via server functions)
CREATE POLICY "admin_audit_log_admin_insert"
    ON admin_audit_log FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'super_admin')
        )
    );

-- Service role can do anything (for server-side logging)
CREATE POLICY "admin_audit_log_service_role"
    ON admin_audit_log FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =============================================================================
-- VERIFY
-- =============================================================================

SELECT 
    tablename,
    schemaname
FROM pg_tables
WHERE tablename = 'admin_audit_log';
