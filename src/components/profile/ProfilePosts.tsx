
import { ProfileType } from "@/types/profile";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfilePostsProps {
  profile: ProfileType;
}

export default function ProfilePosts({ profile }: ProfilePostsProps) {
  // This would come from the API in production
  const posts = [
    {
      id: "1",
      content: "Just closed our seed round of $1.5M. After months of pitching, we've secured funding from Sequoia and Y Combinator. Excited for what's next!",
      category: "Funding",
      createdAt: "2023-10-12T15:30:00Z",
      likes: 87,
      comments: 24
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
      {posts.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 text-center">
          <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
        </Card>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 hover:shadow-md transition-all duration-300 animate-fade-in">
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
                  </div>
                  <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                    {post.category}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {post.content}
                </p>
                
                <div className="flex items-center text-sm text-gray-500">
                  <button className="mr-4 flex items-center hover:text-idolyst-blue transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M7 10v12"></path>
                      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                    </svg>
                    {post.likes}
                  </button>
                  <button className="mr-4 flex items-center hover:text-idolyst-blue transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    {post.comments}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
