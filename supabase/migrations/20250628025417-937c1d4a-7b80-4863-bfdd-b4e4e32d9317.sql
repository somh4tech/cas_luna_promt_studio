
-- First, we need to add the missing foreign key constraint from prompt_reviews to profiles
-- and update the existing constraint

-- Drop the existing foreign key constraint if it exists
ALTER TABLE public.prompt_reviews DROP CONSTRAINT IF EXISTS prompt_reviews_reviewer_id_fkey;

-- Add the correct foreign key constraint to profiles table
ALTER TABLE public.prompt_reviews 
ADD CONSTRAINT prompt_reviews_reviewer_id_fkey 
FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also update review_invitations to reference profiles
ALTER TABLE public.review_invitations DROP CONSTRAINT IF EXISTS review_invitations_reviewer_id_fkey;
ALTER TABLE public.review_invitations 
ADD CONSTRAINT review_invitations_reviewer_id_fkey 
FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
