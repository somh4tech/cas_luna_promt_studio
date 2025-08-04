import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const BlogNavigation = () => {
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
        >
          <img 
            src="/lovable-uploads/72b4715a-9e0a-45a6-9593-90b2719057bb.png" 
            alt="Cascade Prompt Studio" 
            className="h-8 w-auto"
          />
          <span className="text-xl font-semibold text-gray-900">Cascade Prompt Studio</span>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
            Beta
          </Badge>
        </button>
      </div>
      <div className="flex items-center space-x-6">
        <button 
          onClick={() => navigate('/')}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          Home
        </button>
        <button 
          onClick={() => navigate('/blog')}
          className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
        >
          Blog
        </button>
        <button 
          onClick={() => navigate('/pricing')}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          Pricing
        </button>
        <button 
          onClick={() => navigate('/auth')}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          Sign In
        </button>
        <Button onClick={() => navigate('/auth')} variant="default">
          Get Started Free
        </Button>
      </div>
    </nav>
  );
};

export default BlogNavigation;