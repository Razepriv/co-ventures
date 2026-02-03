-- ========================================
-- OPTIMIZE RLS POLICIES FOR AI TABLES
-- Replaces inline EXISTS subqueries with cached is_admin() function
-- Also adds service_role policies for server-side access
-- ========================================

-- ========================================
-- 1. AI API KEYS TABLE
-- ========================================
DROP POLICY IF EXISTS "Admin users can view API keys" ON public.ai_api_keys;
DROP POLICY IF EXISTS "Admin users can insert API keys" ON public.ai_api_keys;
DROP POLICY IF EXISTS "Admin users can update API keys" ON public.ai_api_keys;
DROP POLICY IF EXISTS "Admin users can delete API keys" ON public.ai_api_keys;

CREATE POLICY "Admin users can view API keys"
ON public.ai_api_keys
FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admin users can insert API keys"
ON public.ai_api_keys
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Admin users can update API keys"
ON public.ai_api_keys
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admin users can delete API keys"
ON public.ai_api_keys
FOR DELETE
TO authenticated
USING (is_admin());

-- Allow service role full access (for server-side AI service)
DROP POLICY IF EXISTS "Service role can access API keys" ON public.ai_api_keys;
CREATE POLICY "Service role can access API keys"
ON public.ai_api_keys
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ========================================
-- 2. AI AGENT CONFIGURATIONS TABLE
-- ========================================
DROP POLICY IF EXISTS "Admin users can view agent configs" ON public.ai_agent_configurations;
DROP POLICY IF EXISTS "Admin users can update agent configs" ON public.ai_agent_configurations;
DROP POLICY IF EXISTS "Admins can manage AI agents" ON public.ai_agent_configurations;
DROP POLICY IF EXISTS "Authenticated users can view enabled agents" ON public.ai_agent_configurations;

-- Admin can manage all agent configurations
CREATE POLICY "Admins can manage AI agents"
ON public.ai_agent_configurations
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Any authenticated user can read enabled agents (for property page AI chat)
CREATE POLICY "Authenticated users can view enabled agents"
ON public.ai_agent_configurations
FOR SELECT
TO authenticated
USING (is_enabled = true);

-- Service role full access for server-side AI operations
DROP POLICY IF EXISTS "Service role can access agent configs" ON public.ai_agent_configurations;
CREATE POLICY "Service role can access agent configs"
ON public.ai_agent_configurations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ========================================
-- 3. AI AGENT CONFIGURATION HISTORY TABLE (if exists)
-- ========================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_agent_configuration_history') THEN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view agent history" ON public.ai_agent_configuration_history';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can manage agent history" ON public.ai_agent_configuration_history';

    EXECUTE 'CREATE POLICY "Admins can manage agent history" ON public.ai_agent_configuration_history FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin())';

    EXECUTE 'DROP POLICY IF EXISTS "Service role can access agent history" ON public.ai_agent_configuration_history';
    EXECUTE 'CREATE POLICY "Service role can access agent history" ON public.ai_agent_configuration_history FOR ALL TO service_role USING (true) WITH CHECK (true)';
  END IF;
END $$;

SELECT 'AI tables RLS optimization complete!' as status;
