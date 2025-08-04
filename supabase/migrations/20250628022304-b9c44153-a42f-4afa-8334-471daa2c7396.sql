
-- Create projects table for organizing prompt boards
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create prompts table with status tracking
CREATE TABLE public.prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'in_review', 'in_production')),
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table for collaboration
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES public.prompts ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create test results table for prompt testing
CREATE TABLE public.test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES public.prompts ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  input_data TEXT,
  output_data TEXT,
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table for additional user info
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects" 
  ON public.projects 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
  ON public.projects 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
  ON public.projects 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
  ON public.projects 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for prompts
CREATE POLICY "Users can view prompts in their projects" 
  ON public.prompts 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = prompts.project_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create prompts in their projects" 
  ON public.prompts 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = prompts.project_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update prompts in their projects" 
  ON public.prompts 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = prompts.project_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete prompts in their projects" 
  ON public.prompts 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = prompts.project_id 
    AND projects.user_id = auth.uid()
  ));

-- RLS Policies for comments (allow viewing/adding comments on accessible prompts)
CREATE POLICY "Users can view comments on accessible prompts" 
  ON public.comments 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.prompts 
    JOIN public.projects ON prompts.project_id = projects.id
    WHERE prompts.id = comments.prompt_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can add comments on accessible prompts" 
  ON public.comments 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.prompts 
    JOIN public.projects ON prompts.project_id = projects.id
    WHERE prompts.id = comments.prompt_id 
    AND projects.user_id = auth.uid()
  ));

-- RLS Policies for test results
CREATE POLICY "Users can view test results for their prompts" 
  ON public.test_results 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.prompts 
    JOIN public.projects ON prompts.project_id = projects.id
    WHERE prompts.id = test_results.prompt_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create test results for their prompts" 
  ON public.test_results 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.prompts 
    JOIN public.projects ON prompts.project_id = projects.id
    WHERE prompts.id = test_results.prompt_id 
    AND projects.user_id = auth.uid()
  ));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update prompt timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers to update timestamps
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
