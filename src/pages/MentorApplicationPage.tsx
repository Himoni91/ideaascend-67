
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ChevronLeft, Loader2 } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useMentor } from "@/hooks/use-mentor";
import { useAuth } from "@/contexts/AuthContext";

export default function MentorApplicationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { applyToBecomeMentor, useMentorApplication } = useMentor();
  
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user already has an application
  const { data: application, isLoading: isLoadingApplication } = useMentorApplication();
  
  // Expertises
  const expertiseOptions = [
    "Startup Strategy", "Product Development", "Fundraising", "Marketing", 
    "User Acquisition", "Technical Architecture", "UX Design", "Business Model", 
    "Team Building", "Pitch Deck", "Financial Modeling", "Growth Hacking", 
    "Sales", "Customer Development"
  ];
  
  const toggleExpertise = (expertise: string) => {
    if (selectedExpertise.includes(expertise)) {
      setSelectedExpertise(selectedExpertise.filter(e => e !== expertise));
    } else {
      setSelectedExpertise([...selectedExpertise, expertise]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to apply as a mentor");
      return;
    }
    
    if (bio.trim() === "" || experience.trim() === "" || selectedExpertise.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await applyToBecomeMentor({
        bio,
        experience,
        expertise: selectedExpertise,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined
      });
      
      toast.success("Your application has been submitted successfully!");
      navigate("/mentor-space");
    } catch (error) {
      console.error("Application error:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoadingApplication) {
    return (
      <AppLayout>
        <div className="container max-w-3xl mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }
  
  // Show application status if already applied
  if (application) {
    return (
      <AppLayout>
        <div className="container max-w-3xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/mentor-space')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Mentor Space
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle>Mentor Application Status</CardTitle>
              <CardDescription>
                You've already submitted an application to become a mentor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-md">
                <div>
                  <h3 className="font-medium">Application Status</h3>
                  <p className="text-sm text-muted-foreground">
                    Submitted on {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={
                  application.status === 'approved' ? 'bg-green-500' :
                  application.status === 'rejected' ? 'bg-red-500' :
                  application.status === 'pending' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </Badge>
              </div>
              
              {application.status === 'approved' && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <p className="text-green-700 dark:text-green-300">
                    Congratulations! Your application has been approved. You can now set up your mentor profile and start offering mentorship sessions.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => navigate('/profile/settings')}
                  >
                    Set Up Mentor Profile
                  </Button>
                </div>
              )}
              
              {application.status === 'rejected' && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
                  <p className="text-red-700 dark:text-red-300">
                    Unfortunately, your application has been rejected. If you believe this is an error, please contact our support team.
                  </p>
                  {application.feedback && (
                    <div className="mt-2">
                      <h4 className="font-medium">Feedback</h4>
                      <p className="text-sm">{application.feedback}</p>
                    </div>
                  )}
                </div>
              )}
              
              {application.status === 'pending' && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Your application is currently under review. We'll notify you once we've made a decision.
                  </p>
                </div>
              )}
              
              {application.status === 'more_info' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <p className="text-blue-700 dark:text-blue-300">
                    We need more information about your application. Please update it with the requested details.
                  </p>
                  {application.feedback && (
                    <div className="mt-2">
                      <h4 className="font-medium">Feedback</h4>
                      <p className="text-sm">{application.feedback}</p>
                    </div>
                  )}
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => navigate('/mentor-application-edit')}
                  >
                    Update Application
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/mentor-space')}
              >
                Return to Mentor Space
              </Button>
            </CardFooter>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/mentor-space')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Mentor Space
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Apply to Become a Mentor</CardTitle>
            <CardDescription>
              Share your expertise and help other entrepreneurs succeed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="bio">Mentor Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Describe your background, expertise, and what you can offer as a mentor"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This will be displayed on your mentor profile
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience">Professional Experience</Label>
                <Textarea
                  id="experience"
                  placeholder="Describe your professional experience, achievements, and qualifications relevant to mentoring"
                  rows={4}
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hourly-rate">Hourly Rate (Optional)</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="hourly-rate"
                    type="number"
                    placeholder="50"
                    min="0"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  You can set specific rates for different session types later
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Areas of Expertise</Label>
                <div className="grid grid-cols-2 gap-2">
                  {expertiseOptions.map((expertise) => (
                    <div key={expertise} className="flex items-center space-x-2">
                      <Checkbox
                        id={expertise}
                        checked={selectedExpertise.includes(expertise)}
                        onCheckedChange={() => toggleExpertise(expertise)}
                      />
                      <Label htmlFor={expertise} className="text-sm font-normal">
                        {expertise}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Application
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
