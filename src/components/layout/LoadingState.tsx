
import { Clock } from 'lucide-react';

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p>Loading review...</p>
      </div>
    </div>
  );
};

export default LoadingState;
