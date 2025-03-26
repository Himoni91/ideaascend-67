
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useExtendedProfile } from "@/hooks/use-extended-profile";
import AppLayout from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/ui/page-transition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ProfileSummary from "@/components/profile/ProfileSummary";
import ProfileEducation from "@/components/profile/ProfileEducation";
import ProfileWorkExperience from "@/components/profile/ProfileWorkExperience";
import ProfileSkills from "@/components/profile/ProfileSkills";
import ProfilePortfolio from "@/components/profile/ProfilePortfolio";
import ProfileAchievements from "@/components/profile/ProfileAchievements";
import ProfileVerification from "@/components/profile/ProfileVerification";

export default function ProfileSettings() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, isLoading } = useExtendedProfile();
  const [activeTab, setActiveTab] = useState("basic");
  
  // Get the onboarding parameter from the URL, if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const onboardingStep = params.get('onboarding');
    
    if (onboardingStep) {
      switch (onboardingStep) {
        case 'basic':
          setActiveTab('basic');
          break;
        case 'professional':
          setActiveTab('experience');
          break;
        case 'skills':
          setActiveTab('skills');
          break;
        case 'portfolio':
          setActiveTab('portfolio');
          break;
        case 'socials':
        case 'verification':
          setActiveTab('verification');
          break;
        default:
          setActiveTab('basic');
      }
    }
  }, [location.search]);
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-pulse h-6 w-32 bg-muted mb-4 mx-auto rounded" />
            <div className="animate-pulse h-4 w-48 bg-muted mb-6 mx-auto rounded" />
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (!profile) {
    navigate('/auth/sign-in');
    return null;
  }
  
  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 pb-8 max-w-5xl">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center text-muted-foreground mb-4"
            onClick={() => navigate('/profile')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Profile Settings</h1>
              <p className="text-muted-foreground">Manage your profile details and preferences</p>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-6">
              <div className="bg-muted/20 p-4 rounded-lg mb-4">
                <h2 className="text-lg font-medium mb-2">Basic Information</h2>
                <p className="text-sm text-muted-foreground">
                  Your professional summary and core information visible to visitors.
                </p>
              </div>
              <ProfileSummary profile={profile} editable={true} />
            </TabsContent>
            
            <TabsContent value="experience" className="space-y-6">
              <div className="bg-muted/20 p-4 rounded-lg mb-4">
                <h2 className="text-lg font-medium mb-2">Professional Experience</h2>
                <p className="text-sm text-muted-foreground">
                  Your work history, education, and professional achievements.
                </p>
              </div>
              <ProfileWorkExperience profile={profile} editable={true} />
              <ProfileEducation profile={profile} editable={true} />
              <ProfileAchievements profile={profile} editable={true} />
            </TabsContent>
            
            <TabsContent value="skills" className="space-y-6">
              <div className="bg-muted/20 p-4 rounded-lg mb-4">
                <h2 className="text-lg font-medium mb-2">Skills & Expertise</h2>
                <p className="text-sm text-muted-foreground">
                  Your skills, expertise areas, and areas of professional interest.
                </p>
              </div>
              <ProfileSkills profile={profile} editable={true} />
            </TabsContent>
            
            <TabsContent value="portfolio" className="space-y-6">
              <div className="bg-muted/20 p-4 rounded-lg mb-4">
                <h2 className="text-lg font-medium mb-2">Portfolio & Projects</h2>
                <p className="text-sm text-muted-foreground">
                  Showcase your work, projects, and professional portfolio.
                </p>
              </div>
              <ProfilePortfolio profile={profile} editable={true} />
            </TabsContent>
            
            <TabsContent value="verification" className="space-y-6">
              <div className="bg-muted/20 p-4 rounded-lg mb-4">
                <h2 className="text-lg font-medium mb-2">Verification & Security</h2>
                <p className="text-sm text-muted-foreground">
                  Verify your identity and manage security settings.
                </p>
              </div>
              <ProfileVerification profile={profile} />
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
