import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DiscoverItem } from "@/types/discover";
import { ProfileType } from "@/types/profile";

// Helper function to format profile data
const formatProfileData = (profileData: any): ProfileType => {
  const defaultBadges = [
    { name: "New Member", icon: "👋", description: "Welcome to Idolyst", earned: true }
  ];
  
  const defaultStats = {
    followers: 0,
    following: 0,
    ideas: 0,
    mentorSessions: 0,
    posts: 0,
    rank: 0
  };

  let badges = defaultBadges;
  let stats = defaultStats;

  try {
    if (profileData.badges) {
      if (Array.isArray(profileData.badges)) {
        badges = profileData.badges;
      }
    }
    
    if (profileData.stats) {
      if (typeof profileData.stats === 'object' && !Array.isArray(profileData.stats)) {
        stats = { ...defaultStats, ...profileData.stats };
      }
    }
  } catch (e) {
    console.error("Error parsing profile data:", e);
  }

  return {
    ...profileData,
    badges,
    stats
  } as ProfileType;
};

// Helper function to convert database records to DiscoverItem type
const formatDiscoverItem = (data: any): DiscoverItem => {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    contentType: data.content_type,
    imageUrl: data.image_url,
    tags: data.tags,
    viewCount: data.view_count,
    createdAt: data.created_at,
    trendingScore: data.trending_score,
    isFeatured: data.is_featured,
    createdBy: data.profile ? data.profile.id : null,
    username: data.profile ? data.profile.username : 'Unknown',
    fullName: data.profile ? data.profile.full_name : null,
    avatarUrl: data.profile ? data.profile.avatar_url : null,
    isVerified: data.profile ? data.profile.is_verified : false,
    position: data.profile ? data.profile.position : null,
  };
};

export function useDiscoverItems(limit: number = 10) {
  return useQuery({
    queryKey: ["discover-items", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discover_items")
        .select(`
          *,
          profile: created_by (
            id,
            username,
            full_name,
            avatar_url,
            is_verified,
            position
          )
        `)
        .limit(limit);
        
      if (error) throw error;
      
      // Ensure data is not null before mapping
      if (!data) {
        console.warn("No data returned from discover_items query.");
        return [];
      }

      // Update the problematic areas with proper null checks
      const formattedItems = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        contentType: item.content_type,
        imageUrl: item.image_url,
        tags: item.tags,
        viewCount: item.view_count,
        createdAt: item.created_at,
        trendingScore: item.trending_score,
        isFeatured: item.is_featured,
        createdBy: item.profile ? item.profile.id : null,
        username: item.profile ? item.profile.username : 'Unknown',
        fullName: item.profile ? item.profile.full_name : null,
        avatarUrl: item.profile ? item.profile.avatar_url : null,
        isVerified: item.profile ? item.profile.is_verified : false,
        position: item.profile ? item.profile.position : null,
      }));
      
      return formattedItems;
    },
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDiscoverItem(id: string) {
  return useQuery({
    queryKey: ["discover-item", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discover_items")
        .select(`
          *,
          profile: created_by (
            id,
            username,
            full_name,
            avatar_url,
            is_verified,
            position
          )
        `)
        .eq("id", id)
        .single();
        
      if (error) throw error;
      
      // Ensure data is not null before proceeding
      if (!data) {
        throw new Error(`Discover item with id ${id} not found`);
      }

      // Further down in the file, apply the same pattern of null checks
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        contentType: data.content_type,
        imageUrl: data.image_url,
        tags: data.tags,
        viewCount: data.view_count,
        createdAt: data.created_at,
        trendingScore: data.trending_score,
        isFeatured: data.is_featured,
        createdBy: data.profile ? data.profile.id : null,
        username: data.profile ? data.profile.username : 'Unknown',
        fullName: data.profile ? data.profile.full_name : null,
        avatarUrl: data.profile ? data.profile.avatar_url : null,
        isVerified: data.profile ? data.profile.is_verified : false,
        position: data.profile ? data.profile.position : null,
      };
    },
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}
