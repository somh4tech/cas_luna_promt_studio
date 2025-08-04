
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, CheckCircle, ArrowLeft, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PromptModalHeaderProps {
  title: string;
  status: string;
  onRequestReview: () => void;
  onStatusChange: (newStatus: string) => void;
}

const PromptModalHeader = ({ title, status, onRequestReview, onStatusChange }: PromptModalHeaderProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'in_production': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusActions = () => {
    switch (status) {
      case 'in_progress':
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange('in_production')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Complete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestReview}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Request Review
            </Button>
          </div>
        );
      
      case 'in_review':
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange('in_progress')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to In Progress
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange('in_production')}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Move to Production
            </Button>
          </div>
        );
      
      case 'in_production':
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onStatusChange('in_progress')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange('in_review')}>
                <UserPlus className="h-4 w-4 mr-2" />
                Send for Review
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="flex items-center space-x-2">
        {getStatusActions()}
        <Badge className={getStatusColor(status)}>
          {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </Badge>
      </div>
    </div>
  );
};

export default PromptModalHeader;
