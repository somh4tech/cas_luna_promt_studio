
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ReviewHeroSection from '@/components/review/ReviewHeroSection';
import PromptDetails from '@/components/PromptDetails';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import InvalidInvitation from '@/components/InvalidInvitation';
import { useReviewInvitation } from '@/hooks/useReviewInvitation';
import { useInvitationAcceptance } from '@/hooks/useInvitationAcceptance';
import { supabase } from '@/integrations/supabase/client';

const ReviewPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessingInvitation, setIsProcessingInvitation] = useState(false);

  // Use the existing hook to fetch invitation data
  const { invitation, prompt, project, isLoading, error, retryFetch } = useReviewInvitation(token);
  const { acceptInvitation } = useInvitationAcceptance();

  // Handle authenticated users - accept invitation and redirect to project
  useEffect(() => {
    const handleAuthenticatedUser = async () => {
      if (!user || !invitation || !token || !prompt || !project) return;
      
      // If user already accepted this invitation, redirect immediately
      if (invitation.reviewer_id === user.id) {
        console.log('ReviewPage: User already accepted invitation, redirecting to project');
        navigate(`/project/${project.id}?invitation=${token}&prompt=${prompt.id}`);
        return;
      }

      // If user is authenticated but hasn't accepted invitation, accept it and redirect
      setIsProcessingInvitation(true);
      
      try {
        console.log('ReviewPage: Processing invitation acceptance for authenticated user');
        
        const result = await acceptInvitation(token, user.id);
        
        if (result.success) {
          toast({
            title: "Welcome to the project! 🎉",
            description: `You now have access to review "${prompt.title}"`,
          });
          
          // Redirect to project page with invitation context
          navigate(`/project/${project.id}?invitation=${token}&prompt=${prompt.id}`);
        } else {
          toast({
            title: "Error accepting invitation",
            description: result.error || "Please try again or contact support.",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        console.error('ReviewPage: Error processing invitation:', err);
        toast({
          title: "Error processing invitation",
          description: "Please try again or contact support.",
          variant: "destructive",
        });
      } finally {
        setIsProcessingInvitation(false);
      }
    };

    handleAuthenticatedUser();
  }, [user, invitation, token, prompt, project, acceptInvitation, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner message="Loading review invitation..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="mb-4">
            <p className="text-red-600 mb-2">Error loading review invitation</p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
          <button 
            onClick={retryFetch}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!invitation || !prompt || !token) {
    console.log('ReviewPage: No invitation, prompt data, or token found');
    return <InvalidInvitation />;
  }

  // Show processing state for authenticated users
  if (user && isProcessingInvitation) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Processing your invitation...</h3>
          <p className="text-gray-600">Taking you to the project in a moment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-900">Prompt Review Invitation</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Hero Section with Auth Gate - Only show for non-authenticated users */}
          {!user && (
            <ReviewHeroSection
              promptTitle={prompt.title}
              promptContent={prompt.content}
              reviewerEmail={invitation.reviewer_email}
              isAuthenticated={false}
              invitationToken={token}
            />
          )}

          {/* Full Prompt Details - Only visible when not authenticated (authenticated users get redirected) */}
          {!user && (
            <PromptDetails
              title={prompt.title}
              content={prompt.content}
              status={prompt.status}
              projectName={project?.name || 'Unknown Project'}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default ReviewPage;
