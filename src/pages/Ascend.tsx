
import AppLayout from "@/components/layout/AppLayout";

const Ascend = () => {
  const userProfile = {
    level: 3,
    xp: 1250,
    nextLevel: 2000,
    badges: 7,
    leaderboardRank: 42
  };

  const leaderboard = [
    { rank: 1, name: "Jessica Taylor", avatar: "JT", level: 12, xp: 12450 },
    { rank: 2, name: "Michael Chen", avatar: "MC", level: 10, xp: 10200 },
    { rank: 3, name: "Alex Rivera", avatar: "AR", level: 9, xp: 9850 },
    { rank: 4, name: "Sarah Johnson", avatar: "SJ", level: 8, xp: 8700 },
    { rank: 5, name: "David Kim", avatar: "DK", level: 7, xp: 7550 }
  ];

  const badges = [
    { id: 1, name: "First Post", icon: "📝", achieved: true },
    { id: 2, name: "Idea Maker", icon: "💡", achieved: true },
    { id: 3, name: "Connector", icon: "🔗", achieved: true },
    { id: 4, name: "Feedback Pro", icon: "🎯", achieved: true },
    { id: 5, name: "Rising Star", icon: "⭐", achieved: true },
    { id: 6, name: "Trending Post", icon: "📈", achieved: true },
    { id: 7, name: "Mentor Favorite", icon: "🏆", achieved: true },
    { id: 8, name: "Top Contributor", icon: "👑", achieved: false },
    { id: 9, name: "Pitch Perfect", icon: "🚀", achieved: false }
  ];

  const recentActivity = [
    { action: "Posted in Funding category", xp: 10, timestamp: "2 hours ago" },
    { action: "Received upvotes on your idea", xp: 25, timestamp: "Yesterday" },
    { action: "Commented on a mentor post", xp: 5, timestamp: "2 days ago" },
    { action: "Earned Rising Star badge", xp: 50, timestamp: "3 days ago" },
    { action: "Booked a mentor session", xp: 30, timestamp: "Last week" }
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-idolyst-blue to-idolyst-indigo bg-clip-text text-transparent">
            Ascend
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Track your progress, earn badges, and climb the leaderboard as you engage with the community
          </p>
        </div>

        {/* User Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-1 mb-6 md:mb-0">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-idolyst-blue to-idolyst-indigo flex items-center justify-center text-white font-bold">
                  {userProfile.level}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold">Level {userProfile.level} Entrepreneur</h2>
                  <p className="text-sm text-gray-500">
                    {userProfile.xp} / {userProfile.nextLevel} XP to Level {userProfile.level + 1}
                  </p>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-idolyst-blue to-idolyst-indigo rounded-full"
                  style={{ width: `${(userProfile.xp / userProfile.nextLevel) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex gap-4 md:gap-6">
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-idolyst-blue">{userProfile.badges}</div>
                <div className="text-sm text-gray-500">Badges</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-idolyst-blue">#{userProfile.leaderboardRank}</div>
                <div className="text-sm text-gray-500">Rank</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Badges */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Your Badges</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {badges.map((badge) => (
                  <div 
                    key={badge.id} 
                    className={`flex flex-col items-center p-3 rounded-lg ${
                      badge.achieved 
                        ? "bg-gray-50 dark:bg-gray-750" 
                        : "bg-gray-100 dark:bg-gray-700 opacity-50"
                    }`}
                  >
                    <div className="text-2xl mb-2">{badge.icon}</div>
                    <div className="text-sm font-medium text-center">{badge.name}</div>
                    {!badge.achieved && (
                      <div className="text-xs text-gray-500 mt-1">Locked</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex justify-between items-start pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                    <div className="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                      +{activity.xp} XP
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Weekly Leaderboard</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      XP
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {leaderboard.map((user) => (
                    <tr key={user.rank} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-medium
                          ${user.rank === 1 
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : user.rank === 2 
                              ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              : user.rank === 3 
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {user.rank}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-idolyst-lightBlue flex items-center justify-center text-idolyst-darkBlue font-medium">
                            {user.avatar}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {user.level}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {user.xp.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Ascend;
