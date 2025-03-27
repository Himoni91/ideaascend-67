
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UsePitchStorageReturn {
  uploadMedia: (file: File, userId: string) => Promise<string | null>;
  deleteMedia: (url: string) => Promise<boolean>;
  isInitializing: boolean;
  isUploading: boolean;
}

export function usePitchStorage(): UsePitchStorageReturn {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Initialize the storage bucket if it doesn't exist
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // Check if bucket exists
        const { data: bucketExists } = await supabase.storage.getBucket('pitch-media');
        
        if (!bucketExists) {
          // Create the bucket
          await supabase.storage.createBucket('pitch-media', {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
            fileSizeLimit: 5 * 1024 * 1024 // 5MB
          });
          
          console.log('Created pitch-media storage bucket');
        }
      } catch (error) {
        console.error('Error initializing storage:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initializeStorage();
  }, []);
  
  // Upload a file to the pitch-media bucket
  const uploadMedia = useCallback(async (file: File, userId: string): Promise<string | null> => {
    if (isInitializing) {
      toast.error('Storage is still initializing. Please try again.');
      return null;
    }
    
    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('pitch-media')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('pitch-media')
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [isInitializing]);
  
  // Delete a file from the pitch-media bucket
  const deleteMedia = useCallback(async (url: string): Promise<boolean> => {
    if (isInitializing) {
      toast.error('Storage is still initializing. Please try again.');
      return false;
    }
    
    try {
      // Extract the path from the URL
      // URL format: https://<project>.supabase.co/storage/v1/object/public/pitch-media/<user-id>/<file-name>
      const urlParts = url.split('/pitch-media/');
      if (urlParts.length < 2) {
        throw new Error('Invalid URL format');
      }
      
      const filePath = urlParts[1];
      
      const { error } = await supabase.storage
        .from('pitch-media')
        .remove([filePath]);
        
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast.error(`Deletion failed: ${error.message || 'Unknown error'}`);
      return false;
    }
  }, [isInitializing]);
  
  return {
    uploadMedia,
    deleteMedia,
    isInitializing,
    isUploading
  };
}
