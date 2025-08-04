import { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { sendEditNotification, getActiveReviewers } from '@/utils/emailService';
import PromptEditorHeader from './prompt-editor/PromptEditorHeader';
import PromptEditorToolbar from './prompt-editor/PromptEditorToolbar';
import PromptContentPanel from './prompt-editor/PromptContentPanel';
import PromptAnalysisPanel from './prompt-editor/PromptAnalysisPanel';
import PromptEditorActions from './prompt-editor/PromptEditorActions';

interface PromptEditorProps {
  title: string;
  content: string;
  status: string;
  promptId: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onSave: () => void;
  isSaving?: boolean;
  onCancel: () => void;
  readOnly?: boolean;
}

const PromptEditor = ({
  title,
  content,
  status,
  promptId,
  onTitleChange,
  onContentChange,
  onSave,
  isSaving,
  onCancel,
  readOnly = false
}: PromptEditorProps) => {
  const { user } = useAuth();
  const [isPreviewMode, setIsPreviewMode] = useState(readOnly);
  const [searchTerm, setSearchTerm] = useState('');
  const [originalTitle] = useState(title);
  const [originalContent] = useState(content);

  const handleSave = async () => {
    if (readOnly) return;
    
    // Call the original save function
    onSave();

    // Send email notifications if content changed
    try {
      const titleChanged = originalTitle !== title;
      const contentChanged = originalContent !== content;
      
      if (titleChanged || contentChanged) {
        const activeReviewers = await getActiveReviewers(promptId, user?.id);
        const editorName = user?.email || 'Anonymous';
        
        let changeType = '';
        if (titleChanged && contentChanged) {
          changeType = 'Title and content updated';
        } else if (titleChanged) {
          changeType = 'Title updated';
        } else if (contentChanged) {
          changeType = 'Content updated';
        }

        for (const reviewer of activeReviewers) {
          const reviewerEmail = reviewer.profiles?.email || reviewer.reviewer_email;
          if (reviewerEmail) {
            await sendEditNotification({
              to: reviewerEmail,
              promptTitle: title,
              editorName,
              changeType,
              promptId,
            });
          }
        }

        if (activeReviewers.length > 0) {
          console.log(`Edit notifications sent to ${activeReviewers.length} reviewers`);
        }
      }
    } catch (error) {
      console.error('Failed to send edit notifications:', error);
      // Don't show error to user as the save was still successful
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return;
    
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          handleSave();
          break;
        case 'f':
          e.preventDefault();
          // Focus search input if it exists
          break;
      }
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4" onKeyDown={handleKeyDown}>
      <PromptEditorHeader
        title={title}
        status={status}
        isPreviewMode={isPreviewMode}
        onTitleChange={readOnly ? () => {} : onTitleChange}
        onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
        readOnly={readOnly}
      />

      <PromptEditorToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        content={content}
      />

      <div className="flex-1 min-h-0" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <ResizablePanelGroup direction="horizontal" className="h-full border rounded-lg">
          <ResizablePanel defaultSize={isPreviewMode ? 50 : 100} minSize={30}>
            <PromptContentPanel
              content={content}
              isPreviewMode={isPreviewMode || readOnly}
              searchTerm={searchTerm}
              onContentChange={readOnly ? () => {} : onContentChange}
              readOnly={readOnly}
            />
          </ResizablePanel>

          {isPreviewMode && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50} minSize={30}>
                <PromptAnalysisPanel content={content} searchTerm={searchTerm} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {!readOnly && (
        <PromptEditorActions
          onSave={handleSave}
          onCancel={onCancel}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};

export default PromptEditor;
