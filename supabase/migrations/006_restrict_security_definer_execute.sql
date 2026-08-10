-- Restrict SECURITY DEFINER helpers so anon/authenticated cannot call them via
-- PostgREST (/rest/v1/rpc/...) or GraphQL. Triggers and privileged roles keep access.

-- handle_new_user: auth.users AFTER INSERT trigger (owned by supabase_auth_admin)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, supabase_auth_admin;

-- purge_scheduled_account_deletions: intended for postgres / pg_cron only
REVOKE EXECUTE ON FUNCTION public.purge_scheduled_account_deletions() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.purge_scheduled_account_deletions() FROM anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.purge_scheduled_account_deletions() TO postgres;

-- rls_auto_enable: ddl_command_end event trigger (ensure_rls) — not an API endpoint
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.rls_auto_enable() TO postgres;
