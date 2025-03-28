
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  HelpCategory, 
  HelpArticle, 
  HelpArticleTag, 
  HelpFeedback, 
  HelpContactSubmission,
  HelpSearchResult
} from '@/types/help';

export const useHelpCenter = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HelpSearchResult[]>([]);

  // Fetch all categories
  const useCategories = () => {
    return useQuery({
      queryKey: ['help-categories'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('help_categories')
          .select('*')
          .order('order_index', { ascending: true });

        if (error) throw error;
        return data as HelpCategory[];
      }
    });
  };

  // Fetch featured articles
  const useFeaturedArticles = () => {
    return useQuery({
      queryKey: ['help-featured-articles'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('help_articles')
          .select(`
            *,
            category:help_categories(*),
            tags:help_article_tags(*)
          `)
          .eq('is_featured', true)
          .limit(5);

        if (error) throw error;
        return data as HelpArticle[];
      }
    });
  };

  // Fetch articles by category
  const useArticlesByCategory = (categorySlug?: string) => {
    return useQuery({
      queryKey: ['help-articles', categorySlug],
      queryFn: async () => {
        let query = supabase
          .from('help_articles')
          .select(`
            *,
            category:help_categories(*),
            tags:help_article_tags(*)
          `)
          .order('title', { ascending: true });

        if (categorySlug) {
          query = query.eq('category.slug', categorySlug);
        }

        const { data, error } = await query;
        
        if (error) throw error;
        return data as HelpArticle[];
      },
      enabled: !!categorySlug,
    });
  };

  // Fetch single article by slug
  const useArticle = (slug?: string) => {
    const articleQuery = useQuery({
      queryKey: ['help-article', slug],
      queryFn: async () => {
        if (!slug) throw new Error('Article slug is required');
        
        const { data, error } = await supabase
          .from('help_articles')
          .select(`
            *,
            category:help_categories(*),
            tags:help_article_tags(*)
          `)
          .eq('slug', slug)
          .single();

        if (error) throw error;
        
        // Increment view count
        await supabase.rpc('increment_help_article_views', {
          article_id: data.id
        });

        return data as HelpArticle;
      },
      enabled: !!slug,
    });

    // Record search if this article was found via search
    useEffect(() => {
      const recordSearch = async () => {
        if (articleQuery.data && searchQuery && user) {
          await supabase.from('help_search_history').insert({
            user_id: user.id,
            search_query: searchQuery,
            results_count: searchResults.length,
          });
        }
      };

      if (articleQuery.isSuccess) {
        recordSearch();
      }
    }, [articleQuery.isSuccess, searchQuery]);

    return articleQuery;
  };

  // Submit article feedback
  const submitFeedback = useMutation({
    mutationFn: async (feedback: {
      article_id: string;
      is_helpful: boolean;
      feedback_text?: string;
    }) => {
      if (!user) throw new Error('You must be logged in to submit feedback');

      const { data, error } = await supabase
        .from('help_feedback')
        .insert({
          ...feedback,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as HelpFeedback;
    },
    onSuccess: () => {
      toast.success('Thank you for your feedback!');
    },
    onError: (error) => {
      toast.error(`Failed to submit feedback: ${error.message}`);
    },
  });

  // Submit contact form
  const submitContactForm = useMutation({
    mutationFn: async (contactForm: {
      name?: string;
      email: string;
      subject: string;
      message: string;
    }) => {
      const payload: any = {
        ...contactForm,
      };

      if (user) {
        payload.user_id = user.id;
      }

      const { data, error } = await supabase
        .from('help_contact_submissions')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data as HelpContactSubmission;
    },
    onSuccess: () => {
      toast.success('Your message has been sent. We\'ll get back to you soon!');
    },
    onError: (error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });

  // Search articles
  const searchArticles = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabase
      .from('help_articles')
      .select(`
        *,
        category:help_categories(*),
        tags:help_article_tags(*)
      `)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`);

    if (error) {
      toast.error(`Search failed: ${error.message}`);
      return;
    }

    // Calculate relevance score based on how well the content matches the query
    const results: HelpSearchResult[] = (data as HelpArticle[]).map(article => {
      const titleMatch = article.title.toLowerCase().includes(query.toLowerCase()) ? 3 : 0;
      const contentMatch = article.content.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      
      // Check for tag matches
      const tagMatches = article.tags?.filter(tag => 
        tag.tag.toLowerCase().includes(query.toLowerCase())
      ).length || 0;
      
      return {
        article,
        relevance: titleMatch + contentMatch + (tagMatches * 2)
      };
    });

    // Sort by relevance score
    results.sort((a, b) => b.relevance - a.relevance);
    
    setSearchQuery(query);
    setSearchResults(results);

    // Record search if user is logged in
    if (user) {
      await supabase.from('help_search_history').insert({
        user_id: user.id,
        search_query: query,
        results_count: results.length,
      });
    }

    return results;
  };

  // Set up realtime subscriptions
  useEffect(() => {
    const helpChannel = supabase
      .channel('help-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'help_categories'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['help-categories'] });
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'help_articles'
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['help-articles'] });
        queryClient.invalidateQueries({ queryKey: ['help-featured-articles'] });
        queryClient.invalidateQueries({ queryKey: ['help-article'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(helpChannel);
    };
  }, [queryClient]);

  return {
    useCategories,
    useFeaturedArticles,
    useArticlesByCategory,
    useArticle,
    submitFeedback,
    submitContactForm,
    searchArticles,
    searchResults,
    setSearchQuery,
    searchQuery,
  };
};
