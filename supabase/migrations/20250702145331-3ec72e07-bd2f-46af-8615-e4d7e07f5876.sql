-- Create waitlist table for API signups
CREATE TABLE public.api_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.api_waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies for waitlist access
CREATE POLICY "Anyone can join the waitlist"
ON public.api_waitlist
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all waitlist entries"
ON public.api_waitlist
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add indexes for performance
CREATE INDEX idx_api_waitlist_email ON public.api_waitlist(email);
CREATE INDEX idx_api_waitlist_created_at ON public.api_waitlist(created_at DESC);