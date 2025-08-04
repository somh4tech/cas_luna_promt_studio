
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Clock, RotateCcw, Eye, User, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VersionComparison from './VersionComparison';

interface VersionHistoryProps {
  prompt: any;
  onUpdate: () => void;
}

interface VersionWithProfile {
  id: string;
  prompt_id: string;
  version_number: number;
  title: string;
  content: string;
  status: string;
  created_by: string;
  created_at: string;
  change_summary: string | null;
  is_current: boolean;
  profiles: {
    full_name: string | null;
  } | null;
}

const VersionHistory = ({ prompt, onUpdate }: VersionHistoryProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVersion, setSelectedVersion] = useState<VersionWithProfile | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [compareVersions, setCompareVersions] = useState<{
    version1: VersionWithProfile;
    version2: VersionWithProfile;
  } | null>(null);

  const { data: versions, isLoading } = useQuery({
    queryKey: ['prompt-versions', prompt.id],
    queryFn: async (): Promise<VersionWithProfile[]> => {
      const { data, error } = await supabase
        .from('prompt_versions')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('prompt_id', prompt.id)
        .order('version_number', { ascending: false });
      
      if (error) throw error;
      return data as VersionWithProfile[];
    },
  });

  const restoreVersionMutation = useMutation({
    mutationFn: async (version: VersionWithProfile) => {
      const { error } = await supabase
        .from('prompts')
        .update({
          title: version.title,
          content: version.content,
          status: version.status,
          version: prompt.version + 1,
        })
        .eq('id', prompt.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt-versions', prompt.id] });
      onUpdate();
      toast({
        title: "Version restored",
        description: "The prompt has been restored to the selected version.",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'in_production': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  const handleCompareVersions = (version1: VersionWithProfile, version2: VersionWithProfile) => {
    setCompareVersions({ version1, version2 });
    setIsComparisonOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-500">Loading version history...</div>
      </div>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No version history</h3>
        <p className="text-gray-600">Version history will appear here after you make changes to the prompt.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Version History</h3>
          <Badge variant="outline">{versions.length} versions</Badge>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-3">
            {versions.map((version, index) => (
              <Card key={version.id} className={`${version.is_current ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${version.is_current ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        <span className="font-medium">Version {version.version_number}</span>
                        {version.is_current && <Badge variant="secondary" className="text-xs">Current</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedVersion(version)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {index < versions.length - 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompareVersions(version, versions[index + 1])}
                        >
                          Compare
                        </Button>
                      )}
                      {!version.is_current && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreVersionMutation.mutate(version)}
                          disabled={restoreVersionMutation.isPending}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{version.profiles?.full_name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(version.created_at)}</span>
                      </div>
                      <Badge className={getStatusColor(version.status)}>
                        {version.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                    {version.change_summary && (
                      <p className="text-sm text-gray-700 italic">{version.change_summary}</p>
                    )}
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 truncate">{version.title}</p>
                      <p className="text-gray-600 line-clamp-2 mt-1">{version.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Version Detail Modal */}
      <Dialog open={!!selectedVersion} onOpenChange={() => setSelectedVersion(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedVersion(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span>Version {selectedVersion?.version_number} Details</span>
            </DialogTitle>
          </DialogHeader>
          {selectedVersion && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge className={getStatusColor(selectedVersion.status)}>
                    {selectedVersion.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    by {selectedVersion.profiles?.full_name || 'Unknown'} on {formatDate(selectedVersion.created_at)}
                  </span>
                </div>
                {!selectedVersion.is_current && (
                  <Button
                    onClick={() => restoreVersionMutation.mutate(selectedVersion)}
                    disabled={restoreVersionMutation.isPending}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Restore This Version
                  </Button>
                )}
              </div>
              <Separator />
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Title</h4>
                  <p className="text-gray-700">{selectedVersion.title}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Content</h4>
                  <ScrollArea className="h-64 border rounded-md p-3">
                    <pre className="whitespace-pre-wrap text-sm">{selectedVersion.content}</pre>
                  </ScrollArea>
                </div>
                {selectedVersion.change_summary && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Change Summary</h4>
                    <p className="text-gray-700 italic">{selectedVersion.change_summary}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Version Comparison Modal */}
      {compareVersions && (
        <VersionComparison
          isOpen={isComparisonOpen}
          onClose={() => {
            setIsComparisonOpen(false);
            setCompareVersions(null);
          }}
          version1={compareVersions.version1}
          version2={compareVersions.version2}
        />
      )}
    </>
  );
};

export default VersionHistory;
