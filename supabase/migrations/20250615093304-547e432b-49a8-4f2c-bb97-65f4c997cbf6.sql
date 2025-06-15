
-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "All authenticated users can view incidents" ON public.incidents;
DROP POLICY IF EXISTS "Analysts and admins can create incidents" ON public.incidents;
DROP POLICY IF EXISTS "Analysts and admins can update incidents" ON public.incidents;
DROP POLICY IF EXISTS "Admins can delete incidents" ON public.incidents;
DROP POLICY IF EXISTS "Users can manage their own integration configs" ON public.integration_configs;
DROP POLICY IF EXISTS "Admins can view login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "System can track login attempts" ON public.login_attempts;

-- Create comprehensive RLS policies for incidents table
CREATE POLICY "incident_select_policy" ON public.incidents
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "incident_insert_policy" ON public.incidents
  FOR INSERT WITH CHECK (
    public.is_analyst_or_admin() AND created_by = auth.uid()
  );

CREATE POLICY "incident_update_policy" ON public.incidents
  FOR UPDATE USING (public.is_analyst_or_admin());

CREATE POLICY "incident_delete_policy" ON public.incidents
  FOR DELETE USING (public.is_admin());

-- Create RLS policies for profiles table
CREATE POLICY "profile_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profile_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profile_select_admin" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "profile_update_admin" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- Create RLS policies for integration_configs table
CREATE POLICY "integration_config_user_access" ON public.integration_configs
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for audit_logs table
CREATE POLICY "audit_log_select_own" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "audit_log_select_admin" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "audit_log_insert_system" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Create RLS policies for login_attempts table
CREATE POLICY "login_attempt_select_admin" ON public.login_attempts
  FOR SELECT USING (public.is_admin());

CREATE POLICY "login_attempt_insert_system" ON public.login_attempts
  FOR INSERT WITH CHECK (true);

-- Add enhanced security functions for rate limiting and account lockout
CREATE OR REPLACE FUNCTION public.check_account_lockout(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*) < 5 FROM public.login_attempts 
  WHERE email = user_email 
  AND success = false 
  AND attempted_at > NOW() - INTERVAL '1 hour';
$$;

-- Function to clean up old audit logs (retention policy)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void
LANGUAGE SQL
SECURITY DEFINER
AS $$
  DELETE FROM public.audit_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
$$;

-- Add indexes for performance on security-critical queries
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time ON public.login_attempts(email, attempted_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_time ON public.audit_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_incidents_created_by ON public.incidents(created_by);
CREATE INDEX IF NOT EXISTS idx_integration_configs_user ON public.integration_configs(user_id);
