
import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/hooks/use-categories";
import { usePosts } from "@/hooks/use-posts";
import { useNavigate } from "react-router-dom";
import { Camera, FileImage, BarChart2, X } from "lucide-react";
import CategorySelector from "./CategorySelector";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CreatePoll from "./CreatePoll";

export default function CreatePostCard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { categories } = useCategories();
  const { createPost } = usePosts();
  
  const handleCreatePost = async () => {
    if (!content.trim() && !selectedFile) return;
    
    setIsSubmitting(true);
    
    try {
      let mediaUrl = null;
      let mediaType = null;
      
      // Upload file if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${user!.id}/${Date.now()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from("posts")
          .upload(filePath, selectedFile);
          
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from("posts")
          .getPublicUrl(filePath);
          
        mediaUrl = publicUrl;
        mediaType = selectedFile.type;
      }
      
      await createPost({
        content,
        categoryIds: selectedCategoryIds,
        mediaUrl,
        mediaType
      });
      
      // Clear form
      setContent("");
      setSelectedCategoryIds([]);
      setSelectedFile(null);
      setImagePreview(null);
    } catch (error: any) {
      toast.error(`Error creating post: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSelectImage = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error("Only image files are supported");
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleClearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleCreatePoll = (pollData: {
    question: string;
    options: string[];
    isMultipleChoice: boolean;
    expiresIn: number | null;
  }) => {
    // Add poll question to post content
    setContent((prevContent) => {
      const pollText = `Poll: ${pollData.question}\n\nOptions:\n${pollData.options.map((option, i) => `${i+1}. ${option}`).join('\n')}`;
      
      return prevContent.trim() 
        ? `${prevContent}\n\n${pollText}` 
        : pollText;
    });
    
    // Store poll data to submit later
    setPollData(pollData);
    setIsCreatingPoll(false);
  };
  
  const [pollData, setPollData] = useState<{
    question: string;
    options: string[];
    isMultipleChoice: boolean;
    expiresIn: number | null;
  } | null>(null);
  
  if (!user) {
    return (
      <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-4">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/auth/sign-in")}
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
            <div className="flex-1 py-2.5 px-3 bg-muted rounded-full text-muted-foreground">
              Sign in to share what's on your mind...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback>
              {profile?.full_name?.[0] || profile?.username?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div 
              contentEditable={true}
              role="textbox"
              className="min-h-[80px] w-full p-2.5 focus:outline-none rounded-md border border-input bg-background hover:bg-accent/10 placeholder:text-muted-foreground resize-none"
              placeholder="Share what's on your mind..."
              onInput={(e) => setContent(e.currentTarget.textContent || "")}
              data-gramm="false"
              data-gramm_editor="false"
              data-enable-grammarly="false"
            >
            </div>
            
            {/* Image preview */}
            <AnimatePresence>
              {imagePreview && (
                <motion.div 
                  className="relative mt-3 rounded-md overflow-hidden border"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-[200px] w-full object-contain"
                  />
                  <Button
                    className="absolute top-2 right-2 rounded-full h-8 w-8 p-0"
                    size="icon"
                    variant="destructive"
                    onClick={handleClearImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Category selector */}
            <div className="mt-4">
              <CategorySelector
                categories={categories}
                selectedCategoryIds={selectedCategoryIds}
                onChange={setSelectedCategoryIds}
              />
            </div>
            
            {/* Poll creation form */}
            <AnimatePresence>
              {isCreatingPoll && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <CreatePoll 
                    onCreatePoll={handleCreatePoll}
                    onCancel={() => setIsCreatingPoll(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-full h-9 px-3"
                  onClick={handleSelectImage}
                >
                  <FileImage className="h-4 w-4 mr-2" />
                  Image
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="rounded-full h-9 px-3"
                  onClick={() => setIsCreatingPoll(true)}
                  disabled={isCreatingPoll}
                >
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Poll
                </Button>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              
              <Button
                onClick={handleCreatePost}
                disabled={(!content.trim() && !selectedFile) || isSubmitting}
                className="rounded-full h-9"
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
