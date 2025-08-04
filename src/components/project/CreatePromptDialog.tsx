
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CreatePromptDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, content: string) => void;
  isCreating: boolean;
}

const CreatePromptDialog = ({ 
  isOpen, 
  onOpenChange, 
  onSubmit, 
  isCreating 
}: CreatePromptDialogProps) => {
  const [promptTitle, setPromptTitle] = useState('');
  const [promptContent, setPromptContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(promptTitle, promptContent);
    setPromptTitle('');
    setPromptContent('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Prompt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt-title">Title</Label>
            <Input
              id="prompt-title"
              placeholder="Enter prompt title"
              value={promptTitle}
              onChange={(e) => setPromptTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prompt-content">Prompt Content</Label>
            <Textarea
              id="prompt-content"
              placeholder="Enter your prompt"
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              rows={6}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Prompt'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePromptDialog;
