-- =====================================================
-- Stripe Subscription Management Migration
-- =====================================================
-- Purpose: Add tables and functions for tracking Stripe subscription events
-- and managing subscription lifecycle
-- 
-- Security: All tables have RLS enabled with appropriate policies
-- =====================================================

-- =====================================================
-- 1. Subscription Events Table
-- =====================================================
-- Tracks all Stripe webhook events for audit and debugging
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_subscription_events_profile 
  ON subscription_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_stripe_event 
  ON subscription_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type 
  ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created 
  ON subscription_events(created_at DESC);

-- =====================================================
-- 2. Subscription History Table
-- =====================================================
-- Tracks subscription tier changes for analytics and billing history
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  previous_tier TEXT NOT NULL,
  new_tier TEXT NOT NULL,
  change_reason TEXT NOT NULL, -- 'upgrade', 'downgrade', 'cancelled', 'renewed', 'trial_started', 'trial_ended'
  stripe_subscription_id TEXT,
  effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for profile history lookups
CREATE INDEX IF NOT EXISTS idx_subscription_history_profile 
  ON subscription_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_effective 
  ON subscription_history(effective_at DESC);

-- =====================================================
-- 3. Add subscription period fields to profiles if not exist
-- =====================================================
DO $$ 
BEGIN
  -- Add subscription_period_start if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_period_start'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN subscription_period_start TIMESTAMPTZ;
  END IF;

  -- Add subscription_period_end if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_period_end'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN subscription_period_end TIMESTAMPTZ;
  END IF;

  -- Add cancel_at_period_end if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'cancel_at_period_end'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- =====================================================
-- 4. RLS Policies
-- =====================================================
-- Enable RLS on subscription tables
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Subscription events: Users can only read their own events
CREATE POLICY "Users can view own subscription events"
  ON subscription_events
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Service role can insert/update (webhooks run as service role)
CREATE POLICY "Service role can manage subscription events"
  ON subscription_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Subscription history: Users can only read their own history
CREATE POLICY "Users can view own subscription history"
  ON subscription_history
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Service role can manage history
CREATE POLICY "Service role can manage subscription history"
  ON subscription_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 5. Function to update subscription from webhook
-- =====================================================
CREATE OR REPLACE FUNCTION update_subscription_from_webhook(
  p_profile_id UUID,
  p_tier TEXT,
  p_status TEXT,
  p_stripe_customer_id TEXT,
  p_stripe_subscription_id TEXT,
  p_period_start TIMESTAMPTZ,
  p_period_end TIMESTAMPTZ,
  p_cancel_at_period_end BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
DECLARE
  v_previous_tier TEXT;
BEGIN
  -- Get previous tier for history
  SELECT subscription_tier INTO v_previous_tier
  FROM profiles
  WHERE id = p_profile_id;

  -- Update the profile
  UPDATE profiles
  SET 
    subscription_tier = p_tier,
    subscription_status = p_status,
    stripe_customer_id = p_stripe_customer_id,
    stripe_subscription_id = p_stripe_subscription_id,
    subscription_period_start = p_period_start,
    subscription_period_end = p_period_end,
    cancel_at_period_end = p_cancel_at_period_end,
    updated_at = NOW()
  WHERE id = p_profile_id;

  -- Record in history if tier changed
  IF v_previous_tier IS DISTINCT FROM p_tier THEN
    INSERT INTO subscription_history (
      profile_id,
      previous_tier,
      new_tier,
      change_reason,
      stripe_subscription_id,
      effective_at
    ) VALUES (
      p_profile_id,
      COALESCE(v_previous_tier, 'free'),
      p_tier,
      CASE 
        WHEN p_tier = 'free' THEN 'cancelled'
        WHEN v_previous_tier = 'summit' AND p_tier = 'ascent' THEN 'downgrade'
        WHEN v_previous_tier = 'free' OR v_previous_tier IS NULL THEN 'upgrade'
        WHEN v_previous_tier = 'ascent' AND p_tier = 'summit' THEN 'upgrade'
        ELSE 'changed'
      END,
      p_stripe_subscription_id,
      NOW()
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. Function to log subscription events
-- =====================================================
CREATE OR REPLACE FUNCTION log_subscription_event(
  p_profile_id UUID,
  p_stripe_customer_id TEXT,
  p_stripe_subscription_id TEXT,
  p_stripe_event_id TEXT,
  p_event_type TEXT,
  p_event_data JSONB
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO subscription_events (
    profile_id,
    stripe_customer_id,
    stripe_subscription_id,
    stripe_event_id,
    event_type,
    event_data,
    processed_at
  ) VALUES (
    p_profile_id,
    p_stripe_customer_id,
    p_stripe_subscription_id,
    p_stripe_event_id,
    p_event_type,
    p_event_data,
    NOW()
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. View for subscription analytics (admin only)
-- =====================================================
CREATE OR REPLACE VIEW subscription_analytics AS
SELECT 
  COUNT(*) FILTER (WHERE subscription_tier = 'free') as free_users,
  COUNT(*) FILTER (WHERE subscription_tier = 'ascent') as ascent_users,
  COUNT(*) FILTER (WHERE subscription_tier = 'summit') as summit_users,
  COUNT(*) FILTER (WHERE subscription_status = 'active') as active_subscriptions,
  COUNT(*) FILTER (WHERE subscription_status = 'cancelled') as cancelled_subscriptions,
  COUNT(*) FILTER (WHERE cancel_at_period_end = true) as pending_cancellations
FROM profiles
WHERE deleted_at IS NULL;

COMMENT ON TABLE subscription_events IS 'Audit log of all Stripe webhook events for debugging and compliance';
COMMENT ON TABLE subscription_history IS 'Historical record of subscription tier changes for analytics';
COMMENT ON FUNCTION update_subscription_from_webhook IS 'Updates profile subscription from Stripe webhook data';
COMMENT ON FUNCTION log_subscription_event IS 'Logs Stripe webhook events for audit trail';
