
-- Enable Row Level Security on test_results table
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own test results
CREATE POLICY "Users can view their own test results" 
  ON public.test_results 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own test results
CREATE POLICY "Users can create their own test results" 
  ON public.test_results 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to update their own test results
CREATE POLICY "Users can update their own test results" 
  ON public.test_results 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to delete their own test results
CREATE POLICY "Users can delete their own test results" 
  ON public.test_results 
  FOR DELETE 
  USING (auth.uid() = user_id);
