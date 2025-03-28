
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useProfileBanner() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const uploadProfileBanner = async (file: File): Promise<string | null> => {
    if (!user) {
      toast.error("You must be logged in to upload a banner image");
      return null;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit for banner images
      toast.error("Banner image size should be less than 10MB");
      return null;
    }
    
    try {
      setIsUploading(true);
      setProgress(0);
      
      // Create a unique file path for the banner
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/banner_${Date.now()}.${fileExt}`;
      
      // Upload the file
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
        
      // Update the profile with the new banner URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_header_url: publicUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      toast.success("Banner image updated successfully");
      return publicUrl;
    } catch (error: any) {
      toast.error(`Error uploading banner: ${error.message}`);
      console.error("Error uploading profile banner:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  const deleteProfileBanner = async (): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to delete your banner image");
      return false;
    }
    
    try {
      setIsUploading(true);
      
      // Get the current profile to find the banner URL
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('profile_header_url')
        .eq('id', user.id)
        .single();
        
      if (profileError) throw profileError;
      
      if (!profile.profile_header_url) {
        toast.error("No banner image to delete");
        return false;
      }
      
      // Extract the file path from the URL
      const url = new URL(profile.profile_header_url);
      const fullPath = url.pathname.split('/').slice(2).join('/');
      
      // Delete the file from storage
      const { error: deleteError } = await supabase.storage
        .from('profile_images')
        .remove([fullPath]);
        
      if (deleteError) throw deleteError;
      
      // Update the profile to remove the banner URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_header_url: null })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      toast.success("Banner image deleted successfully");
      return true;
    } catch (error: any) {
      toast.error(`Error deleting banner: ${error.message}`);
      console.error("Error deleting profile banner:", error);
      return false;
    } finally {
      setIsUploading(false);
    }
  };
  
  return { 
    uploadProfileBanner, 
    deleteProfileBanner, 
    isUploading, 
    progress 
  };
}
