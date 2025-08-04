import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import InvitationSuccess from '@/components/InvitationSuccess';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInvitationSuccess, setShowInvitationSuccess] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isFromReview = location.state?.fromReview;
  const reviewUrl = location.state?.reviewUrl;
  const promptTitle = location.state?.promptTitle;
  const defaultEmail = location.state?.defaultEmail;
  const isExistingUser = location.state?.isExistingUser;
  const invitationToken = location.state?.invitationToken;

  // Pre-fill email if provided
  useEffect(() => {
    if (defaultEmail && !email) {
      setEmail(defaultEmail);
    }
  }, [defaultEmail]);

  // Handle successful authentication for review invitations
  useEffect(() => {
    if (user && isFromReview && invitationToken && !showInvitationSuccess) {
      console.log('AuthPage: User authenticated with invitation, showing success screen');
      setShowInvitationSuccess(true);
    } else if (user && !isFromReview) {
      // Regular authentication flow
      navigate('/dashboard');
    }
  }, [user, isFromReview, invitationToken, showInvitationSuccess, navigate]);

  // Show invitation success screen if needed
  if (showInvitationSuccess && user && invitationToken) {
    return (
      <InvitationSuccess
        invitationToken={invitationToken}
        promptTitle={promptTitle || 'Unknown Prompt'}
        isNewUser={isNewUser}
      />
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsNewUser(false);
    
    console.log('AuthPage: Attempting sign in for review invitation');
    const { error } = await signIn(email, password);
    
    if (!error) {
      console.log('AuthPage: Sign in successful');
      // Success handling will be done by useEffect above
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsNewUser(true);
    
    console.log('AuthPage: Attempting sign up for review invitation');
    // Remove emailRedirectTo to avoid email verification
    const { error } = await signUp(email, password, fullName);
    
    if (!error) {
      console.log('AuthPage: Sign up successful');
      // Success handling will be done by useEffect above
    }
    setLoading(false);
  };

  const handleBackClick = () => {
    if (isFromReview && reviewUrl) {
      window.location.href = reviewUrl;
    } else {
      navigate('/');
    }
  };

  // Determine default tab based on user existence
  const defaultTab = isExistingUser === true ? 'signin' : isExistingUser === false ? 'signup' : 'signin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={handleBackClick}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {isFromReview ? 'Back to Review' : 'Back to Home'}
        </Button>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {isFromReview ? (
                isExistingUser === true ? 'Welcome Back!' : 
                isExistingUser === false ? 'Create Your Account' : 
                'Sign in to Review'
              ) : 'Welcome to Prompt Library'}
            </CardTitle>
            <CardDescription>
              {isFromReview 
                ? `${isExistingUser === true ? 'Sign in to continue' : isExistingUser === false ? 'Create an account' : 'Sign in'} to review "${promptTitle}"` 
                : 'Sign in to your account or create a new one to get started'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      readOnly={!!defaultEmail}
                      className={defaultEmail ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      readOnly={!!defaultEmail}
                      className={defaultEmail ? 'bg-gray-50' : ''}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password (minimum 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {isFromReview && (
              <div className="mt-4 text-center">
                <div className="text-xs text-gray-600 bg-blue-50 rounded-lg p-2">
                  <p className="font-medium">Next steps:</p>
                  <p>Account → Accept Invitation → Dashboard</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
