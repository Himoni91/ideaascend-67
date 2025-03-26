
import { ProfileType } from "@/types/profile";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileIdeasProps {
  profile: ProfileType;
}

export default function ProfileIdeas({ profile }: ProfileIdeasProps) {
  // This would come from the API in production
  const ideas = [
    {
      id: "1",
      title: "AI-Powered Customer Support Assistant",
      description: "A platform that uses AI to analyze customer conversations and provide real-time guidance to support agents, helping them resolve issues faster.",
      tags: ["AI", "Customer Support", "SaaS"],
      votes: 132,
      comments: 18,
      mentorReviews: 2,
      createdAt: "2023-09-20T10:15:00Z"
    }
  ];

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-6">
      {ideas.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 text-center">
          <p className="text-gray-500 dark:text-gray-400">No ideas yet</p>
        </Card>
      ) : (
        ideas.map((idea) => (
          <Card key={idea.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-300 animate-fade-in">
            <CardContent className="p-0">
              <div className="flex items-center mb-3">
                <Avatar className="w-10 h-10 rounded-full">
                  {profile.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name || "User"} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-idolyst-blue to-idolyst-indigo text-white">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="ml-3">
                  <div className="flex items-center">
                    <p className="text-sm font-medium">{profile.full_name}</p>
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      PitchHub Idea
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{new Date(idea.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">{idea.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {idea.description}
                </p>
                
                <div className="flex flex-wrap mb-3">
                  {idea.tags.map((tag) => (
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
                    {idea.votes} votes
                  </div>
                  <div className="flex items-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    {idea.comments} comments
                  </div>
                  <div className="ml-auto">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      {idea.mentorReviews} Mentor {idea.mentorReviews === 1 ? 'Review' : 'Reviews'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
