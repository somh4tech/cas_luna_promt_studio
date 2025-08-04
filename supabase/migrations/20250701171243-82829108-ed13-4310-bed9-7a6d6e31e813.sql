
-- Create function to create default project for a user
CREATE OR REPLACE FUNCTION public.create_default_project(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only create if user doesn't have any projects yet
  IF NOT EXISTS (SELECT 1 FROM public.projects WHERE projects.user_id = $1) THEN
    INSERT INTO public.projects (user_id, name, description)
    VALUES (
      $1,
      'My Personal Prompts',
      'A space for your personal prompt experiments and ideas'
    );
  END IF;
END;
$$;

-- Update the existing handle_new_user function to also create default project
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer set search_path = ''
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  
  -- Create default project
  PERFORM public.create_default_project(NEW.id);
  
  RETURN NEW;
END;
$$;
