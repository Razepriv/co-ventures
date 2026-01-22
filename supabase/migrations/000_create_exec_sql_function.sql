-- Create exec_sql function for running migrations programmatically
CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;

-- Add comment
COMMENT ON FUNCTION public.exec_sql IS 'Execute arbitrary SQL (service role only) - used for migrations';
