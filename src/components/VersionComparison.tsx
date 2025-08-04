
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Clock, User } from 'lucide-react';

interface Version {
  id: string;
  version_number: number;
  title: string;
  content: string;
  status: string;
  created_at: string;
  change_summary: string | null;
  profiles: {
    full_name: string | null;
  } | null;
}

interface VersionComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  version1: Version;
  version2: Version;
}

const VersionComparison = ({ isOpen, onClose, version1, version2 }: VersionComparisonProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'in_production': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Simple diff highlighting function
  const highlightDifferences = (text1: string, text2: string) => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLines = Math.max(lines1.length, lines2.length);
    
    const result1: string[] = [];
    const result2: string[] = [];
    
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';
      
      if (line1 !== line2) {
        result1.push(line1);
        result2.push(line2);
      } else {
        result1.push(line1);
        result2.push(line2);
      }
    }
    
    return { left: result1.join('\n'), right: result2.join('\n') };
  };

  const titleDiff = version1.title !== version2.title;
  const contentDiff = highlightDifferences(version1.content, version2.content);
  const statusDiff = version1.status !== version2.status;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Compare Version {version2.version_number} → Version {version1.version_number}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Version 2 (Older) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Version {version2.version_number}</h3>
              <Badge variant="outline">Older</Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <User className="h-3 w-3" />
                <span>{version2.profiles?.full_name || 'Unknown'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3" />
                <span>{formatDate(version2.created_at)}</span>
              </div>
              <Badge className={getStatusColor(version2.status)}>
                {version2.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  Title
                  {titleDiff && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full" />}
                </h4>
                <div className={`p-2 rounded border ${titleDiff ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                  <p className="text-sm">{version2.title}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  Content
                  <span className="ml-2 w-2 h-2 bg-red-500 rounded-full" />
                </h4>
                <ScrollArea className="h-64 border rounded-md">
                  <div className="p-3 bg-red-50 border-red-200">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {contentDiff.right}
                    </pre>
                  </div>
                </ScrollArea>
              </div>
              
              {version2.change_summary && (
                <div>
                  <h4 className="font-medium mb-2">Change Summary</h4>
                  <p className="text-sm text-gray-600 italic">{version2.change_summary}</p>
                </div>
              )}
            </div>
          </div>

          {/* Version 1 (Newer) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Version {version1.version_number}</h3>
              <Badge variant="default">Newer</Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <User className="h-3 w-3" />
                <span>{version1.profiles?.full_name || 'Unknown'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3" />
                <span>{formatDate(version1.created_at)}</span>
              </div>
              <Badge className={getStatusColor(version1.status)}>
                {version1.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  Title
                  {titleDiff && <span className="ml-2 w-2 h-2 bg-green-500 rounded-full" />}
                </h4>
                <div className={`p-2 rounded border ${titleDiff ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                  <p className="text-sm">{version1.title}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  Content
                  <span className="ml-2 w-2 h-2 bg-green-500 rounded-full" />
                </h4>
                <ScrollArea className="h-64 border rounded-md">
                  <div className="p-3 bg-green-50 border-green-200">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {contentDiff.left}
                    </pre>
                  </div>
                </ScrollArea>
              </div>
              
              {version1.change_summary && (
                <div>
                  <h4 className="font-medium mb-2">Change Summary</h4>
                  <p className="text-sm text-gray-600 italic">{version1.change_summary}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VersionComparison;
