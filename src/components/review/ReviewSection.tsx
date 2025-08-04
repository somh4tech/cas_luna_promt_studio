import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import ReviewForm from './ReviewForm';

interface ReviewWithProfile {
  id: string;
  prompt_id: string;
  reviewer_id: string;
  invitation_id: string | null;
  status: string;
  feedback: string | null;
  suggested_changes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
}

interface ReviewSectionProps {
  promptId: string;
  isOpen: boolean;
  onRequestReview: () => void;
  isReviewerMode?: boolean;
}

const ReviewSection = ({ promptId, isOpen, onRequestReview, isReviewerMode = false }: ReviewSectionProps) => {
  const { user } = useAuth();

  // Fetch review invitations and reviews
  const { data: reviewData } = useQuery({
    queryKey: ['review-data', promptId],
    queryFn: async () => {
      const [invitationsResult, reviewsResult] = await Promise.all([
        supabase
          .from('review_invitations')
          .select('*')
          .eq('prompt_id', promptId)
          .order('created_at', { ascending: false }),
        supabase
          .from('prompt_reviews')
          .select(`
            *,
            profiles (
              full_name,
              email
            )
          `)
          .eq('prompt_id', promptId)
          .order('created_at', { ascending: false })
      ]);

      if (invitationsResult.error) throw invitationsResult.error;
      if (reviewsResult.error) throw reviewsResult.error;

      return {
        invitations: invitationsResult.data,
        reviews: reviewsResult.data as ReviewWithProfile[],
      };
    },
    enabled: isOpen,
  });

  // Check if current user has a review invitation for this prompt
  const { data: userInvitation } = useQuery({
    queryKey: ['user-invitation', promptId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('review_invitations')
        .select('*')
        .eq('prompt_id', promptId)
        .eq('reviewer_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && isReviewerMode,
  });

  // Check if user already has a review for this prompt
  const { data: existingReview } = useQuery({
    queryKey: ['user-review', promptId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('prompt_reviews')
        .select('*')
        .eq('prompt_id', promptId)
        .eq('reviewer_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && isReviewerMode,
  });

  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Review Form for Reviewers */}
      {isReviewerMode && userInvitation && (
        <ReviewForm
          invitation={userInvitation}
          existingReview={existingReview}
          user={user}
        />
      )}

      {/* Pending Invitations - Only show to owners */}
      {!isReviewerMode && reviewData?.invitations?.filter(inv => inv.status === 'sent').map((invitation) => (
        <Card key={invitation.id} className="border-yellow-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{invitation.reviewer_email}</p>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                Invitation Sent
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-gray-500">
              Sent {new Date(invitation.created_at).toLocaleDateString()}
            </p>
            {invitation.message && (
              <p className="text-sm mt-2 italic text-gray-600">"{invitation.message}"</p>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Completed Reviews */}
      {reviewData?.reviews?.map((review) => (
        <Card key={review.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {review.profiles?.full_name || review.profiles?.email || 'Anonymous'}
              </p>
              <Badge className={getReviewStatusColor(review.status)}>
                {review.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {review.feedback && (
              <div>
                <p className="text-xs font-medium text-gray-600">Feedback:</p>
                <p className="text-sm">{review.feedback}</p>
              </div>
            )}
            {review.suggested_changes && (
              <div>
                <p className="text-xs font-medium text-gray-600">Suggested Changes:</p>
                <p className="text-sm bg-gray-50 p-2 rounded">{review.suggested_changes}</p>
              </div>
            )}
            <p className="text-xs text-gray-500">
              {review.completed_at 
                ? `Completed ${new Date(review.completed_at).toLocaleString()}`
                : `Created ${new Date(review.created_at).toLocaleString()}`
              }
            </p>
          </CardContent>
        </Card>
      ))}

      {/* Empty state for owners only */}
      {!isReviewerMode && !reviewData?.invitations?.length && !reviewData?.reviews?.length && (
        <div className="text-center py-8">
          <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600 mb-4">Invite colleagues to review this prompt</p>
          <Button onClick={onRequestReview}>
            <UserPlus className="h-4 w-4 mr-2" />
            Request Review
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
