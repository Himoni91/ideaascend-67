
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, CheckCircle2, XCircle, AlertCircle, User, Briefcase, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AppLayout from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/ui/page-transition";
import { Helmet } from "react-helmet-async";
import MentorApplicationForm from "@/components/mentor/MentorApplicationForm";

const MentorApplicationPage = () => {
  const { user } = useAuth();
  
  // If user is not logged in
  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-16">
          <Alert>
            <AlertDescription>
              You need to be logged in to apply as a mentor.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button asChild>
              <Link to="/auth/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  // If user is already a mentor
  if (user.is_mentor) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Alert className="bg-green-50 dark:bg-green-900/20">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <AlertTitle>You're already a mentor</AlertTitle>
            <AlertDescription>
              You have already been approved as a mentor. You can view your mentor profile and manage your sessions.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 flex gap-4">
            <Button asChild>
              <Link to={`/mentor-space/${user.id}`}>
                <User className="mr-2 h-4 w-4" />
                View My Mentor Profile
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/mentor-space/sessions">
                <Briefcase className="mr-2 h-4 w-4" />
                Manage Sessions
              </Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Helmet>
        <title>Become a Mentor | Idolyst</title>
      </Helmet>
      
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <ClipboardList className="mr-3 h-7 w-7 text-primary" />
              Become a Mentor
            </h1>
            <p className="text-muted-foreground max-w-3xl">
              Share your expertise and help others grow by becoming a mentor. Complete the application form below to get started.
            </p>
          </motion.div>
          
          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-10"
          >
            <h2 className="text-2xl font-bold mb-6">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <ClipboardList className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>1. Submit Application</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Fill out the mentor application form with your expertise, experience, and other relevant details.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>2. Get Approved</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our team will review your application and approve it if you meet our quality standards.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>3. Start Mentoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Set up your mentor profile, define your availability, and start accepting mentorship sessions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
          
          {/* Application Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <MentorApplicationForm />
          </motion.div>
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default MentorApplicationPage;
