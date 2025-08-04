import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Code, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const ApiWaitlist = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('api_waitlist')
        .insert([{ email: email.trim() }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already on the list!",
            description: "This email is already registered for the API waitlist.",
            variant: "default",
          });
        } else {
          throw error;
        }
      } else {
        setIsSubmitted(true);
        toast({
          title: "Successfully joined!",
          description: "You've been added to the API waitlist. We'll notify you when it's ready.",
        });
      }
    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">You're on the list!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              We'll notify you as soon as the Cascade Prompt Studio API is ready for early access.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/')} className="w-full">
                Back to Home
              </Button>
              <Button variant="outline" onClick={() => navigate('/auth')} className="w-full">
                Sign Up for Beta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="px-8 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/72b4715a-9e0a-45a6-9593-90b2719057bb.png" 
              alt="Cascade Prompt Studio" 
              className="h-6 w-auto"
            />
            <span className="text-lg font-semibold text-gray-900">Cascade Prompt Studio</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="text-center mb-12">
          <Badge className="bg-orange-100 text-orange-800 mb-6">
            <Code className="h-4 w-4 mr-2" />
            Coming July 2025
          </Badge>
          
          <h1 className="text-5xl font-light text-gray-900 mb-6">
            Join the API Waitlist
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Be the first to access the Cascade Prompt Studio API. We'll notify you when early access becomes available.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Signup Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Get Early Access</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining Waitlist...
                    </>
                  ) : (
                    'Join API Waitlist'
                  )}
                </Button>
              </form>
              
              <p className="text-sm text-gray-500 mt-4">
                No spam, ever. Unsubscribe anytime.
              </p>
            </CardContent>
          </Card>

          {/* API Features Preview */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900">What's Coming</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <h4 className="font-semibold">RESTful API Endpoints</h4>
                  <p className="text-gray-600">Full CRUD operations for prompts, projects, and testing</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Real-time Webhooks</h4>
                  <p className="text-gray-600">Get notified when prompts are updated or reviewed</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <h4 className="font-semibold">SDKs & Libraries</h4>
                  <p className="text-gray-600">Python, JavaScript, and more coming soon</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Authentication & Security</h4>
                  <p className="text-gray-600">API keys, OAuth, and enterprise-grade security</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border">
              <div className="text-sm text-gray-400 mb-4">Example API Usage</div>
              <pre className="text-green-400 text-sm font-mono leading-relaxed">
{`// Create a new prompt
const prompt = await cascade.prompts.create({
  title: "Customer Support AI",
  content: "You are a helpful assistant...",
  project_id: "proj_abc123"
});

// Test the prompt
const result = await cascade.prompts.test({
  prompt_id: prompt.id,
  model: "gpt-4",
  variables: { customer_name: "John" }
});`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiWaitlist;