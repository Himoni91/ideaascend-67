
import { useState, useEffect } from "react";
import { ProfileType } from "@/types/profile";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, Share2, MoreHorizontal, Filter, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProfilePostsProps {
  profile: ProfileType;
}

export default function ProfilePosts({ profile }: ProfilePostsProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("newest");

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select('*')
        .eq('user_id', profile.id);
      
      if (filter === "newest") {
        query = query.order('created_at', { ascending: false });
      } else if (filter === "popular") {
        query = query.order('likes_count', { ascending: false });
      } else if (filter === "discussed") {
        query = query.order('comments_count', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPosts();
    
    // Set up realtime subscription for post changes
    const channel = supabase
      .channel(`posts-${profile.id}`)
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'posts', filter: `user_id=eq.${profile.id}` },
          (payload) => {
            fetchPosts();
          }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.id, filter]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <div className="flex gap-4 w-full">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  const getPostsText = () => {
    if (posts.length === 0) {
      return "No posts shared yet";
    }
    return posts.length === 1 ? "1 post" : `${posts.length} posts`;
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          {getPostsText()}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="mr-2 h-3.5 w-3.5" />
              <span>{filter === "newest" ? "Newest" : filter === "popular" ? "Most Liked" : "Most Discussed"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilter("newest")}>
              Newest
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("popular")}>
              Most Liked
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("discussed")}>
              Most Discussed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {posts.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
          <h3 className="text-lg font-medium mb-1">No posts yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {profile.id === profile.id 
              ? "Share your thoughts, insights or questions with the community."
              : `${profile.full_name || profile.username} hasn't shared any posts yet.`}
          </p>
        </div>
      ) : (
        <motion.div 
          className="space-y-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {posts.map((post) => (
            <motion.div key={post.id} variants={item}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Avatar>
                        <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name || profile.username} />
                        <AvatarFallback>
                          {profile.full_name?.charAt(0) || profile.username?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{profile.full_name || profile.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Copy link</DropdownMenuItem>
                        <DropdownMenuItem>Report</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-sm">{post.content}</p>
                    
                    {post.media_url && (
                      <div className="rounded-lg overflow-hidden border bg-muted/20 aspect-video flex items-center justify-center">
                        {post.type === 'image' ? (
                          <img 
                            src={post.media_url} 
                            alt="Post attachment" 
                            className="object-cover w-full h-full" 
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-8 w-8 mb-2" />
                            <span className="text-xs">Media attachment</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t py-3 flex justify-between">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <ThumbsUp className="mr-1 h-4 w-4" />
                    {post.likes_count}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <MessageSquare className="mr-1 h-4 w-4" />
                    {post.comments_count}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Share2 className="mr-1 h-4 w-4" />
                    Share
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  );
}
