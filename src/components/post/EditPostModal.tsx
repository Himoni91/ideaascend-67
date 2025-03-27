
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/hooks/use-categories";
import { Post } from "@/types/post";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CategorySelector from "@/components/post/CategorySelector";
import MediaPreview from "@/components/post/MediaPreview";

interface EditPostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated?: (updatedPost: Post) => void;
}

export default function EditPostModal({ 
  post, 
  isOpen, 
  onClose,
  onPostUpdated 
}: EditPostModalProps) {
  const { user } = useAuth();
  const { categories } = useCategories();
  
  const [content, setContent] = useState(post.content);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    post.categories?.map(cat => cat.id) || []
  );
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(post.media_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setContent(post.content);
      setSelectedCategoryIds(post.categories?.map(cat => cat.id) || []);
      setMediaPreview(post.media_url || null);
    }
  }, [isOpen, post]);
  
  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to update a post");
      return;
    }
    
    if (content.trim().length === 0) {
      toast.error("Post content cannot be empty");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let mediaUrl = post.media_url;
      let mediaType = post.media_type;
      
      // Handle new media upload
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(filePath, mediaFile);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('post-media')
          .getPublicUrl(filePath);
        
        mediaUrl = publicUrl;
        mediaType = mediaFile.type;
      }
      
      // Update the post
      const { data: updatedPost, error } = await supabase
        .from('posts')
        .update({
          content,
          media_url: mediaUrl,
          media_type: mediaType,
        })
        .eq('id', post.id)
        .eq('user_id', user.id)
        .select(`
          *,
          author:user_id(
            id, username, full_name, avatar_url, is_verified, position, byline
          ),
          categories:post_categories(
            id,
            category:category_id(id, name, icon, color)
          )
        `)
        .single();
      
      if (error) throw error;
      
      // Handle categories updates
      if (selectedCategoryIds.length > 0) {
        // Delete existing categories first
        await supabase
          .from('post_categories')
          .delete()
          .eq('post_id', post.id);
        
        // Insert new categories
        const categoryInserts = selectedCategoryIds.map(categoryId => ({
          post_id: post.id,
          category_id: categoryId
        }));
        
        await supabase
          .from('post_categories')
          .insert(categoryInserts);
      }
      
      toast.success("Post updated successfully");
      if (onPostUpdated && updatedPost) {
        // Flatten the post categories data
        const formattedPost = {
          ...updatedPost,
          categories: updatedPost.categories?.map(c => c.category) || []
        };
        onPostUpdated(formattedPost as Post);
      }
      
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileChange = (file: File | null) => {
    setMediaFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setMediaPreview(post.media_url);
    }
  };
  
  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Textarea
            placeholder="Update your post..."
            className="min-h-[120px] resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          {mediaPreview && (
            <div className="relative rounded-md overflow-hidden">
              <MediaPreview 
                file={mediaFile || new File([], "placeholder", { type: post.media_type || "" })} 
                preview={mediaPreview} 
                onRemove={handleRemoveMedia}
              />
            </div>
          )}
          
          <CategorySelector
            selectedCategoryIds={selectedCategoryIds}
            onChange={setSelectedCategoryIds}
            categories={categories}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || content.trim().length === 0}
          >
            {isSubmitting ? "Updating..." : "Update Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
