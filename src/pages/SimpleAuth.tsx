
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Lock, KeyRound } from 'lucide-react';

const SimpleAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const { signIn, signUp, signInWithGoogle, resetPassword, updatePassword, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get parameters from URL
  const invitationToken = searchParams.get('invitation');
  const invitationEmail = searchParams.get('email');
  const authMode = searchParams.get('mode');
  const isFromInvitation = !!invitationToken;
  const isEmailLocked = isFromInvitation && !!invitationEmail;
  const isRecoveryMode = authMode === 'recovery';

  // Set default tab based on mode
  const [activeTab, setActiveTab] = useState(authMode === 'signup' ? 'signup' : 'signin');

  // Pre-fill email if from invitation
  useEffect(() => {
    if (invitationEmail && !email) {
      setEmail(decodeURIComponent(invitationEmail));
    }
  }, [invitationEmail, email]);

  // Redirect authenticated users
  useEffect(() => {
    if (user && !isFromInvitation && !isRecoveryMode) {
      navigate('/dashboard');
    } else if (user && isFromInvitation && !isRecoveryMode) {
      // Direct redirect to review page for invited users
      navigate(`/review/${invitationToken}`);
    }
  }, [user, isFromInvitation, invitationToken, navigate, isRecoveryMode]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('SimpleAuth: Attempting sign in');
    const { error } = await signIn(email, password);
    
    if (!error && isFromInvitation) {
      // Add invitation token to URL for the auth state change handler
      const url = new URL(window.location.href);
      url.searchParams.set('invitation', invitationToken!);
      window.history.replaceState({}, '', url.toString());
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('SimpleAuth: Attempting sign up');
    const { error } = await signUp(email, password, fullName);
    
    if (!error && isFromInvitation) {
      // Add invitation token to URL for the auth state change handler
      const url = new URL(window.location.href);
      url.searchParams.set('invitation', invitationToken!);
      window.history.replaceState({}, '', url.toString());
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('SimpleAuth: Attempting password reset');
    const { error } = await resetPassword(resetEmail);
    
    if (!error) {
      setShowResetForm(false);
      setResetEmail('');
    }
    
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return;
    }
    
    setLoading(true);
    
    console.log('SimpleAuth: Attempting password update');
    const { error } = await updatePassword(newPassword);
    
    if (!error) {
      // Redirect to dashboard after successful password update
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    console.log('SimpleAuth: Attempting Google sign in');
    const { error } = await signInWithGoogle();
    
    if (!error && isFromInvitation) {
      // Add invitation token to URL for the auth state change handler
      const url = new URL(window.location.href);
      url.searchParams.set('invitation', invitationToken!);
      window.history.replaceState({}, '', url.toString());
    }
    
    setLoading(false);
  };

  const handleBackClick = () => {
    if (isFromInvitation) {
      navigate(`/review/${invitationToken}`);
    } else {
      navigate('/');
    }
  };

  // Password recovery mode
  if (isRecoveryMode && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>

          <Card className="shadow-lg border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                <KeyRound className="h-6 w-6" />
                Set New Password
              </CardTitle>
              <CardDescription>
                Enter your new password to complete the reset process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-sm text-red-600">Passwords do not match</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || newPassword !== confirmPassword || !newPassword}
                >
                  {loading ? 'Updating Password...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={handleBackClick}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {isFromInvitation ? 'Back to Review' : 'Back to Home'}
        </Button>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              {isFromInvitation ? 'Sign in to Review' : 'Welcome to Prompt Library'}
            </CardTitle>
            <CardDescription>
              {isFromInvitation 
                ? 'Sign in or create an account to access your review invitation' 
                : 'Sign in to your account or create a new one to get started'
              }
            </CardDescription>
            {isEmailLocked && (
              <div className="flex items-center justify-center gap-2 text-sm text-blue-600 bg-blue-50 rounded-lg p-2 mt-2">
                <Lock className="h-4 w-4" />
                <span>Email pre-filled from invitation</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {showResetForm ? (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium">Reset Password</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowResetForm(false)}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Sending...' : 'Send Reset Email'}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => !isEmailLocked && setEmail(e.target.value)}
                          required
                          disabled={isEmailLocked}
                          className={isEmailLocked ? 'bg-gray-100 cursor-not-allowed' : ''}
                        />
                        {isEmailLocked && (
                          <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        )}
                      </div>
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
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full"
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      {loading ? 'Signing in...' : 'Continue with Google'}
                    </Button>
                    
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setShowResetForm(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Forgot your password?
                      </button>
                    </div>
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
                      <div className="relative">
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => !isEmailLocked && setEmail(e.target.value)}
                          required
                          disabled={isEmailLocked}
                          className={isEmailLocked ? 'bg-gray-100 cursor-not-allowed' : ''}
                        />
                        {isEmailLocked && (
                          <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        )}
                      </div>
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
                    
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleSignIn}
                      disabled={loading}
                      className="w-full"
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      {loading ? 'Signing in...' : 'Continue with Google'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimpleAuth;
