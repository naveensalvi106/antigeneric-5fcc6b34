DROP POLICY "Users can view own submissions" ON public.thumbnail_submissions;

CREATE OR REPLACE FUNCTION public.get_user_email(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT email FROM auth.users WHERE id = _user_id
$$;

CREATE POLICY "Users can view own submissions" ON public.thumbnail_submissions
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role)
  OR user_email = public.get_user_email(auth.uid())
);