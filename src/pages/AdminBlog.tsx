import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { BlogPostDialog } from '@/components/admin/BlogPostDialog';

type BlogPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author_name: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  tags: string[];
};

type FullBlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_name: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  tags: string[];
  seo_title: string;
  seo_description: string;
  featured_image: string;
};

const AdminBlog = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState<FullBlogPost | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, author_name, published, published_at, created_at, tags')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogPosts(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching blog posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const filteredPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBlogPosts(prev => prev.filter(post => post.id !== id));
      toast({
        title: "Blog post deleted",
        description: "The blog post has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting blog post",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (post: BlogPostSummary) => {
    // Fetch full post data for editing
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', post.id)
        .single();

      if (error) throw error;
      setSelectedPost(data);
      setDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "Error loading blog post",
        description: error.message,
        variant: "destructive",
      });
    }
  };


  const handleCreate = () => {
    setSelectedPost(null);
    setDialogOpen(true);
  };

  const handlePostSaved = () => {
    fetchBlogPosts();
    setDialogOpen(false);
    setSelectedPost(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading blog posts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Blog Management</h1>
          <p className="text-muted-foreground">Create and manage your blog posts</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search blog posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-40">
              <div className="text-center">
                <p className="text-muted-foreground">No blog posts found</p>
                {blogPosts.length === 0 && (
                  <Button onClick={handleCreate} className="mt-4">
                    Create your first blog post
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {post.title}
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {post.excerpt}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>By {post.author_name}</span>
                    <span>
                      {post.published && post.published_at
                        ? `Published ${format(new Date(post.published_at), 'MMM d, yyyy')}`
                        : `Created ${format(new Date(post.created_at), 'MMM d, yyyy')}`
                      }
                    </span>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{post.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <BlogPostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        post={selectedPost}
        onPostSaved={handlePostSaved}
      />
    </div>
  );
};

export default AdminBlog;