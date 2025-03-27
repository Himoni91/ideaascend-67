
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useProfileImage() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const uploadProfileImage = async (file: File): Promise<string | null> => {
    if (!user) {
      toast.error("You must be logged in to upload an image");
      return null;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return null;
    }
    
    try {
      setIsUploading(true);
      setProgress(0);
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload the file without onUploadProgress (not supported in this version)
      const { data, error } = await supabase.storage
        .from('profile_images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (error) throw error;
      
      // Simulate progress for better UX
      setProgress(100);
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile_images')
        .getPublicUrl(filePath);
        
      // Update the profile with the new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      toast.success("Profile image updated successfully");
      return publicUrl;
    } catch (error: any) {
      toast.error(`Error uploading image: ${error.message}`);
      console.error("Error uploading profile image:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  const deleteProfileImage = async (): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to delete your profile image");
      return false;
    }
    
    try {
      setIsUploading(true);
      
      // Get the current profile to find the avatar URL
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      if (!profile.avatar_url) {
        toast.error("No profile image to delete");
        return false;
      }
      
      // Extract the file path from the URL
      const url = new URL(profile.avatar_url);
      const fullPath = url.pathname.split('/').slice(2).join('/');
      
      // Delete the file from storage
      const { error: deleteError } = await supabase.storage
        .from('profile_images')
        .remove([fullPath]);
        
      if (deleteError) throw deleteError;
      
      // Update the profile to remove the image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      toast.success("Profile image deleted successfully");
      return true;
    } catch (error: any) {
      toast.error(`Error deleting image: ${error.message}`);
      console.error("Error deleting profile image:", error);
      return false;
    } finally {
      setIsUploading(false);
    }
  };
  
  return { 
    uploadProfileImage, 
    deleteProfileImage, 
    isUploading, 
    progress 
  };
}
