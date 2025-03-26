
import { useState, useEffect } from 'react';
import { LinkPreview } from '@/types/post';
import { supabase } from '@/integrations/supabase/client';

// Regular expression to match URLs in text
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export function useLinkPreview(content: string) {
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const extractUrl = () => {
      if (!content) return null;
      
      // Extract the first URL from the content
      const matches = content.match(URL_REGEX);
      return matches ? matches[0] : null;
    };
    
    const fetchLinkPreview = async (url: string) => {
      setIsLoading(true);
      try {
        // We'll use Supabase Edge Function to fetch the link preview
        // This would need to be implemented as an edge function
        const { data, error } = await supabase.functions.invoke('link-preview', {
          body: { url }
        });
        
        if (error) throw new Error(error.message);
        
        if (data) {
          setLinkPreview({
            url: data.url,
            title: data.title || 'No title available',
            description: data.description || 'No description available',
            image: data.image || '',
            domain: new URL(data.url).hostname.replace('www.', '')
          });
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
    } else {
      setLinkPreview(null);
    }
  }, [content]);
  
  return { linkPreview, isLoading, error };
}
