
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/layout/AppLayout";
import EnhancedPostCard from "@/components/post/EnhancedPostCard";
import PostComments from "@/components/post/PostComments";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { SlideUp, FadeIn } from "@/components/ui/page-transition";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: post,
    isLoading,
    error,
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

      // Transform the data to match our expected format
      const categories = data.categories.map((pc: any) => pc.category);
      return {
        ...data,
        categories,
        isTrending: data.trending_score > 50, // Arbitrary threshold
      };
    },
    meta: {
      onError: (error: Error) => {
        toast.error(`Error loading post: ${error.message}`);
        navigate("/");
      }
    }
  });

  const handleGoBack = () => {
    navigate(-1);
  };

  // Update view count
  useQuery({
    queryKey: ["post-view", id],
    queryFn: async () => {
      if (!id) return null;

      // Increment view count
      await supabase
        .rpc("increment_view_count", { post_id: id })
        .catch(error => console.error("Failed to increment view count:", error));

      return null;
    },
    enabled: !!id && !isLoading && !error,
  });

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-0">
        <FadeIn className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center text-muted-foreground mb-4"
            onClick={handleGoBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </FadeIn>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Sorry, we couldn't load this post.
            </p>
            <Button onClick={() => navigate("/")}>Return to Home</Button>
          </div>
        ) : post ? (
          <>
            <SlideUp>
              <EnhancedPostCard post={post} />
            </SlideUp>

            <FadeIn className="mt-6">
              <PostComments postId={post.id} />
            </FadeIn>
          </>
        ) : null}
      </div>
    </AppLayout>
  );
}
