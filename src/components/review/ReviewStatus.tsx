
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const ReviewStatus = () => {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-green-800">
            Review completed! Thank you for your feedback.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewStatus;
