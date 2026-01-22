-- =============================================================================
-- HELPER FUNCTION FOR SCHEMA EXTRACTION
-- =============================================================================
-- Purpose: Allows TypeScript script to execute arbitrary SQL queries
-- Security: SECURITY DEFINER - use with caution, only for trusted operations
-- =============================================================================

CREATE OR REPLACE FUNCTION public.exec_sql_to_json(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

COMMENT ON FUNCTION public.exec_sql_to_json IS 'Helper function to execute SQL queries and return results as JSONB array';

-- Grant execute permission to service role only
REVOKE ALL ON FUNCTION public.exec_sql_to_json(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.exec_sql_to_json(TEXT) TO service_role;
