
-- Create a function to check if a user exists by email
CREATE OR REPLACE FUNCTION public.user_exists_by_email(email_address TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = email_address
  );
$$;
