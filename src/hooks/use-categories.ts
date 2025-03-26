
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PostCategory } from "@/types/post";
import { toast } from "sonner";

export function useCategories() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
        
      if (error) throw error;
      return data as PostCategory[];
    }
  });
  
  useEffect(() => {
    // Set up realtime subscription for category changes
    const channel = supabase
      .channel('categories-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'categories' },
          () => {
            // Invalidate categories cache to refetch data
            // This will be handled by React Query automatically
          }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const clearCategories = () => {
    setSelectedCategories([]);
  };
  
  const addCategory = async (category: Omit<PostCategory, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert(category)
        .select("*")
        .single();
        
      if (error) throw error;
      toast.success(`Added category: ${category.name}`);
      return data as PostCategory;
    } catch (error: any) {
      toast.error(`Failed to add category: ${error.message}`);
      throw error;
    }
  };
  
  return {
    categories: categories || [],
    isLoading,
    error,
    selectedCategories,
    toggleCategory,
    clearCategories,
    addCategory
  };
}
