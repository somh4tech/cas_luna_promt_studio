
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Star, ChevronDown } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Add Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Manrope:wght@200;300;400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Add overflow hidden to body for fullscreen experience
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="relative min-h-screen w-screen overflow-hidden bg-black">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          src="https://res.cloudinary.com/anubhav1602/video/upload/v1/video"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          autoPlay
          muted
          loop
          playsInline
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60" />
      </div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-8 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-white/80" />
        </div>
        <div className="hidden md:flex items-center space-x-8 font-manrope text-white/80 text-sm">
          <button className="hover:text-white transition-colors">Origins</button>
          <button className="hover:text-white transition-colors">Records</button>
          <button className="hover:text-white transition-colors">Community</button>
        </div>
        <div className="flex items-center space-x-2 font-manrope text-white/80 text-sm">
          <span>EN</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-center min-h-screen">
        <div className="max-w-2xl px-8 pt-32">
          <h1 className="font-libre-caslon text-6xl font-light tracking-tight leading-[1.1] text-white mb-4">
            Prompt Library
          </h1>
          <p className="font-manrope text-base font-normal text-white/80 mb-6 max-w-lg">
            Your own personal prompt library. Test and collaborate on prompts with your team in a beautiful, organized workspace.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-black px-6 py-3 rounded-lg font-manrope text-sm font-medium hover:bg-gray-100 transition-all duration-200 transform hover:scale-105"
          >
            Start Your Prompt Journey →
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 rotate-90">
        <p className="font-manrope text-xs tracking-widest uppercase text-white/60">
          FIELD ENTRY CHAPTER ONE
        </p>
      </div>

      {/* Footer Elements */}
      <div className="absolute bottom-6 left-8">
        <p className="font-manrope text-xs text-white/50">
          ✦ Founded in Stillness, 2025
        </p>
      </div>

      <div className="absolute bottom-6 right-8">
        <p className="font-manrope text-xs text-white/60">
          © Luna
        </p>
      </div>

      {/* Top Navigation Links */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 hidden md:flex items-center space-x-6">
        <button 
          onClick={handleGetStarted}
          className="font-manrope text-sm text-white/80 hover:text-white transition-colors"
        >
          Start
        </button>
        <button className="font-manrope text-sm text-white/80 hover:text-white transition-colors">
          Pricing
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
