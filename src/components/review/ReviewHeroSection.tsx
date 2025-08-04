
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, User, CheckCircle, Loader2 } from 'lucide-react';
import { useUserDetection } from '@/hooks/useUserDetection';

interface ReviewHeroSectionProps {
  promptTitle: string;
  promptContent: string;
  reviewerEmail: string;
  isAuthenticated: boolean;
  invitationToken: string;
}

const ReviewHeroSection = ({ 
  promptTitle, 
  promptContent, 
  reviewerEmail, 
  isAuthenticated,
  invitationToken 
}: ReviewHeroSectionProps) => {
  const navigate = useNavigate();
  const { userExists, isLoading } = useUserDetection(reviewerEmail);

  const handleAuthClick = () => {
    // Determine mode based on user existence
    const mode = userExists === false ? 'signup' : 'signin';
    
    // Navigate with invitation token, email, and mode
    navigate(`/auth?invitation=${invitationToken}&email=${encodeURIComponent(reviewerEmail)}&mode=${mode}`);
  };

  // This component should only render for non-authenticated users
  // Authenticated users are handled and redirected in ReviewPage
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            You've Been Invited to Review a Prompt
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Help improve "<strong>{promptTitle}</strong>" with your feedback and suggestions
          </p>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <MessageSquare className="h-4 w-4" />
              <span>Provide detailed feedback</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <User className="h-4 w-4" />
              <span>Suggest improvements</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-blue-700">
              <CheckCircle className="h-4 w-4" />
              <span>Help enhance quality</span>
            </div>
          </div>

          {/* Auth Button */}
          <div className="pt-4">
            {isLoading ? (
              <Button disabled className="px-8 py-3 text-lg">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Checking account...
              </Button>
            ) : (
              <Button 
                onClick={handleAuthClick} 
                size="lg" 
                className="px-8 py-3 text-lg font-semibold"
              >
                {userExists === true ? (
                  <>
                    <User className="h-5 w-5 mr-2" />
                    Sign In to Review
                  </>
                ) : userExists === false ? (
                  <>
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Create Account & Review
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Continue to Review
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Helper Text */}
          <div className="text-sm text-gray-600 bg-white/50 rounded-lg p-3">
            <p className="font-medium mb-1">Why do I need to sign in?</p>
            <p>Authentication ensures your feedback is properly attributed and you can track review history in your dashboard.</p>
          </div>
        </CardContent>
      </Card>

      {/* Prompt Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Prompt Preview</CardTitle>
          <p className="text-sm text-gray-600">Sign in to see the complete prompt and leave your review</p>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4 relative">
            <p className="text-gray-700 line-clamp-4">
              {promptContent.substring(0, 200)}...
            </p>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50 pointer-events-none" />
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            <strong>Full content available after authentication</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewHeroSection;
