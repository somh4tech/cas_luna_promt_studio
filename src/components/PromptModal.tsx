import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MessageSquare, Play, History, UserPlus, Eye, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { useMarkAsReviewed } from '@/hooks/useMarkAsReviewed';
import ReviewInviteModal from './review/ReviewInviteModal';
import PromptEditor from './PromptEditor';
import VersionHistory from './VersionHistory';
import CommentSection from './CommentSection';
import ReviewSection from './review/ReviewSection';
import TestSection from './TestSection';
import PromptModalHeader from './PromptModalHeader';
import PromptAnalysisSection from './analysis/PromptAnalysisSection';

interface PromptModalProps {
  prompt: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  defaultTab?: string;
  isReviewerMode?: boolean;
  invitationId?: string; // For reviewer mode
  invitationToken?: string; // For reviewer mode
}

const PromptModal = ({ 
  prompt, 
  isOpen, 
  onClose, 
  onUpdate, 
  defaultTab = "edit",
  isReviewerMode = false,
  invitationId,
  invitationToken
}: PromptModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const markAsReviewedMutation = useMarkAsReviewed();
  const [title, setTitle] = useState(prompt.title);
  const [content, setContent] = useState(prompt.content);
  const [status, setStatus] = useState(prompt.status);
  const [isReviewInviteOpen, setIsReviewInviteOpen] = useState(false);

  // Check if user is the owner of the prompt
  const isOwner = user?.id === prompt.user_id;

  const updatePromptMutation = useMutation({
    mutationFn: async (updates: any) => {
      const { error } = await supabase
        .from('prompts')
        .update(updates)
        .eq('id', prompt.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Prompt updated",
        description: "Your changes have been saved.",
      });
      onUpdate();
    },
  });

  const handleSave = () => {
    updatePromptMutation.mutate({
      title,
      content,
      status,
      version: prompt.version + 1,
    });
  };

  const handlePromptContentUpdate = (newContent: string) => {
    setContent(newContent);
    updatePromptMutation.mutate({
      title,
      content: newContent,
      status,
      version: prompt.version + 1,
    });
  };

  const handleStatusChange = (newStatus: string) => {
    console.log('handleStatusChange called with:', newStatus);
    setStatus(newStatus);
    updatePromptMutation.mutate({
      status: newStatus,
      version: prompt.version + 1,
    });

    // Show appropriate success message
    const statusMessages = {
      'in_progress': 'Prompt moved back to In Progress',
      'in_review': 'Prompt moved to In Review',
      'in_production': 'Prompt marked as complete and moved to Production'
    };

    toast({
      title: "Status updated",
      description: statusMessages[newStatus as keyof typeof statusMessages] || "Status updated successfully",
    });
  };

  const handleRequestReview = () => {
    console.log('handleRequestReview called - only opening modal, not changing status');
    // Only open the review invite modal - don't change status yet
    setIsReviewInviteOpen(true);
  };

  const handleReviewInviteSent = () => {
    console.log('handleReviewInviteSent called - now changing status to in_review');
    // This is called when an invitation is successfully sent
    handleStatusChange('in_review');
    setIsReviewInviteOpen(false);
  };

  const handleMarkAsReviewed = () => {
    if (invitationId && invitationToken) {
      markAsReviewedMutation.mutate({
        invitationId,
        invitationToken,
      });
      onClose(); // Close modal after marking as reviewed
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl h-[95vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="sr-only">
              {isReviewerMode ? 'Review Prompt' : 'Edit Prompt'}
            </DialogTitle>
            {isOwner && (
              <PromptModalHeader
                title={title}
                status={status}
                onRequestReview={handleRequestReview}
                onStatusChange={handleStatusChange}
              />
            )}
            {isReviewerMode && (
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Review: {title}</h2>
                <Button
                  onClick={handleMarkAsReviewed}
                  disabled={markAsReviewedMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {markAsReviewedMutation.isPending ? 'Marking...' : 'Mark as Reviewed'}
                </Button>
              </div>
            )}
          </DialogHeader>

          <div className="flex-1 min-h-0">
            <Tabs defaultValue={isReviewerMode ? "reviews" : defaultTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-6 flex-shrink-0">
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {isOwner ? 'Edit' : 'View Prompt'}
                </TabsTrigger>
                <TabsTrigger value="analyze" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Analyze
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="test" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Test
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 min-h-0">
                <TabsContent value="edit" className="h-full mt-4">
                  <PromptEditor
                    title={title}
                    content={content}
                    status={status}
                    promptId={prompt.id}
                    onTitleChange={setTitle}
                    onContentChange={setContent}
                    onSave={handleSave}
                    isSaving={updatePromptMutation.isPending}
                    onCancel={onClose}
                    readOnly={!isOwner}
                  />
                </TabsContent>

                <TabsContent value="analyze" className="h-full overflow-y-auto mt-4">
                  <PromptAnalysisSection
                    promptContent={content}
                    promptTitle={title}
                    promptId={prompt.id}
                    isOpen={isOpen}
                    onPromptUpdate={isOwner ? handlePromptContentUpdate : undefined}
                  />
                </TabsContent>

                <TabsContent value="comments" className="h-full overflow-y-auto mt-4">
                  <CommentSection 
                    promptId={prompt.id} 
                    promptTitle={title}
                    isOpen={isOpen} 
                  />
                </TabsContent>

                <TabsContent value="reviews" className="h-full overflow-y-auto mt-4">
                  <ReviewSection
                    promptId={prompt.id}
                    isOpen={isOpen}
                    onRequestReview={handleRequestReview}
                    isReviewerMode={isReviewerMode}
                  />
                </TabsContent>

                <TabsContent value="test" className="h-full overflow-y-auto mt-4">
                  <TestSection 
                    promptId={prompt.id} 
                    isOpen={isOpen}
                    promptContent={content}
                    promptTitle={title}
                    promptVersion={prompt.version}
                  />
                </TabsContent>

                <TabsContent value="history" className="h-full overflow-y-auto mt-4">
                  <VersionHistory 
                    prompt={prompt} 
                    onUpdate={() => {
                      queryClient.invalidateQueries({ queryKey: ['prompts'] });
                      onUpdate();
                    }}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {isOwner && (
        <ReviewInviteModal
          prompt={{ ...prompt, status }}
          isOpen={isReviewInviteOpen}
          onClose={() => setIsReviewInviteOpen(false)}
          onInvitationSent={handleReviewInviteSent}
        />
      )}
    </>
  );
};

export default PromptModal;
