
import { ProfileType } from "@/types/profile";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileBadgesProps {
  profile: ProfileType;
}

export default function ProfileBadges({ profile }: ProfileBadgesProps) {
  // This would be expanded and come from API in production
  const allBadges = [
    { name: "First Post", icon: "📝", description: "Published your first post on Idolyst", earned: true },
    { name: "Idea Maker", icon: "💡", description: "Submitted your first idea to PitchHub", earned: true },
    { name: "Connector", icon: "🔗", description: "Connected with 10+ other members", earned: true },
    { name: "Rising Star", icon: "⭐", description: "Reached level 5 on the platform", earned: false },
    { name: "Thought Leader", icon: "🧠", description: "Had a post with 50+ likes", earned: false },
    { name: "Innovator", icon: "🚀", description: "Had a PitchHub idea with 100+ votes", earned: false },
    { name: "Mentor", icon: "👨‍🏫", description: "Conducted 5+ mentoring sessions", earned: profile.is_mentor },
    { name: "Verified Pro", icon: "✅", description: "Verified professional status", earned: profile.is_verified }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {allBadges.map((badge) => (
        <Card 
          key={badge.name} 
          className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in ${
            badge.earned 
              ? 'bg-white dark:bg-gray-800' 
              : 'bg-gray-50 dark:bg-gray-700/50 opacity-60'
          }`}
        >
          <CardContent className="p-4 flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
              badge.earned 
                ? 'bg-gradient-to-br from-blue-400 to-purple-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
            }`}>
              {badge.icon}
            </div>
            <div className="ml-4">
              <h3 className="font-medium">{badge.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {badge.description}
              </p>
              {!badge.earned && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Not yet earned
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
