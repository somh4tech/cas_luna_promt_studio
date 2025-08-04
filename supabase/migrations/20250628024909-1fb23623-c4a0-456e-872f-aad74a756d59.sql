
-- Create enum for review status
CREATE TYPE public.review_status AS ENUM ('pending', 'in_progress', 'completed', 'declined');

-- Create enum for invitation status  
CREATE TYPE public.invitation_status AS ENUM ('sent', 'accepted', 'declined', 'expired');

-- Create table for review invitations
CREATE TABLE public.review_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  inviter_id UUID REFERENCES auth.users NOT NULL,
  reviewer_email TEXT NOT NULL,
  reviewer_id UUID REFERENCES auth.users NULL, -- Will be set when reviewer registers/logs in
  invitation_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  status invitation_status NOT NULL DEFAULT 'sent',
  message TEXT, -- Optional message from inviter
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for prompt reviews
CREATE TABLE public.prompt_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users NOT NULL,
  invitation_id UUID REFERENCES public.review_invitations(id) ON DELETE SET NULL,
  status review_status NOT NULL DEFAULT 'pending',
  feedback TEXT,
  suggested_changes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(prompt_id, reviewer_id) -- One review per reviewer per prompt
);

-- Enable RLS
ALTER TABLE public.review_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for review_invitations
CREATE POLICY "Users can view invitations they sent or received" 
  ON public.review_invitations 
  FOR SELECT 
  USING (
    auth.uid() = inviter_id OR 
    auth.uid() = reviewer_id OR
    auth.email() = reviewer_email
  );

CREATE POLICY "Users can create invitations for their prompts" 
  ON public.review_invitations 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.prompts 
    JOIN public.projects ON prompts.project_id = projects.id
    WHERE prompts.id = review_invitations.prompt_id 
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own invitations or accept invitations" 
  ON public.review_invitations 
  FOR UPDATE 
  USING (
    auth.uid() = inviter_id OR 
    auth.uid() = reviewer_id OR
    auth.email() = reviewer_email
  );

-- RLS Policies for prompt_reviews
CREATE POLICY "Users can view reviews for their prompts or their own reviews" 
  ON public.prompt_reviews 
  FOR SELECT 
  USING (
    auth.uid() = reviewer_id OR
    EXISTS (
      SELECT 1 FROM public.prompts 
      JOIN public.projects ON prompts.project_id = projects.id
      WHERE prompts.id = prompt_reviews.prompt_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reviews for invitations they received" 
  ON public.prompt_reviews 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = reviewer_id AND
    (invitation_id IS NULL OR EXISTS (
      SELECT 1 FROM public.review_invitations 
      WHERE id = prompt_reviews.invitation_id 
      AND reviewer_id = auth.uid()
    ))
  );

CREATE POLICY "Reviewers can update their own reviews" 
  ON public.prompt_reviews 
  FOR UPDATE 
  USING (auth.uid() = reviewer_id);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_review_invitations_updated_at
  BEFORE UPDATE ON public.review_invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_prompt_reviews_updated_at
  BEFORE UPDATE ON public.prompt_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Add indexes for performance
CREATE INDEX idx_review_invitations_prompt_id ON public.review_invitations(prompt_id);
CREATE INDEX idx_review_invitations_reviewer_email ON public.review_invitations(reviewer_email);
CREATE INDEX idx_review_invitations_token ON public.review_invitations(invitation_token);
CREATE INDEX idx_prompt_reviews_prompt_id ON public.prompt_reviews(prompt_id);
CREATE INDEX idx_prompt_reviews_reviewer_id ON public.prompt_reviews(reviewer_id);
