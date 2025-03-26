
import AppLayout from "@/components/layout/AppLayout";

const Profile = () => {
  const userProfile = {
    name: "John Doe",
    avatar: "JD",
    title: "Founder & CEO",
    company: "StartupName",
    location: "San Francisco, CA",
    bio: "Serial entrepreneur with 10+ years of experience building and scaling SaaS products. Previously founded two startups with successful exits.",
    level: 3,
    xp: 1250,
    badges: [
      { name: "First Post", icon: "📝" },
      { name: "Idea Maker", icon: "💡" },
      { name: "Connector", icon: "🔗" },
    ],
    stats: {
      followers: 248,
      following: 124,
      ideas: 5,
      mentorSessions: 12
    }
  };

  const tabs = [
    { id: "posts", label: "Posts" },
    { id: "ideas", label: "Ideas" },
    { id: "sessions", label: "Mentor Sessions" },
    { id: "badges", label: "Badges" },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Cover Image */}
          <div className="h-40 md:h-60 rounded-xl bg-gradient-to-r from-idolyst-blue to-idolyst-indigo"></div>
          
          {/* Profile Info */}
          <div className="relative px-4 md:px-6 -mt-16">
            <div className="flex flex-col md:flex-row items-start md:items-end">
              {/* Avatar */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-white p-1 shadow-md">
                <div className="w-full h-full rounded-lg bg-gradient-to-br from-idolyst-blue to-idolyst-indigo flex items-center justify-center text-white text-2xl font-bold">
                  {userProfile.avatar}
                </div>
              </div>
              
              {/* Name and Basic Info */}
              <div className="mt-4 md:mt-0 md:ml-6 md:mb-2 flex-1">
                <h1 className="text-2xl font-bold">{userProfile.name}</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  {userProfile.title} at {userProfile.company} · {userProfile.location}
                </p>
              </div>
              
              {/* Actions */}
              <div className="mt-4 md:mt-0 w-full md:w-auto flex flex-col md:flex-row gap-2">
                <button className="px-4 py-2 bg-idolyst-blue text-white rounded-lg font-medium hover:bg-idolyst-darkBlue transition-colors">
                  Follow
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Profile Details */}
          <div className="md:col-span-1">
            {/* Bio */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 mb-6">
              <h2 className="text-lg font-semibold mb-3">About</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {userProfile.bio}
              </p>
              
              {/* Level Info */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-idolyst-blue to-idolyst-indigo flex items-center justify-center text-white font-bold text-sm">
                    {userProfile.level}
                  </div>
                  <div className="ml-2">
                    <h3 className="text-sm font-medium">Level {userProfile.level} Entrepreneur</h3>
                    <div className="flex items-center mt-1">
                      {userProfile.badges.slice(0, 3).map((badge, index) => (
                        <div key={index} className="mr-1">{badge.icon}</div>
                      ))}
                      {userProfile.badges.length > 3 && (
                        <span className="text-xs text-gray-500">+{userProfile.badges.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-semibold mb-3">Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-idolyst-blue">{userProfile.stats.followers}</div>
                  <div className="text-sm text-gray-500">Followers</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-idolyst-blue">{userProfile.stats.following}</div>
                  <div className="text-sm text-gray-500">Following</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-idolyst-blue">{userProfile.stats.ideas}</div>
                  <div className="text-sm text-gray-500">Ideas</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-idolyst-blue">{userProfile.stats.mentorSessions}</div>
                  <div className="text-sm text-gray-500">Sessions</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Content Tabs */}
          <div className="md:col-span-2">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`px-4 py-3 font-medium text-sm relative ${
                    tab.id === "posts"
                      ? "text-idolyst-blue"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  {tab.label}
                  {tab.id === "posts" && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-idolyst-blue" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Content Area */}
            <div className="space-y-6">
              {/* Sample Post */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-idolyst-blue to-idolyst-indigo flex items-center justify-center text-white">
                    <span className="text-sm font-medium">JD</span>
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center">
                      <p className="text-sm font-medium">John Doe</p>
                    </div>
                    <p className="text-xs text-gray-500">Yesterday</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      Funding
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">Just closed our seed round of $1.5M</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    After months of pitching, we've secured funding from Sequoia and Y Combinator. Excited for what's next!
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <button className="mr-4 flex items-center hover:text-idolyst-blue transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M7 10v12"></path>
                        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                      </svg>
                      87
                    </button>
                    <button className="mr-4 flex items-center hover:text-idolyst-blue transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      24
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Sample Idea */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-idolyst-blue to-idolyst-indigo flex items-center justify-center text-white">
                    <span className="text-sm font-medium">JD</span>
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center">
                      <p className="text-sm font-medium">John Doe</p>
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        PitchHub Idea
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Last week</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">AI-Powered Customer Support Assistant</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    A platform that uses AI to analyze customer conversations and provide real-time guidance to support agents, helping them resolve issues faster.
                  </p>
                  
                  <div className="flex flex-wrap mb-3">
                    {["AI", "Customer Support", "SaaS"].map((tag) => (
                      <span key={tag} className="mr-2 mb-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="flex items-center mr-4 text-idolyst-blue">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="m6 9 6 6 6-6"></path>
                      </svg>
                      132 votes
                    </div>
                    <div className="flex items-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      18 comments
                    </div>
                    <div className="ml-auto">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                        2 Mentor Reviews
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
