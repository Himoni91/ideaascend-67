
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
// Use 'export type' for re-exports
export type { DiscoverContent } from '@/types/discover';
export type { DiscoverCategory } from '@/types/discover';
export type { DiscoverFilter } from '@/types/discover';

export const useDiscover = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all discover content
  const fetchDiscoverContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('discover_content')
        .select(`
          *,
          profile:created_by(id, username, full_name, avatar_url, is_verified, position, company)
        `)
        .order('trending_score', { ascending: false });
        
      if (error) throw new Error(error.message);
      
      // Transform data to match DiscoverContent interface
      return data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        content_type: item.content_type,
        image_url: item.image_url,
        tags: item.tags,
        view_count: item.view_count,
        created_at: item.created_at,
        trending_score: item.trending_score,
        is_featured: item.is_featured,
        created_by: item.created_by,
        profile: item.profile && !('error' in item.profile) ? {
          id: item.profile.id,
          username: item.profile.username,
          full_name: item.profile.full_name,
          avatar_url: item.profile.avatar_url,
          is_verified: item.profile.is_verified,
          position: item.profile.position,
          company: item.profile.company
        } : {
          id: item.created_by,
          username: 'unknown',
          full_name: 'Unknown User',
          avatar_url: null,
          is_verified: false,
          position: null,
          company: null
        },
        metadata: item.metadata
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch a single discover content item by ID
  const fetchDiscoverContentById = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('discover_content')
        .select(`
          *,
          profile:created_by(id, username, full_name, avatar_url, is_verified, position, company)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw new Error(error.message);
      
      // Transform data to match DiscoverContent interface
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        content_type: data.content_type,
        image_url: data.image_url,
        tags: data.tags,
        view_count: data.view_count,
        created_at: data.created_at,
        trending_score: data.trending_score,
        is_featured: data.is_featured,
        created_by: data.created_by,
        profile: data.profile && !('error' in data.profile) ? {
          id: data.profile.id,
          username: data.profile.username,
          full_name: data.profile.full_name,
          avatar_url: data.profile.avatar_url,
          is_verified: data.profile.is_verified,
          position: data.profile.position,
          company: data.profile.company
        } : {
          id: data.created_by,
          username: 'unknown',
          full_name: 'Unknown User',
          avatar_url: null,
          is_verified: false,
          position: null,
          company: null
        },
        metadata: data.metadata
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch discover content by type
  const fetchDiscoverContentByType = async (contentType: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('discover_content')
        .select(`
          *,
          profile:created_by(id, username, full_name, avatar_url, is_verified, position, company)
        `)
        .eq('content_type', contentType)
        .order('trending_score', { ascending: false });
        
      if (error) throw new Error(error.message);
      
      // Transform data to match DiscoverContent interface
      return data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        content_type: item.content_type,
        image_url: item.image_url,
        tags: item.tags,
        view_count: item.view_count,
        created_at: item.created_at,
        trending_score: item.trending_score,
        is_featured: item.is_featured,
        created_by: item.created_by,
        profile: item.profile && !('error' in item.profile) ? {
          id: item.profile.id,
          username: item.profile.username,
          full_name: item.profile.full_name,
          avatar_url: item.profile.avatar_url,
          is_verified: item.profile.is_verified,
          position: item.profile.position,
          company: item.profile.company
        } : {
          id: item.created_by,
          username: 'unknown',
          full_name: 'Unknown User',
          avatar_url: null,
          is_verified: false,
          position: null,
          company: null
        },
        metadata: item.metadata
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if a user is following a creator
  const checkIsFollowing = async (creatorId: string, userId: string) => {
    if (!userId || !creatorId) return false;
    
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_id', userId)
        .eq('following_id', creatorId)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw new Error(error.message);
      }
      
      return !!data;
    } catch (err) {
      console.error('Error checking follow status:', err);
      return false;
    }
  };

  return {
    fetchDiscoverContent,
    fetchDiscoverContentById,
    fetchDiscoverContentByType,
    checkIsFollowing,
    isLoading,
    error
  };
};
