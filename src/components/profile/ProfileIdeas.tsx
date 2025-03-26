
import { useState, useEffect } from "react";
import { ProfileType } from "@/types/profile";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, MessageSquare, ThumbsUp, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProfileIdeasProps {
  profile: ProfileType;
}

export default function ProfileIdeas({ profile }: ProfileIdeasProps) {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("newest");

  const fetchIdeas = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('ideas')
        .select('*')
        .eq('user_id', profile.id);
      
      if (filter === "newest") {
        query = query.order('created_at', { ascending: false });
      } else if (filter === "popular") {
        query = query.order('votes_count', { ascending: false });
      } else if (filter === "reviewed") {
        query = query.order('mentor_reviews_count', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error("Error fetching ideas:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchIdeas();
    
    // Set up realtime subscription for idea changes
    const channel = supabase
      .channel(`ideas-${profile.id}`)
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'ideas', filter: `user_id=eq.${profile.id}` },
          (payload) => {
            fetchIdeas();
          }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.id, filter]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="py-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-16 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getIdeasText = () => {
    if (ideas.length === 0) {
      return "No ideas shared yet";
    }
    return ideas.length === 1 ? "1 idea" : `${ideas.length} ideas`;
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
          {getIdeasText()}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="mr-2 h-3.5 w-3.5" />
              <span>{filter === "newest" ? "Newest" : filter === "popular" ? "Most Popular" : "Most Reviewed"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilter("newest")}>
              Newest
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("popular")}>
              Most Popular
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("reviewed")}>
              Most Reviewed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {ideas.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
          <h3 className="text-lg font-medium mb-1">No ideas yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {profile.id === profile.id 
              ? "Share your startup ideas and get feedback from mentors and the community."
              : `${profile.full_name || profile.username} hasn't shared any ideas yet.`}
          </p>
          <Button className="mt-4" variant="outline" asChild>
            <Link to="/pitch-hub">
              <Lightbulb className="mr-2 h-4 w-4" />
              Go to Pitch Hub
            </Link>
          </Button>
        </div>
      ) : (
        <motion.div 
          className="space-y-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {ideas.map((idea) => (
            <motion.div key={idea.id} variants={item}>
              <Card className="hover:border-primary/20 transition-colors">
                <CardContent className="pt-6 pb-4">
                  <Link to={`/pitch-hub/${idea.id}`} className="block">
                    <h3 className="text-lg font-medium hover:text-primary transition-colors line-clamp-2 mb-2">
                      {idea.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {idea.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="bg-primary/5">
                        {idea.category}
                      </Badge>
                      {idea.tags && idea.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="bg-secondary/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="flex items-center mr-4">
                        <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                        {idea.votes_count} votes
                      </span>
                      <span className="flex items-center mr-4">
                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                        {idea.comments_count} comments
                      </span>
                      <span className="flex items-center">
                        <Lightbulb className="h-3.5 w-3.5 mr-1" />
                        {idea.mentor_reviews_count} reviews
                      </span>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  );
}
