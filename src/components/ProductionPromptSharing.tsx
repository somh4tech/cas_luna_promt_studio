
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Mail, Twitter, Zap, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductionPromptSharingProps {
  prompt: any;
}

const ProductionPromptSharing = ({ prompt }: ProductionPromptSharingProps) => {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);

  const handleCopyToClipboard = async () => {
    const shareText = `${prompt.title}

${prompt.content}

Created with Cascade Prompt Library - Collaborative prompt management
Visit: https://promptstudio.cascadeaipartners.com/`;

    try {
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard!",
        description: "The prompt has been copied with attribution.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please try selecting and copying the text manually.",
        variant: "destructive",
      });
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out this prompt: ${prompt.title}`);
    const body = encodeURIComponent(`I wanted to share this prompt with you:

${prompt.title}

${prompt.content}

This was created using Cascade Prompt Library - a collaborative prompt management platform.

Try it yourself: https://promptstudio.cascadeaipartners.com/`);

    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleTwitterShare = () => {
    const tweetText = encodeURIComponent(`Just created an awesome prompt: "${prompt.title}"

${prompt.content.substring(0, 100)}${prompt.content.length > 100 ? '...' : ''}

Built with Cascade Prompt Library 🚀
https://promptstudio.cascadeaipartners.com/

#PromptEngineering #AI #Collaboration`);

    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Share This Prompt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={handleCopyToClipboard}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy to Clipboard
            </Button>

            <Button
              onClick={handleEmailShare}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Share via Email
            </Button>

            <Button
              onClick={handleTwitterShare}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Twitter className="h-4 w-4" />
              Share on X/Twitter
            </Button>
          </div>

          {/* API Coming Soon Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">API Access - Coming Soon!</h4>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              Soon you'll be able to call this prompt directly via our API for seamless integration into your applications.
            </p>
            <Button variant="outline" size="sm" disabled className="text-blue-600 border-blue-300">
              Get API Access (Coming Soon)
            </Button>
          </div>

          {/* Attribution */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">
              Created with Cascade Prompt Library - Collaborative prompt management
            </p>
            <Button
              variant="link"
              onClick={() => window.open('https://promptstudio.cascadeaipartners.com/', '_blank')}
              className="text-blue-600 hover:text-blue-800 p-0 h-auto"
            >
              Try it yourself <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionPromptSharing;
