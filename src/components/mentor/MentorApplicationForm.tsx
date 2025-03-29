import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  ChevronRight, 
  Check, 
  Loader2,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useMentorSpace } from "@/hooks/use-mentor-space";
import { toast } from "sonner";
import { MentorSpecialty } from "@/types/mentor";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const specialties: string[] = [
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

const MentorApplicationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { applyToBecomeMentor, getMentorApplication } = useMentorSpace();
  
  const { data: application, isLoading: isLoadingApplication } = getMentorApplication();
  
  const [step, setStep] = useState(1);
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState<string>("");
  const [isPriceNegotiable, setIsPriceNegotiable] = useState(false);
  
  const [bioError, setBioError] = useState(false);
  const [experienceError, setExperienceError] = useState(false);
  const [expertiseError, setExpertiseError] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const toggleSpecialty = (specialty: string) => {
    if (expertise.includes(specialty)) {
      setExpertise(expertise.filter(s => s !== specialty));
    } else {
      setExpertise([...expertise, specialty]);
    }
    
    if (expertiseError && expertise.length > 0) {
      setExpertiseError(false);
    }
  };
  
  const validateStep = () => {
    if (step === 1) {
      const bioValid = bio.trim().length >= 50;
      setBioError(!bioValid);
      
      if (bioValid) {
        setStep(2);
      }
    } else if (step === 2) {
      const experienceValid = experience.trim().length >= 50;
      setExperienceError(!experienceValid);
      
      if (experienceValid) {
        setStep(3);
      }
    } else if (step === 3) {
      const expertiseValid = expertise.length >= 1;
      setExpertiseError(!expertiseValid);
      
      if (expertiseValid) {
        setStep(4);
      }
    }
  };
  
  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You need to be logged in to submit an application");
      return;
    }
    
    if (expertise.length === 0) {
      setExpertiseError(true);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await applyToBecomeMentor.mutateAsync({
        bio,
        experience,
        expertise,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined
      });
      
      toast.success("Your mentor application has been submitted successfully! We'll review it shortly.");
      
      navigate("/mentor-space");
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderApplicationStatus = () => {
    if (!application) return null;
    
    const statusConfig = {
      pending: {
        icon: <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />,
        title: "Application Pending",
        description: "Your application is currently being reviewed.",
        color: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
      },
      approved: {
        icon: <Check className="h-5 w-5 text-green-500" />,
        title: "Application Approved",
        description: "Congratulations! Your application has been approved.",
        color: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
      },
      rejected: {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        title: "Application Not Approved",
        description: "We're sorry, but your application wasn't approved at this time.",
        color: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
      },
      more_info: {
        icon: <AlertTriangle className="h-5 w-5 text-blue-500" />,
        title: "More Information Required",
        description: "We need more information to process your application.",
        color: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
      }
    };
    
    const status = statusConfig[application.status as keyof typeof statusConfig];
    
    return (
      <div className={`p-4 rounded-lg border ${status.color} mb-8`}>
        <div className="flex items-start">
          <div className="mr-3 mt-0.5">{status.icon}</div>
          <div>
            <h3 className="font-medium text-lg">{status.title}</h3>
            <p className="text-muted-foreground">{status.description}</p>
            
            {application.feedback && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="font-medium">Feedback:</p>
                <p className="text-sm mt-1">{application.feedback}</p>
              </div>
            )}
            
            {application.status === 'approved' && (
              <div className="mt-4 flex gap-3">
                <Button onClick={() => navigate("/mentor-space/settings")}>
                  Set Up Your Profile
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  if (isLoadingApplication) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {renderApplicationStatus()}
      
      {(!application || application.status === 'rejected' || application.status === 'more_info') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          id="application-form"
        >
          <Card>
            <CardHeader>
              <CardTitle>Mentor Application</CardTitle>
              <CardDescription>
                {step === 1 && "Tell us about yourself and why you want to become a mentor"}
                {step === 2 && "Share your relevant experience"}
                {step === 3 && "Select your areas of expertise"}
                {step === 4 && "Set your mentorship rates (optional)"}
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {step === 1 && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="bio" className="text-base">
                        Professional Bio <span className="text-red-500">*</span>
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        Step 1 of 4
                      </span>
                    </div>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself, your background, and what makes you a good mentor."
                      value={bio}
                      onChange={(e) => {
                        setBio(e.target.value);
                        if (bioError && e.target.value.trim().length >= 50) {
                          setBioError(false);
                        }
                      }}
                      rows={6}
                      className={bioError ? "border-red-500" : ""}
                    />
                    {bioError && (
                      <p className="text-sm text-red-500">
                        Please provide a detailed bio (at least 50 characters)
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Your bio should help mentees understand your background and why you're qualified to mentor them.
                    </p>
                  </div>
                )}
                
                {step === 2 && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="experience" className="text-base">
                        Relevant Experience <span className="text-red-500">*</span>
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        Step 2 of 4
                      </span>
                    </div>
                    <Textarea
                      id="experience"
                      placeholder="Describe your professional experience relevant to mentoring. Include achievements, years of experience, and key skills."
                      value={experience}
                      onChange={(e) => {
                        setExperience(e.target.value);
                        if (experienceError && e.target.value.trim().length >= 50) {
                          setExperienceError(false);
                        }
                      }}
                      rows={6}
                      className={experienceError ? "border-red-500" : ""}
                    />
                    {experienceError && (
                      <p className="text-sm text-red-500">
                        Please provide detailed experience information (at least 50 characters)
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Your experience should demonstrate your expertise and credibility in your field.
                    </p>
                  </div>
                )}
                
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Label className="text-base">
                        Areas of Expertise <span className="text-red-500">*</span>
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        Step 3 of 4
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {specialties.map((specialty) => (
                        <div key={specialty} className="flex items-center space-x-2">
                          <Checkbox
                            id={`specialty-${specialty}`}
                            checked={expertise.includes(specialty)}
                            onCheckedChange={() => toggleSpecialty(specialty)}
                            className={expertiseError ? "border-red-500" : ""}
                          />
                          <Label 
                            htmlFor={`specialty-${specialty}`} 
                            className="cursor-pointer"
                          >
                            {specialty}
                          </Label>
                        </div>
                      ))}
                    </div>
                    
                    {expertiseError && (
                      <p className="text-sm text-red-500">
                        Please select at least one area of expertise
                      </p>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      Select all areas where you have expertise and can provide mentorship.
                    </p>
                  </div>
                )}
                
                {step === 4 && (
                  <div className="space-y-6">
                    <div className="flex justify-between">
                      <Label htmlFor="hourly-rate" className="text-base">
                        Hourly Rate (Optional)
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        Step 4 of 4
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <div className="relative w-36">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="hourly-rate"
                            type="number"
                            placeholder="e.g., 50"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            min="0"
                            className="pl-10"
                          />
                        </div>
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
                      
                      <p className="text-sm text-muted-foreground">
                        You can set your base hourly rate now and adjust it later. You can also create different rates for different session types.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={goBack}>
                    Back
                  </Button>
                )}
                
                {step < 4 ? (
                  <Button 
                    type="button" 
                    onClick={validateStep}
                    className={step === 1 && "ml-auto"}
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || expertiseError}
                  >
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
                )}
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default MentorApplicationForm;
