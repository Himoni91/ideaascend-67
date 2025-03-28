
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MessageSquare, Star, ThumbsUp } from "lucide-react";
import { ProfileType } from "@/types/profile";
import { asMentorProfile } from "@/types/mentor";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MentorCardProps {
  mentor: ProfileType;
  hideActions?: boolean;
}

export default function MentorCard({ mentor, hideActions }: MentorCardProps) {
  const mentorProfile = asMentorProfile(mentor);
  
  // Calculate truncated expertise
  const displayExpertise = mentor.expertise?.slice(0, 3) || [];
  const hasMoreExpertise = mentor.expertise && mentor.expertise.length > 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Link to={`/mentor-space/${mentor.id}`}>
        <Card className="h-full hover:border-primary/20 transition-all hover:shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={mentor.avatar_url || undefined} />
                <AvatarFallback>{mentor.full_name?.charAt(0) || mentor.username?.charAt(0) || "M"}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{mentor.full_name || mentor.username}</CardTitle>
                <CardDescription className="mt-1">
                  {mentor.position && mentor.company ? (
                    `${mentor.position} at ${mentor.company}`
                  ) : (
                    mentor.byline || "Mentor"
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pb-4">
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {mentorProfile.mentor_bio || mentor.bio || "Experienced mentor ready to help you succeed."}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {displayExpertise.map((exp, i) => (
                <Badge key={i} variant="outline" className="bg-primary/5">
                  {exp}
                </Badge>
              ))}
              {hasMoreExpertise && (
                <Badge variant="outline">+{mentor.expertise!.length - 3} more</Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Star className="h-3.5 w-3.5 mr-1.5 text-yellow-500 fill-yellow-500" />
                <span>{mentor.stats?.mentorRating || 4.9} Rating</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <span>{mentor.stats?.mentorSessions || 0} Sessions</span>
              </div>
              <div className="flex items-center">
                <ThumbsUp className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <span>{mentor.stats?.mentorReviews || 0} Reviews</span>
              </div>
            </div>
          </CardContent>
          
          {!hideActions && (
            <CardFooter className="pt-0">
              <Button className="w-full" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Session
              </Button>
            </CardFooter>
          )}
        </Card>
      </Link>
    </motion.div>
  );
}
