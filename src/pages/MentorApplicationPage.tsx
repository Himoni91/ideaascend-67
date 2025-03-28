
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMentor } from "@/hooks/use-mentor";
import { useMentorApplication } from "@/hooks/use-mentor-application";
import MentorApplicationForm from "@/components/mentor/MentorApplicationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MentorApplication } from "@/types/mentor";

export default function MentorApplicationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const { data: application, isLoading } = useMentorApplication(user?.id || "");
  
  useEffect(() => {
    // If user is already a mentor, redirect to mentor profile
    if (user?.user_metadata?.is_mentor) {
      navigate("/mentor-profile");
    }
  }, [user, navigate]);
  
  // Show application status or form
  const renderApplicationStatus = () => {
    if (!application) {
      return (
        <Button 
          onClick={() => setShowForm(true)} 
          size="lg" 
          className="mt-8 animate-pulse"
        >
          Apply to become a mentor
        </Button>
      );
    }
    
    switch (application.status) {
      case "pending":
        return (
          <Alert className="mt-8 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle className="text-yellow-600 dark:text-yellow-400">Application Under Review</AlertTitle>
            <AlertDescription>
              Your application is being reviewed by our team. This usually takes 1-3 business days.
            </AlertDescription>
          </Alert>
        );
      case "approved":
        return (
          <Alert className="mt-8 border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertTitle className="text-green-600 dark:text-green-400">Application Approved!</AlertTitle>
            <AlertDescription>
              Congratulations! Your application has been approved. You can now access your mentor dashboard.
              <Button 
                variant="outline" 
                className="mt-4 w-full"
                onClick={() => navigate("/mentor-profile")}
              >
                Go to Mentor Dashboard
              </Button>
            </AlertDescription>
          </Alert>
        );
      case "rejected":
        return (
          <Alert className="mt-8 border-red-200 bg-red-50 dark:bg-red-900/20">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <AlertTitle className="text-red-600 dark:text-red-400">Application Declined</AlertTitle>
            <AlertDescription>
              Unfortunately, your application did not meet our current criteria. You can apply again after 30 days.
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center p-12">Loading...</div>;
  }
  
  return (
    <div className="container max-w-4xl py-8 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Become a Mentor</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Share your expertise with entrepreneurs and help shape the next generation of startups.
        </p>
        
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Why Become a Mentor?</CardTitle>
              <CardDescription>The benefits of joining our mentor network</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">🌟 Expand Your Network</h3>
                <p className="text-sm text-muted-foreground">Connect with innovative founders and other experienced mentors.</p>
              </div>
              <div>
                <h3 className="font-medium">💼 Build Your Portfolio</h3>
                <p className="text-sm text-muted-foreground">Add mentorship experience to your professional credentials.</p>
              </div>
              <div>
                <h3 className="font-medium">💰 Earn Side Income</h3>
                <p className="text-sm text-muted-foreground">Set your own rates and schedule for mentoring sessions.</p>
              </div>
              <div>
                <h3 className="font-medium">🚀 Support Innovation</h3>
                <p className="text-sm text-muted-foreground">Help entrepreneurs turn their ideas into successful ventures.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>What We Look For</CardTitle>
              <CardDescription>Qualities of successful mentors on our platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">⭐ Expertise & Experience</h3>
                <p className="text-sm text-muted-foreground">Domain expertise in startup-related fields with verifiable experience.</p>
              </div>
              <div>
                <h3 className="font-medium">🤝 Commitment</h3>
                <p className="text-sm text-muted-foreground">Willingness to provide consistent availability and quality guidance.</p>
              </div>
              <div>
                <h3 className="font-medium">📈 Track Record</h3>
                <p className="text-sm text-muted-foreground">Demonstrated success in areas you plan to mentor in.</p>
              </div>
              <div>
                <h3 className="font-medium">💬 Communication</h3>
                <p className="text-sm text-muted-foreground">Ability to explain complex concepts and provide constructive feedback.</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {showForm ? (
          <div className="mt-8">
            <h2 className="text-2xl font-bold">Mentor Application</h2>
            <p className="mt-2 text-muted-foreground">
              Please provide the following information to apply as a mentor.
            </p>
            <div className="mt-6">
              <MentorApplicationForm />
            </div>
          </div>
        ) : (
          renderApplicationStatus()
        )}
      </motion.div>
    </div>
  );
}
