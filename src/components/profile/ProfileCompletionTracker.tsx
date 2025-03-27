
import { useProfileCompletion } from "@/hooks/use-profile-completion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function ProfileCompletionTracker() {
  const { 
    completionPercentage, 
    steps, 
    nextStep, 
    completedStepsCount, 
    totalSteps 
  } = useProfileCompletion();
  
  return (
    <Card className="border border-muted/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Complete Your Profile</span>
          <span className="text-sm font-normal text-muted-foreground">
            {completedStepsCount}/{totalSteps} completed
          </span>
        </CardTitle>
        <CardDescription>
          Enhance your network by completing your profile
        </CardDescription>
        <Progress value={completionPercentage} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {steps.map((step) => (
            <motion.div 
              key={step.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                step.isComplete 
                  ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30" 
                  : "border-muted bg-muted/10"
              }`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  step.isComplete 
                    ? "bg-green-500 text-white" 
                    : "bg-muted/50 text-muted-foreground"
                }`}>
                  {step.isComplete ? <Check size={14} /> : <Edit size={14} />}
                </div>
                <div>
                  <div className="font-medium">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>
              
              {!step.isComplete && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="text-xs"
                >
                  <Link to="/profile/settings">
                    Update <ChevronRight size={14} className="ml-1" />
                  </Link>
                </Button>
              )}
              {step.isComplete && (
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Completed
                </div>
              )}
            </motion.div>
          ))}
          
          {nextStep && (
            <Button asChild className="w-full mt-2">
              <Link to="/profile/settings">
                {completedStepsCount === 0 ? "Start Completing Your Profile" : "Continue Completing Your Profile"}
              </Link>
            </Button>
          )}
          
          {!nextStep && completedStepsCount === totalSteps && (
            <div className="text-center py-2 text-green-600 dark:text-green-400 font-medium">
              Congratulations! Your profile is complete.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
