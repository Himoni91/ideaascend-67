
import { ProfileType } from "@/types/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileStatsProps {
  profile: ProfileType;
}

export default function ProfileStats({ profile }: ProfileStatsProps) {
  const stats = profile.stats || {
    followers: 0,
    following: 0,
    ideas: 0,
    mentorSessions: 0
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
            <div className="text-2xl font-bold text-idolyst-blue">{stats.followers}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
            <div className="text-2xl font-bold text-idolyst-blue">{stats.following}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
            <div className="text-2xl font-bold text-idolyst-blue">{stats.ideas}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Ideas</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
            <div className="text-2xl font-bold text-idolyst-blue">{stats.mentorSessions}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Sessions</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
