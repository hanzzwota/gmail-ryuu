REVOKE SELECT (deposit_password) ON public.settings FROM authenticated, anon;
CREATE OR REPLACE FUNCTION public.check_deposit_password(_password TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.settings WHERE id = 1 AND deposit_password = _password);
$$;
REVOKE ALL ON FUNCTION public.check_deposit_password(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_deposit_password(TEXT) TO authenticated, service_role;