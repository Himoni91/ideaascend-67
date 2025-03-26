
import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import EnhancedPostCard from "@/components/post/EnhancedPostCard";
import PostComments from "@/components/post/PostComments";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Post } from "@/types/post";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch the post with author and categories
  const {
    data: post,
    isLoading,
    error
  } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      if (!id) throw new Error("Post ID is required");

      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          author:profiles!posts_user_id_fkey(*),
          categories:post_categories!inner(
            category:categories(*)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      // Transform the data to flatten the nested structure
      const categories = data.categories.map((pc: any) => pc.category);
      return {
        ...data,
        author: data.author,
        categories,
        isTrending: data.trending_score > 50
      } as Post;
    },
    retry: 1,
    onError: (error: any) => {
      toast.error(`Error loading post: ${error.message}`);
    }
  });

  // Increment view count
  useEffect(() => {
    if (post?.id) {
      const incrementViewCount = async () => {
        await supabase
          .from("posts")
          .update({ view_count: (post.view_count || 0) + 1 })
          .eq("id", post.id);
      };
      
      incrementViewCount();
    }
  }, [post?.id]);
  
  if (error) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-10 text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <p className="text-muted-foreground mb-6">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/")} variant="default">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-0">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
        ) : post ? (
          <div className="space-y-6">
            <EnhancedPostCard post={post} />
            <PostComments postId={post.id} />
          </div>
        ) : (
          <div className="text-center py-10">
            <h2 className="text-xl font-medium mb-2">Post not found</h2>
            <p className="text-muted-foreground">
              This post may have been removed or doesn't exist.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
