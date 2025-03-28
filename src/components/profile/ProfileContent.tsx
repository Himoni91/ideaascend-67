
import { useState } from "react";
import { ProfileType } from "@/types/profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfilePosts from "./ProfilePosts";
import ProfileIdeas from "./ProfileIdeas";
import ProfileBadges from "./ProfileBadges";

interface ProfileContentProps {
  profile: ProfileType;
}

export default function ProfileContent({ profile }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState<string>("posts");

  return (
    <div className="animate-fade-in">
      <Tabs defaultValue="posts" onValueChange={setActiveTab}>
        <TabsList className="flex border-b border-gray-200 dark:border-gray-800 mb-6 w-full bg-transparent overflow-x-auto no-scrollbar">
          <TabsTrigger 
            value="posts"
            className={`px-4 py-3 font-medium text-sm relative ${
              activeTab === "posts"
                ? "text-idolyst-blue"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            Posts
            {activeTab === "posts" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-idolyst-blue" />
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="ideas"
            className={`px-4 py-3 font-medium text-sm relative ${
              activeTab === "ideas"
                ? "text-idolyst-blue"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            Ideas
            {activeTab === "ideas" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-idolyst-blue" />
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="badges"
            className={`px-4 py-3 font-medium text-sm relative ${
              activeTab === "badges"
                ? "text-idolyst-blue"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            Badges
            {activeTab === "badges" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-idolyst-blue" />
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-6">
          <ProfilePosts profile={profile} />
        </TabsContent>
        
        <TabsContent value="ideas" className="space-y-6">
          <ProfileIdeas profile={profile} />
        </TabsContent>
        
        <TabsContent value="badges" className="space-y-6">
          <ProfileBadges profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
