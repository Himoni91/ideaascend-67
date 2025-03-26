
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { formatDistanceToNow } from "date-fns";

const PitchHubIdea = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const fetchIdea = async () => {
      setIsLoading(true);
      
      try {
        if (!id) {
          throw new Error("Idea ID is missing");
        }
        
        // Fetch idea details
        const { data: ideaData, error: ideaError } = await supabase
          .from('ideas')
          .select('*')
          .eq('id', id)
          .single();
        
        if (ideaError) throw ideaError;
        if (!ideaData) throw new Error("Idea not found");
        
        setIdea(ideaData);
        
        // Fetch author details
        const { data: authorData, error: authorError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', ideaData.user_id)
          .single();
        
        if (authorError) throw authorError;
        setAuthor(authorData);
        
      } catch (err: any) {
        setError(err.message || "Failed to load idea");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchIdea();
    
    // Set up real-time subscription for idea updates
    const ideaChannel = supabase
      .channel(`idea-${id}`)
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'ideas', filter: `id=eq.${id}` },
          (payload) => {
            setIdea(payload.new);
          }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(ideaChannel);
    };
  }, [id]);

  const handleVote = async (voteType: "up" | "down") => {
    if (!user || !idea) return;
    
    // Simple implementation - in a real app, you'd track votes in a separate table
    const newVotesCount = voteType === "up" 
      ? (userVote === "up" ? idea.votes_count - 1 : idea.votes_count + 1)
      : (userVote === "down" ? idea.votes_count + 1 : idea.votes_count - 1);
    
    const { error } = await supabase
      .from('ideas')
      .update({ votes_count: newVotesCount })
      .eq('id', idea.id);
    
    if (!error) {
      setUserVote(userVote === voteType ? null : voteType);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-idolyst-blue mb-4" />
          <span className="text-lg text-gray-600 dark:text-gray-300">Loading idea...</span>
        </div>
      </AppLayout>
    );
  }

  if (error || !idea || !author) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Idea Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error || "The requested idea could not be found."}
          </p>
          <Button onClick={() => navigate("/pitch-hub")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to PitchHub
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/pitch-hub")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to PitchHub
        </Button>
        
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={author.avatar_url || undefined} />
                  <AvatarFallback>{author.full_name?.charAt(0) || author.username?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{author.full_name || author.username}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(idea.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
              
              <Badge>{idea.category}</Badge>
            </div>
            
            <CardTitle className="mt-4 text-2xl font-bold">{idea.title}</CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="mb-6 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {idea.description}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {idea.tags && idea.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="bg-secondary/20">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="border-t pt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant={userVote === "up" ? "default" : "outline"} 
                size="sm"
                onClick={() => handleVote("up")}
              >
                <ThumbsUp className="mr-1 h-4 w-4" />
                {idea.votes_count > 0 ? idea.votes_count : ''}
              </Button>
              
              <Button 
                variant={userVote === "down" ? "default" : "outline"} 
                size="sm"
                onClick={() => handleVote("down")}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                {idea.comments_count || 0} Comments
              </Button>
              
              <Button variant="ghost" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        <Tabs defaultValue="comments">
          <TabsList className="mb-4">
            <TabsTrigger value="comments">
              Comments ({idea.comments_count || 0})
            </TabsTrigger>
            <TabsTrigger value="mentorFeedback">
              Mentor Feedback ({idea.mentor_reviews_count || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="comments">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                  <h3 className="text-lg font-medium mb-1">No comments yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                    Be the first to comment on this idea
                  </p>
                  <Button>Add Comment</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="mentorFeedback">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Avatar className="h-12 w-12 mx-auto mb-3">
                    <AvatarFallback>M</AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-medium mb-1">No mentor feedback yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                    This idea is waiting for mentor feedback
                  </p>
                  <Button variant="outline">Request Feedback</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PitchHubIdea;
