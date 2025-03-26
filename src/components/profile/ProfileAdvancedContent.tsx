
import { useState } from "react";
import { ExtendedProfileType } from "@/types/profile-extended";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfilePosts from "./ProfilePosts";
import ProfileIdeas from "./ProfileIdeas";
import ProfileSessions from "./ProfileSessions";
import ProfileBadges from "./ProfileBadges";
import ProfilePortfolio from "./ProfilePortfolio";
import ProfileWorkExperience from "./ProfileWorkExperience";
import ProfileEducation from "./ProfileEducation";
import ProfileSkills from "./ProfileSkills";
import ProfileSummary from "./ProfileSummary";
import ProfileAchievements from "./ProfileAchievements";
import { ProfileTab } from "@/types/profile-extended";

interface ProfileAdvancedContentProps {
  profile: ExtendedProfileType;
  isOwnProfile: boolean;
}

export default function ProfileAdvancedContent({ profile, isOwnProfile }: ProfileAdvancedContentProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>("about");

  return (
    <div className="animate-fade-in">
      <Tabs defaultValue="about" onValueChange={(value) => setActiveTab(value as ProfileTab)}>
        <TabsList className="flex border-b border-gray-200 dark:border-gray-800 mb-6 w-full bg-transparent overflow-x-auto no-scrollbar">
          <TabsTrigger 
            value="about"
            className={`px-4 py-3 font-medium text-sm relative ${
              activeTab === "about"
                ? "text-idolyst-blue"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            About
            {activeTab === "about" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-idolyst-blue" />
            )}
          </TabsTrigger>
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
            value="sessions"
            className={`px-4 py-3 font-medium text-sm relative ${
              activeTab === "sessions"
                ? "text-idolyst-blue"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            Mentor Sessions
            {activeTab === "sessions" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-idolyst-blue" />
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="portfolio"
            className={`px-4 py-3 font-medium text-sm relative ${
              activeTab === "portfolio"
                ? "text-idolyst-blue"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            Portfolio
            {activeTab === "portfolio" && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-idolyst-blue" />
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="experience"
            className={`px-4 py-3 font-medium text-sm relative ${
              activeTab === "experience"
                ? "text-idolyst-blue"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
          >
            Experience
            {activeTab === "experience" && (
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
        
        <TabsContent value="about" className="space-y-6">
          <ProfileSummary profile={profile} editable={isOwnProfile} />
          <ProfileSkills profile={profile} editable={isOwnProfile} />
          <ProfileAchievements profile={profile} editable={isOwnProfile} />
        </TabsContent>
        
        <TabsContent value="posts" className="space-y-6">
          <ProfilePosts profile={profile} />
        </TabsContent>
        
        <TabsContent value="ideas" className="space-y-6">
          <ProfileIdeas profile={profile} />
        </TabsContent>
        
        <TabsContent value="sessions" className="space-y-6">
          <ProfileSessions profile={profile} />
        </TabsContent>
        
        <TabsContent value="portfolio" className="space-y-6">
          <ProfilePortfolio profile={profile} editable={isOwnProfile} />
        </TabsContent>
        
        <TabsContent value="experience" className="space-y-6">
          <ProfileWorkExperience profile={profile} editable={isOwnProfile} />
          <ProfileEducation profile={profile} editable={isOwnProfile} />
        </TabsContent>
        
        <TabsContent value="badges" className="space-y-6">
          <ProfileBadges profile={profile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
