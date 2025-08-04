
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MessageSquare } from 'lucide-react';

interface ReviewAuthGateProps {
  promptTitle: string;
}

const ReviewAuthGate = ({ promptTitle }: ReviewAuthGateProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignInClick = () => {
    // Store the current review URL for post-auth redirect
    const currentUrl = `${window.location.origin}${location.pathname}`;
    localStorage.setItem('review_redirect_after_auth', currentUrl);
    navigate('/auth', { 
      state: { 
        fromReview: true, 
        reviewUrl: currentUrl,
        promptTitle 
      } 
    });
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2 text-blue-600" />
          Sign In to Leave Your Review
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700">
          You've been invited to review "<strong>{promptTitle}</strong>". Sign in to:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
          <li>Provide detailed feedback</li>
          <li>Suggest specific improvements</li>
          <li>Help improve the prompt quality</li>
        </ul>
        <div className="flex space-x-3 pt-2">
          <Button onClick={handleSignInClick} className="flex-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            Sign In to Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewAuthGate;
