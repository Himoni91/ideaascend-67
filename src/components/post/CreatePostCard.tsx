
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/hooks/use-posts";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Image, X, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import CategorySelector from "./CategorySelector";

export default function CreatePostCard() {
  const { user, profile } = useAuth();
  const { createPost } = usePosts();
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!user || !profile) return null;

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (!isExpanded && e.target.value.length > 0) {
      setIsExpanded(true);
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleCancel = () => {
    setContent("");
    setIsExpanded(false);
    setSelectedCategories([]);
    setMediaPreview(null);
    setMediaFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Check file type (only images for now)
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are supported");
      return;
    }

    setMediaFile(file);
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
  };

  const removeMedia = () => {
    setMediaPreview(null);
    setMediaFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Please enter some content for your post");
      return;
    }

    setIsSubmitting(true);

    try {
      let mediaUrl = null;
      let mediaType = null;

      // Upload media file if exists
      if (mediaFile) {
        const fileExt = mediaFile.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `posts/${user.id}/${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from("media")
          .upload(filePath, mediaFile);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from("media")
          .getPublicUrl(filePath);

        mediaUrl = publicUrl;
        mediaType = mediaFile.type.startsWith("image/") ? "image" : "file";
      }

      await createPost({
        content,
        categoryIds: selectedCategories,
        mediaUrl,
        mediaType,
      });

      // Clear the form
      handleCancel();
    } catch (error: any) {
      toast.error(`Error creating post: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6 overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>
              {profile?.full_name?.[0] || profile?.username?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-grow">
            <Textarea
              placeholder="Share an update, insight or question..."
              className="min-h-[60px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
              value={content}
              onChange={handleContentChange}
              onFocus={handleFocus}
            />
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4"
            >
              <CategorySelector
                selectedCategories={selectedCategories}
                onChange={setSelectedCategories}
              />

              {mediaPreview && (
                <div className="relative mt-3">
                  <div className="rounded-lg overflow-hidden border bg-muted/20 relative">
                    <img
                      src={mediaPreview}
                      alt="Upload preview"
                      className="max-h-[300px] w-full object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 rounded-full"
                      onClick={removeMedia}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className={`border-t px-6 py-3 ${isExpanded ? "justify-between" : "justify-end"}`}>
        {isExpanded ? (
          <>
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
              >
                <Image className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={true} // Disabled for now
              >
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full px-4"
            onClick={handleFocus}
          >
            Create Post
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
