
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import ProductionPromptSharing from './ProductionPromptSharing';

interface ProductionPromptModalProps {
  prompt: any;
  isOpen: boolean;
  onClose: () => void;
}

const ProductionPromptModal = ({ prompt, isOpen, onClose }: ProductionPromptModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{prompt.title}</DialogTitle>
            <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              In Production
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col gap-6">
          {/* Prompt Content Display */}
          <div className="flex-1 min-h-0">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Final Prompt</h3>
            <div className="bg-gray-50 rounded-lg p-4 h-full overflow-y-auto border">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                {prompt.content}
              </pre>
            </div>
          </div>

          {/* Sharing Section */}
          <div className="flex-shrink-0">
            <ProductionPromptSharing prompt={prompt} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductionPromptModal;
