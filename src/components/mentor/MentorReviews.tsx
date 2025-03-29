
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { StarIcon } from 'lucide-react';

export interface MentorReviewsProps {
  mentorId: string;
}

const MentorReviews: React.FC<MentorReviewsProps> = ({ mentorId }) => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['mentor-reviews', mentorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_reviews')
        .select(`
          *,
          reviewer:reviewer_id(id, full_name, avatar_url, username)
        `)
        .eq('mentor_id', mentorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!mentorId,
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  if (!reviews || reviews.length === 0) {
    return <div className="text-center py-4">No reviews yet</div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.reviewer?.avatar_url} alt={review.reviewer?.full_name || "User"} />
                <AvatarFallback>{review.reviewer?.full_name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-medium">{review.reviewer?.full_name || "Anonymous User"}</h4>
                  <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                </div>
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-sm">{review.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MentorReviews;
