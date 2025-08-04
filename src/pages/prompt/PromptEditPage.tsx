import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PromptEditor from '@/components/PromptEditor';

interface PromptOutletContext {
  prompt: any;
  isOwner: boolean;
  isReviewerMode: boolean;
  invitationId?: string;
  invitationToken?: string;
}

const PromptEditPage = () => {
  const { prompt, isOwner, isReviewerMode } = useOutletContext<PromptOutletContext>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(prompt.title);
  const [content, setContent] = useState(prompt.content);
  const [status, setStatus] = useState(prompt.status);

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
      queryClient.invalidateQueries({ queryKey: ['prompt', prompt.id] });
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

  return (
    <div className="h-[calc(100vh-200px)]">
      <PromptEditor
        title={title}
        content={content}
        status={status}
        promptId={prompt.id}
        onTitleChange={setTitle}
        onContentChange={setContent}
        onSave={handleSave}
        isSaving={updatePromptMutation.isPending}
        onCancel={() => window.history.back()}
        readOnly={!isOwner}
      />
    </div>
  );
};

export default PromptEditPage;