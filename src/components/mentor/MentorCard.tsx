
import { Link } from "react-router-dom";
import { Calendar, MessageSquare, Star, Award, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileType } from "@/types/profile";

interface MentorCardProps {
  mentor: ProfileType;
}

export default function MentorCard({ mentor }: MentorCardProps) {
  // Format the mentor price
  const formatPrice = () => {
    if (!mentor.mentor_hourly_rate) return "Free";
    return `$${mentor.mentor_hourly_rate}/hr`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full hover:border-primary/20 transition-all hover:shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={mentor.avatar_url || undefined} />
              <AvatarFallback>
                {mentor.full_name?.charAt(0) || mentor.username?.charAt(0) || "M"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <CardTitle className="text-lg">
                  {mentor.full_name || mentor.username}
                </CardTitle>
                {mentor.is_verified && (
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                    <Award className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-1">
                {mentor.position} {mentor.company && `at ${mentor.company}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {mentor.mentor_bio || mentor.bio || "Experienced mentor ready to help you grow."}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {mentor.expertise && mentor.expertise.slice(0, 3).map((exp) => (
              <Badge key={exp} variant="outline" className="bg-primary/5">
                {exp}
              </Badge>
            ))}
            {mentor.expertise && mentor.expertise.length > 3 && (
              <Badge variant="outline">+{mentor.expertise.length - 3} more</Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <Star className="h-3.5 w-3.5 mr-1.5 text-yellow-500 fill-yellow-500" />
              <span>
                {mentor.stats?.mentorRating?.toFixed(1) || "New"} 
                {mentor.stats?.mentorReviews ? ` (${mentor.stats.mentorReviews})` : ""}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <span>{mentor.stats?.mentorSessions || 0} Sessions</span>
            </div>
            <div className="flex items-center">
              <Badge variant="outline" className="h-6 px-2 text-primary">
                {formatPrice()}
              </Badge>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-0">
          <Button asChild className="w-full" variant="outline">
            <Link to={`/mentor-space/${mentor.id}`}>
              <Calendar className="mr-2 h-4 w-4" />
              View Profile
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
