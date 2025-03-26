
import { Badge } from "@/components/ui/badge";
import { ProfileType } from "@/types/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProfileBadgesProps {
  profile: ProfileType;
}

export default function ProfileBadges({ profile }: ProfileBadgesProps) {
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  
  // Combine actual badges with placeholder locked badges for display
  const allBadges = [
    ...(profile.badges || []),
    { name: "Community Builder", icon: "🏗️", description: "Connected with 10+ community members", earned: false },
    { name: "Idea Machine", icon: "💡", description: "Submit 5 ideas to PitchHub", earned: false },
    { name: "Mentor Favorite", icon: "⭐", description: "Receive positive feedback from 3 mentors", earned: false },
    { name: "Rising Star", icon: "🚀", description: "Reach level 5", earned: false },
  ];

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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center">
              <Award className="mr-2 h-5 w-5 text-idolyst-blue" />
              Badges
            </CardTitle>
            <CardDescription>
              Achievements and recognitions earned on the platform
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-normal">
            {profile.badges?.filter(b => b.earned).length || 0}/{allBadges.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {allBadges.map((badge) => (
            <motion.div 
              key={badge.name}
              variants={item}
              className="relative"
              onClick={() => setSelectedBadge(selectedBadge === badge.name ? null : badge.name)}
            >
              <div 
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all transform hover:scale-105",
                  badge.earned
                    ? "bg-primary/5 hover:bg-primary/10 border border-primary/10"
                    : "bg-muted/50 border border-muted grayscale opacity-70"
                )}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className="text-xs font-medium text-center">{badge.name}</div>
                
                {!badge.earned && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {selectedBadge === badge.name && (
                <motion.div 
                  className="absolute z-10 mt-2 p-3 bg-popover border rounded-lg shadow-lg text-xs w-full sm:w-48"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="font-medium mb-1">{badge.name}</div>
                  <div className="text-muted-foreground">{badge.description}</div>
                  {!badge.earned && (
                    <div className="mt-2 text-primary font-medium text-[10px] flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Not yet earned
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}
