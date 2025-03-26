
import { ProfileType } from "@/types/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRoundCheck, Users, Lightbulb, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileStatsProps {
  profile: ProfileType;
}

export default function ProfileStats({ profile }: ProfileStatsProps) {
  const stats = profile.stats || {
    followers: 0,
    following: 0,
    ideas: 0,
    mentorSessions: 0,
    posts: 0
  };

  // Animation variants
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
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Users className="w-5 h-5 mr-2 text-idolyst-blue" />
          Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div 
          className="grid grid-cols-2 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div 
            className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer group"
            variants={item}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold text-idolyst-blue group-hover:text-idolyst-indigo transition-colors">
              {stats.followers}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <UserRoundCheck className="w-4 h-4 mr-1" />
              Followers
            </div>
          </motion.div>
          
          <motion.div 
            className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer group"
            variants={item}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold text-idolyst-blue group-hover:text-idolyst-indigo transition-colors">
              {stats.following}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <Users className="w-4 h-4 mr-1" />
              Following
            </div>
          </motion.div>
          
          <motion.div 
            className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer group"
            variants={item}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold text-idolyst-blue group-hover:text-idolyst-indigo transition-colors">
              {stats.ideas}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 mr-1" />
              Ideas
            </div>
          </motion.div>
          
          <motion.div 
            className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer group"
            variants={item}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold text-idolyst-blue group-hover:text-idolyst-indigo transition-colors">
              {stats.mentorSessions}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
              <Calendar className="w-4 h-4 mr-1" />
              Sessions
            </div>
          </motion.div>
          
          {profile.stats?.rank && (
            <motion.div 
              className="col-span-2 text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg border border-blue-100 dark:border-blue-800"
              variants={item}
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-lg font-bold text-gradient-to-r from-idolyst-blue to-idolyst-indigo">
                #{profile.stats.rank}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Leaderboard Rank
              </div>
            </motion.div>
          )}
        </motion.div>
      </CardContent>
    </Card>
  );
}
