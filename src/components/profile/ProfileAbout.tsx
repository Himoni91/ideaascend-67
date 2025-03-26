
import { ProfileType } from "@/types/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileAboutProps {
  profile: ProfileType;
}

export default function ProfileAbout({ profile }: ProfileAboutProps) {
  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-6 hover:shadow-md transition-shadow duration-300 animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">About</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {profile.bio || "No bio provided yet."}
        </p>
        
        {/* Level Info */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-idolyst-blue to-idolyst-indigo flex items-center justify-center text-white font-bold text-sm">
              {profile.level}
            </div>
            <div className="ml-2">
              <h3 className="text-sm font-medium">Level {profile.level} {profile.is_mentor ? "Mentor" : "Entrepreneur"}</h3>
              <div className="flex items-center mt-1">
                {profile.badges?.slice(0, 3).map((badge, index) => (
                  <div key={index} className="mr-1">{badge.icon}</div>
                ))}
                {profile.badges && profile.badges.length > 3 && (
                  <span className="text-xs text-gray-500">+{profile.badges.length - 3} more</span>
                )}
              </div>
            </div>
          </div>
          
          {/* XP Progress Bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Level {profile.level}</span>
              <span>Level {(profile.level || 0) + 1}</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-idolyst-blue to-idolyst-indigo rounded-full"
                style={{ width: `${((profile.xp || 0) % 1000) / 10}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              {profile.xp} XP
            </div>
          </div>
        </div>
        
        {/* Expertise Tags */}
        {profile.expertise && profile.expertise.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Expertise</h4>
            <div className="flex flex-wrap gap-2">
              {profile.expertise.map((skill, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Contact Links */}
        {(profile.website || profile.linkedin_url || profile.twitter_url) && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <h4 className="text-sm font-medium mb-2">Links</h4>
            <div className="space-y-2">
              {profile.website && (
                <a 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-idolyst-blue hover:underline flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
              {profile.linkedin_url && (
                <a 
                  href={profile.linkedin_url.startsWith('http') ? profile.linkedin_url : `https://${profile.linkedin_url}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-idolyst-blue hover:underline flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              )}
              {profile.twitter_url && (
                <a 
                  href={profile.twitter_url.startsWith('http') ? profile.twitter_url : `https://twitter.com/${profile.twitter_url.replace('@', '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-idolyst-blue hover:underline flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  Twitter
                </a>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
