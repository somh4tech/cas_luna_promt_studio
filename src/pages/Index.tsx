import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { ArrowRight, Zap, Users, GitBranch, Code, CheckCircle, Star, Loader2, Calendar, Globe, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, initialized } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    console.log('Index: Auth state -', { user: user?.email || 'null', loading, initialized });
    
    if (initialized && user && !redirecting) {
      console.log('Index: User authenticated, redirecting to dashboard');
      setRedirecting(true);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    }
  }, [user, loading, initialized, navigate, redirecting]);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  const handleBookDemo = () => {
    const subject = encodeURIComponent('Demo Request for Cascade Context Studio');
    const body = encodeURIComponent(`Hi Magnus,

I'm interested in learning more about Cascade Context Studio and would like to schedule a demo.

Please let me know your availability for a brief call to discuss how context engineering could benefit our AI systems.

Best regards`);
    
    window.open(`mailto:magnus@cascadeaipartners.com?subject=${subject}&body=${body}`);
  };

  // Show loading while auth is initializing or if we're redirecting
  if (loading || !initialized || (user && !redirecting)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">
            {user ? 'Redirecting to dashboard...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen">
      {/* Hero Section - Full Screen */}
      <section className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 relative flex items-center justify-center overflow-hidden">
        {/* Navigation - Fixed */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-black/20 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/72b4715a-9e0a-45a6-9593-90b2719057bb.png" 
              alt="Cascade Context Studio" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-semibold text-white">Cascade Context Studio</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
              Beta
            </Badge>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => navigate('/blog')}
              className="text-white/80 hover:text-white transition-colors"
            >
              Blog
            </button>
            <button 
              onClick={() => navigate('/pricing')}
              className="text-white/80 hover:text-white transition-colors"
            >
              Pricing
            </button>
            <button 
              onClick={handleSignIn}
              className="text-white/80 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <Button onClick={handleGetStarted} variant="secondary" className="bg-white text-blue-900 hover:bg-gray-100">
              Start Building
            </Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="max-w-6xl mx-auto px-8 text-center relative z-10">
          <div className="flex items-center justify-center mb-6">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Exclusive Beta Access
            </Badge>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-light text-white mb-8 leading-tight">
            Context Engineering
            <br />
            <span className="font-medium bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              for Reliable AI
            </span>
          </h1>
          
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Stop hoping your AI works. Start engineering context that delivers consistent, reliable results. 
            Join teams building production-ready AI systems through systematic context optimization.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 text-lg"
            >
              Start Building Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={handleBookDemo}
              size="lg"
              className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              Book a Demo
            </Button>
          </div>

          {/* Beta Status */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>500+ teams in beta</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>99.9% uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>SOC 2 compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - Full Screen */}
      <section className="min-h-screen w-screen bg-white flex items-center justify-center py-20">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-8">
            AI Inconsistency is Killing 
            <span className="block font-medium bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Your Production Systems
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-16 max-w-4xl mx-auto leading-relaxed">
            Your AI works perfectly in testing, then fails in production. Different team members get different results. 
            Your customers experience unpredictable outputs. Sound familiar?
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-8 bg-red-50 rounded-2xl border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-red-600 text-2xl">⚠️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Inconsistent Results</h3>
              <p className="text-gray-600">Same prompt, different outputs. Your AI behaves unpredictably across environments and users.</p>
            </div>
            
            <div className="p-8 bg-orange-50 rounded-2xl border border-orange-100">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-orange-600 text-2xl">💸</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Wasted Resources</h3>
              <p className="text-gray-600">Teams spend weeks iterating on prompts without systematic testing or optimization.</p>
            </div>
            
            <div className="p-8 bg-yellow-50 rounded-2xl border border-yellow-100">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-yellow-600 text-2xl">🔥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Production Failures</h3>
              <p className="text-gray-600">Context that worked yesterday breaks today. No version control, no rollback strategy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section - Full Screen */}
      <section className="min-h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-20">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-8">
            Engineer Context
            <span className="block font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Like Production Code
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-16 max-w-4xl mx-auto leading-relaxed">
            Stop treating AI context as an afterthought. Build systematic, testable, and reliable context architecture 
            that scales with your business and delivers consistent results every time.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group border border-blue-100">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Context Architecture & Design
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Design context like you design APIs. Structured, documented, and optimized for your specific use cases.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group border border-green-100">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Multi-Model Context Testing
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Test your context across different models, compare outputs, and validate behavior before production.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group border border-purple-100">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <GitBranch className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Context Performance Analytics
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor context performance, track success rates, and optimize for cost and reliability.
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group relative border border-orange-100">
              <Badge className="absolute top-4 right-4 bg-orange-100 text-orange-800 text-xs">
                Coming Soon
              </Badge>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Code className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Production Context API
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Deploy and manage context through APIs. Version control, rollbacks, and A/B testing built-in.
              </p>
            </div>
          </div>

          <div className="mt-16">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            >
              Start Engineering Context
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof Section - Full Screen */}
      <section className="min-h-screen w-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-8">
            Engineers Building
            <span className="block font-medium bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Production AI Systems
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-16 max-w-4xl mx-auto leading-relaxed">
            Join teams who've moved beyond hoping their AI works to engineering context that delivers 
            consistent, reliable results in production environments.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic text-lg">
                "Context engineering has revolutionized our AI reliability. We went from 60% consistency to 98% across all our models."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-semibold">SH</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sarah Chen</div>
                  <div className="text-sm text-gray-500">Principal AI Engineer, TechCorp</div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic text-lg">
                "Finally, a systematic approach to context. Our team reduced AI debugging time by 75% and deployment confidence is through the roof."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-semibold">MR</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Marcus Rodriguez</div>
                  <div className="text-sm text-gray-500">Engineering Lead, DataFlow</div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-6 italic text-lg">
                "Context engineering changed everything. We now treat AI context like production infrastructure - versioned, tested, monitored."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-purple-600 font-semibold">AL</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Alex Liu</div>
                  <div className="text-sm text-gray-500">Senior AI Architect, ScaleAI</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-2xl text-white mb-16">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">98%</div>
                <div className="text-blue-100">Average consistency rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">75%</div>
                <div className="text-blue-100">Reduction in debugging time</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-blue-100">Engineering teams</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">$2M+</div>
                <div className="text-blue-100">Cost savings from optimization</div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
          >
            Start Engineering Context Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Final CTA Section - Full Screen */}
      <section className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-light text-white mb-8 leading-tight">
            Stop Hoping.
            <span className="block font-medium bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              Start Engineering.
            </span>
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join the beta that's transforming how teams build reliable AI systems. 
            Limited spots available for serious engineering teams.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 text-lg"
            >
              Get Beta Access
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={() => navigate('/api-waitlist')}
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg"
            >
              Join API Waitlist
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Free during beta</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Setup in 5 minutes</span>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img 
                src="/lovable-uploads/72b4715a-9e0a-45a6-9593-90b2719057bb.png" 
                alt="Cascade Context Studio" 
                className="h-6 w-auto"
              />
              <span className="text-lg font-semibold text-white">Cascade Context Studio</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                Beta
              </Badge>
            </div>
            <div className="text-sm text-gray-400">
              <a 
                href="https://cascadeaipartners.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors"
              >
                © 2025 Cascade AI Partners. All rights reserved.
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
