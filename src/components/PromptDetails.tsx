
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PromptDetailsProps {
  title: string;
  content: string;
  status: string;
  projectName: string;
}

const PromptDetails = ({ title, content, status, projectName }: PromptDetailsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'in_production': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          <Badge className={getStatusColor(status)}>
            {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        </div>
        <p className="text-sm text-gray-600">
          From project: <strong>{projectName}</strong>
        </p>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-4 rounded-md">
          <pre className="whitespace-pre-wrap text-sm">{content}</pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptDetails;
