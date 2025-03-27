
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Regular expression to match URLs in text
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export interface EnhancedLinkPreview {
  url: string;
  title: string;
  description: string;
  image: string | null;
  domain: string;
  favicon: string | null;
  siteName: string | null;
  mediaType: string;
}

export function useEnhancedLinkPreview(content: string) {
  const [linkPreview, setLinkPreview] = useState<EnhancedLinkPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Reset state when content changes
    setLinkPreview(null);
    setError(null);
    
    const extractUrl = () => {
      if (!content) return null;
      
      // Extract the first URL from the content
      const matches = content.match(URL_REGEX);
      return matches ? matches[0] : null;
    };
    
    const fetchLinkPreview = async (url: string) => {
      setIsLoading(true);
      try {
        // Use the enhanced link preview edge function
        const { data, error } = await supabase.functions.invoke('enhanced-link-preview', {
          body: { url }
        });
        
        if (error) throw new Error(error.message);
        
        if (data) {
          setLinkPreview(data);
        }
      } catch (err: any) {
        console.error('Error fetching link preview:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    const url = extractUrl();
    if (url) {
      fetchLinkPreview(url);
    }
  }, [content]);
  
  return { linkPreview, isLoading, error };
}
