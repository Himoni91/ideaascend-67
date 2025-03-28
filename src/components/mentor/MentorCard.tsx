
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, Calendar, Verified, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProfileType } from "@/types/profile";

interface MentorCardProps {
  mentor: ProfileType;
  featured?: boolean;
}

export default function MentorCard({ mentor, featured = false }: MentorCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate mentor stats
  const mentorRating = mentor.stats?.mentorRating || 0;
  const mentorReviews = mentor.stats?.mentorReviews || 0;
  const expertise = mentor.expertise || [];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={`h-full overflow-hidden transition-all duration-300 ${isHovered ? 'border-primary/40 shadow-md' : ''}`}>
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <Link to={`/mentor-space/${mentor.id}`} className="flex items-start gap-3">
              <Avatar className="h-12 w-12 border-2 border-background">
                <AvatarImage src={mentor.avatar_url || undefined} alt={mentor.full_name || mentor.username} />
                <AvatarFallback>{mentor.full_name?.charAt(0) || mentor.username?.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div>
                <div className="flex items-center gap-1">
                  <h3 className="font-medium text-base">{mentor.full_name || mentor.username}</h3>
                  {mentor.is_verified && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Verified className="h-4 w-4 text-blue-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Verified Mentor</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{mentor.position}{mentor.company ? ` at ${mentor.company}` : ''}</p>
                {mentor.location && (
                  <div className="flex items-center mt-0.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{mentor.location}</span>
                  </div>
                )}
              </div>
            </Link>
            
            {featured && (
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:bg-blue-500/20">
                Featured
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          {mentor.byline && (
            <p className="line-clamp-2 text-sm mb-3 h-10">
              {mentor.byline}
            </p>
          )}
          
          <div className="flex flex-wrap gap-1 mb-3">
            {expertise.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" className="bg-primary/5 text-xs">
                {skill}
              </Badge>
            ))}
            {expertise.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{expertise.length - 3} more
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            {mentorRating > 0 ? (
              <div className="flex items-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={`h-3.5 w-3.5 ${i < Math.round(mentorRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="ml-1 text-xs">
                  {mentorRating.toFixed(1)} ({mentorReviews})
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">No reviews yet</span>
            )}
            
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
              <span className="text-xs">
                {mentor.mentor_session_types?.some(t => t.is_free) 
                  ? 'Free session available' 
                  : `From $${mentor.mentor_hourly_rate || 50}/hr`}
              </span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <Button className="w-full" variant="outline" asChild>
            <Link to={`/mentor-space/${mentor.id}`}>
              View Profile
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
