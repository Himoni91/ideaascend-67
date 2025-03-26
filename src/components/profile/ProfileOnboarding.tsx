
import { useState } from "react";
import { ExtendedProfileType } from "@/types/profile-extended";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useExtendedProfile } from "@/hooks/use-extended-profile";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileOnboardingProps {
  profile: ExtendedProfileType;
}

export default function ProfileOnboarding({ profile }: ProfileOnboardingProps) {
  const { updateOnboardingStep } = useExtendedProfile();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(profile.onboarding_step || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const totalSteps = 5;
  const progress = Math.round(((currentStep - 1) / totalSteps) * 100);
  
  const onboardingSteps = [
    { title: "Welcome", description: "Let's get your profile set up on Idolyst" },
    { title: "Basic Profile", description: "Add your basic information and profile picture" },
    { title: "Professional Details", description: "Tell us about your professional background" },
    { title: "Skills & Expertise", description: "What are your core skills and competencies?" },
    { title: "Connect & Verify", description: "Final steps to complete your profile" }
  ];
  
  const handleStartOnboarding = () => {
    setIsOnboardingOpen(true);
  };
  
  const handleNextStep = async () => {
    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      try {
        await updateOnboardingStep(nextStep);
      } catch (error) {
        console.error("Error updating onboarding step:", error);
      }
    } else {
      try {
        setIsSubmitting(true);
        await updateOnboardingStep(totalSteps, true);
        setIsOnboardingOpen(false);
        setIsSubmitting(false);
      } catch (error) {
        console.error("Error completing onboarding:", error);
        setIsSubmitting(false);
      }
    }
  };
  
  const navigateToPage = (page: string) => {
    setIsOnboardingOpen(false);
    navigate(page);
  };
  
  // Only show this component to users who haven't completed onboarding
  if (profile.onboarding_completed) {
    return null;
  }
  
  return (
    <>
      <Card className="mt-4 mb-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500" />
        <div className="p-6 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 md:mr-4">
            <h3 className="text-lg font-medium">Complete Your Profile</h3>
            <p className="text-muted-foreground">
              {currentStep === 1 ? 
                "Get started with your profile setup" : 
                `You've completed ${progress}% of your profile setup`}
            </p>
            <Progress value={progress} className="h-2 w-full max-w-xs mt-2" />
          </div>
          <Button onClick={handleStartOnboarding}>
            {currentStep === 1 ? "Start Setup" : "Continue Setup"}
          </Button>
        </div>
      </Card>
      
      <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {onboardingSteps[currentStep - 1].title}
            </DialogTitle>
          </DialogHeader>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-6"
            >
              {currentStep === 1 && (
                <div className="space-y-4">
                  <p>Welcome to Idolyst! Let's set up your profile to help you get the most out of the platform.</p>
                  <div className="space-y-3">
                    {onboardingSteps.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                          index < currentStep ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                        }`}>
                          {index < currentStep ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-xs">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">{step.title}</h4>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                <div className="space-y-4">
                  <p>Let's start with your basic profile information.</p>
                  <div className="rounded-lg border p-4 space-y-3">
                    <h4 className="font-medium">We'll need:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Your profile picture</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Your full name and username</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>A short bio about yourself</span>
                      </li>
                    </ul>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => navigateToPage(`/profile/settings?onboarding=basic`)}
                  >
                    Edit Basic Profile <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="space-y-4">
                  <p>Now let's add your professional details to help others understand your background.</p>
                  <div className="rounded-lg border p-4 space-y-3">
                    <h4 className="font-medium">Add details like:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Your current position and company</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Your work experience history</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Your education background</span>
                      </li>
                    </ul>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => navigateToPage(`/profile/settings?onboarding=professional`)}
                  >
                    Add Professional Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {currentStep === 4 && (
                <div className="space-y-4">
                  <p>Tell us about your skills and expertise areas.</p>
                  <div className="rounded-lg border p-4 space-y-3">
                    <h4 className="font-medium">This helps with:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Connecting you with relevant opportunities</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Finding mentors in your areas of interest</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>Showcasing your expertise to others</span>
                      </li>
                    </ul>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => navigateToPage(`/profile/settings?onboarding=skills`)}
                  >
                    Add Skills & Expertise <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {currentStep === 5 && (
                <div className="space-y-4">
                  <p>You're almost done! Just a few final steps to complete your profile.</p>
                  <div className="rounded-lg border p-4 space-y-4">
                    <div>
                      <h4 className="font-medium">Connect your socials</h4>
                      <p className="text-sm text-muted-foreground">Link your LinkedIn, Twitter, and other social profiles</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigateToPage(`/profile/settings?onboarding=socials`)}
                      >
                        Connect Socials
                      </Button>
                    </div>
                    <div>
                      <h4 className="font-medium">Verify your identity (Optional)</h4>
                      <p className="text-sm text-muted-foreground">Get verified to unlock additional features</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigateToPage(`/profile/settings?onboarding=verification`)}
                      >
                        Start Verification
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          
          <DialogFooter>
            <div className="w-full flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </div>
              <Button 
                onClick={handleNextStep}
                disabled={isSubmitting}
              >
                {currentStep < totalSteps ? "Next Step" : "Complete Setup"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
