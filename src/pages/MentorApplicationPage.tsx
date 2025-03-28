
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AppLayout from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/ui/page-transition";
import MentorApplicationForm from "@/components/mentor/MentorApplicationForm";
import { useMentor } from "@/hooks/use-mentor";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function MentorApplicationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { applyToBecomeMentor, useMentorApplication } = useMentor();
  const { profile } = useProfile(user?.id);
  const { data: existingApplication, isLoading } = useMentorApplication();
  
  const handleSubmitApplication = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      await applyToBecomeMentor({
        bio: data.bio,
        experience: data.experience,
        expertise: data.expertise,
        hourly_rate: data.hourly_rate,
        certifications: data.certifications,
        portfolio_links: data.portfolio_links
      });
      
      toast.success("Your mentor application has been submitted successfully!");
      navigate("/mentor-space");
    } catch (error) {
      console.error("Application error:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check if user is already a mentor
  if (profile?.is_mentor) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              <Alert className="mb-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-400">You're already a mentor!</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-500">
                  Your mentor profile is already active. You can manage your mentor profile and availability from your dashboard.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-center mt-6">
                <Button onClick={() => navigate("/mentor-space")}>Go to Mentor Space</Button>
              </div>
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }
  
  // Show application status if already applied
  if (!isLoading && existingApplication) {
    return (
      <AppLayout>
        <PageTransition>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate(-1)}
                className="mb-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              <Alert className={`mb-6 ${
                existingApplication.status === "pending" 
                  ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800" 
                  : existingApplication.status === "approved"
                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
              }`}>
                {existingApplication.status === "pending" ? (
                  <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                ) : existingApplication.status === "approved" ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <AlertTitle className={`${
                  existingApplication.status === "pending" 
                    ? "text-blue-800 dark:text-blue-400" 
                    : existingApplication.status === "approved"
                      ? "text-green-800 dark:text-green-400"
                      : "text-red-800 dark:text-red-400"
                }`}>
                  {existingApplication.status === "pending" 
                    ? "Application Under Review" 
                    : existingApplication.status === "approved"
                      ? "Application Approved"
                      : "Application Needs Revision"}
                </AlertTitle>
                <AlertDescription className={`${
                  existingApplication.status === "pending" 
                    ? "text-blue-700 dark:text-blue-500" 
                    : existingApplication.status === "approved"
                      ? "text-green-700 dark:text-green-500"
                      : "text-red-700 dark:text-red-500"
                }`}>
                  {existingApplication.status === "pending" 
                    ? "Your application to become a mentor is currently being reviewed. We'll notify you once a decision has been made." 
                    : existingApplication.status === "approved"
                      ? "Congratulations! Your application to become a mentor has been approved. You can now set up your mentor profile."
                      : `Your application needs some changes: ${existingApplication.feedback || "Please provide more details in your application."}`}
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-center mt-6">
                <Button onClick={() => navigate("/mentor-space")}>Go to Mentor Space</Button>
              </div>
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 text-center"
            >
              <h1 className="text-3xl font-bold mb-2">Become a Mentor</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Share your expertise and help other entrepreneurs succeed. Fill out the application below to join our community of mentors.
              </p>
            </motion.div>
            
            <MentorApplicationForm 
              profile={profile}
              onSubmit={handleSubmitApplication}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
