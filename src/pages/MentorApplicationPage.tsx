
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, CheckCircle2, XCircle, AlertCircle, User, Briefcase, DollarSign, Clock, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMentor } from "@/hooks/use-mentor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/ui/page-transition";
import { MentorSpecialty } from "@/types/mentor";

export default function MentorApplicationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { useMentorApplication, applyToBecomeMentor } = useMentor();
  
  const { data: application, isLoading } = useMentorApplication();
  
  // Application form state
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [hourlyRate, setHourlyRate] = useState<number | undefined>(undefined);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [isPriceNegotiable, setIsPriceNegotiable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Available specialties
  const availableSpecialties: MentorSpecialty[] = [
    'Startup Strategy',
    'Product Development',
    'Fundraising',
    'Marketing',
    'User Acquisition',
    'Technical Architecture',
    'UX Design',
    'Business Model',
    'Team Building',
    'Pitch Deck',
    'Financial Modeling',
    'Growth Hacking',
    'Sales',
    'Customer Development',
    'Other'
  ];
  
  // Handle specialty selection
  const toggleSpecialty = (specialty: string) => {
    if (expertise.includes(specialty)) {
      setExpertise(expertise.filter(s => s !== specialty));
    } else {
      setExpertise([...expertise, specialty]);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to apply as a mentor.",
        variant: "destructive"
      });
      navigate("/auth/sign-in");
      return;
    }
    
    if (expertise.length === 0) {
      toast({
        title: "Expertise required",
        description: "Please select at least one area of expertise.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await applyToBecomeMentor({
        bio,
        experience,
        expertise,
        hourly_rate: hourlyRate
      });
      
      toast({
        title: "Application submitted",
        description: "Your mentor application has been submitted successfully. We'll review it shortly."
      });
      
      // Navigate to the mentor space
      navigate("/mentor-space");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render application status
  const renderApplicationStatus = () => {
    if (!application) return null;
    
    const statusMap = {
      pending: {
        icon: <Clock className="h-5 w-5 text-amber-500" />,
        title: "Application Pending",
        description: "Your application is currently under review. We'll notify you once it's been processed.",
        color: "bg-amber-50 dark:bg-amber-900/20"
      },
      approved: {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        title: "Application Approved",
        description: "Congratulations! Your application has been approved. You are now a mentor.",
        color: "bg-green-50 dark:bg-green-900/20"
      },
      rejected: {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        title: "Application Rejected",
        description: "We're sorry, but your application has been rejected. Please review the feedback provided.",
        color: "bg-red-50 dark:bg-red-900/20"
      },
      more_info: {
        icon: <AlertCircle className="h-5 w-5 text-blue-500" />,
        title: "Additional Information Required",
        description: "We need more information to process your application. Please check your notifications for details.",
        color: "bg-blue-50 dark:bg-blue-900/20"
      }
    };
    
    const status = statusMap[application.status as keyof typeof statusMap];
    
    return (
      <Alert className={status.color}>
        <div className="flex items-start">
          {status.icon}
          <div className="ml-3">
            <AlertTitle>{status.title}</AlertTitle>
            <AlertDescription>{status.description}</AlertDescription>
            
            {application.feedback && (
              <div className="mt-2 border-t pt-2">
                <p className="font-medium text-sm">Feedback:</p>
                <p className="text-sm">{application.feedback}</p>
              </div>
            )}
          </div>
        </div>
      </Alert>
    );
  };
  
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
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[70vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
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
                <Clock className="mr-2 h-4 w-4" />
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
              Share your expertise and help others grow by becoming a mentor. Fill out the application form below to get started.
            </p>
          </motion.div>
          
          {/* Application Status */}
          {application && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              {renderApplicationStatus()}
              
              {application.status === "approved" ? (
                <div className="mt-6 flex gap-4">
                  <Button asChild>
                    <Link to={`/mentor-space/${user.id}`}>
                      <User className="mr-2 h-4 w-4" />
                      View My Mentor Profile
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/mentor-space/sessions">
                      <Clock className="mr-2 h-4 w-4" />
                      Manage Sessions
                    </Link>
                  </Button>
                </div>
              ) : (application.status === "rejected" || application.status === "more_info") && (
                <div className="mt-4">
                  <p className="text-muted-foreground mb-2">
                    You can submit a new application with updated information.
                  </p>
                  <Button onClick={() => window.scrollTo({ top: document.getElementById("application-form")?.offsetTop, behavior: "smooth" })}>
                    Submit New Application
                  </Button>
                </div>
              )}
            </motion.div>
          )}
          
          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-12"
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
            id="application-form"
          >
            <h2 className="text-2xl font-bold mb-6">Mentor Application</h2>
            
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="bio" className="mb-2 block">
                      Professional Bio <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself, your background, and what makes you a good mentor."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={5}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="experience" className="mb-2 block">
                      Relevant Experience <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="experience"
                      placeholder="Describe your professional experience relevant to mentoring. Include achievements, years of experience, and key skills."
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      rows={5}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label className="mb-2 block">
                      Areas of Expertise <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {availableSpecialties.map((specialty) => (
                        <div key={specialty} className="flex items-center space-x-2">
                          <Checkbox
                            id={`specialty-${specialty}`}
                            checked={expertise.includes(specialty)}
                            onCheckedChange={() => toggleSpecialty(specialty)}
                          />
                          <Label htmlFor={`specialty-${specialty}`} className="cursor-pointer">
                            {specialty}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label htmlFor="hourly-rate" className="mb-2 block">
                      Hourly Rate (USD)
                    </Label>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input
                        id="hourly-rate"
                        type="number"
                        placeholder="e.g., 50"
                        value={hourlyRate === undefined ? "" : hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value ? Number(e.target.value) : undefined)}
                        min={0}
                        className="max-w-[150px]"
                      />
                      <span className="text-sm text-muted-foreground ml-2">per hour</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="price-negotiable"
                          checked={isPriceNegotiable}
                          onCheckedChange={() => setIsPriceNegotiable(!isPriceNegotiable)}
                        />
                        <Label htmlFor="price-negotiable" className="cursor-pointer">
                          Rate is negotiable
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting || !bio || !experience || expertise.length === 0}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </motion.div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
