
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

const InvalidInvitation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="p-6 text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Invalid Review Link</h2>
          <p className="text-gray-600 mb-4">
            This review invitation may have expired or been removed.
          </p>
          <Button onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvalidInvitation;
