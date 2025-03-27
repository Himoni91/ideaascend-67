import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_MEDIA_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

interface UploadOptions {
  bucketName?: string;
  folderPath?: string;
  maxFileSize?: number;
  acceptedTypes?: string[];
}

interface UploadResult {
  url: string;
  type: string;
  path: string;
}

export function usePitchMedia() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File, options?: UploadOptions) => {
    const maxSize = options?.maxFileSize || MAX_FILE_SIZE;
    const acceptedTypes = options?.acceptedTypes || ACCEPTED_MEDIA_TYPES;

    if (file.size > maxSize) {
      return `File size should be less than ${Math.floor(maxSize / (1024 * 1024))}MB`;
    }

    if (!acceptedTypes.includes(file.type)) {
      return `Only ${acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} formats are supported`;
    }

    return null;
  };

  const uploadMedia = async (file: File, options?: UploadOptions): Promise<UploadResult | null> => {
    if (!user) {
      setError("You must be logged in to upload files");
      return null;
    }

    // Validate the file
    const validationError = validateFile(file, options);
    if (validationError) {
      setError(validationError);
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const bucketName = options?.bucketName || 'pitch-media';
      const folderPath = options?.folderPath || user.id;
      
      // Ensure the bucket exists
      const { data: bucketExists } = await supabase.storage.getBucket(bucketName);
      
      if (!bucketExists) {
        await supabase.storage.createBucket(bucketName, {
          public: true
        });
      }
      
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${folderPath}/${fileName}`;
      
      // Upload the file - Use a workaround for the onUploadProgress
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      setUploadProgress(100); // Manually set to 100% since we can't track progress
      
      return {
        url: publicUrl,
        type: file.type,
        path: filePath
      };
    } catch (err: any) {
      setError(err.message || "An error occurred during upload");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteMedia = async (path: string, bucketName: string = 'pitch-media') => {
    if (!user) {
      setError("You must be logged in to delete files");
      return false;
    }

    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([path]);
      
      if (error) throw error;
      return true;
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting the file");
      return false;
    }
  };

  return {
    uploadMedia,
    deleteMedia,
    isUploading,
    uploadProgress,
    error,
    clearError: () => setError(null),
  };
}
