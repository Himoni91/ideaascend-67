
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Steps({ steps, currentStep, className }: StepsProps) {
  return (
    <div className={cn("flex w-full", className)}>
      {steps.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        
        return (
          <div
            key={step.id}
            className={cn("flex-1 relative", {
              "text-muted-foreground": !isActive && !isCompleted,
            })}
          >
            {/* Step number or check icon */}
            <div
              className={cn(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors border",
                {
                  "bg-primary text-primary-foreground border-primary": isActive || isCompleted,
                  "bg-background text-foreground border-muted-foreground/30": !isActive && !isCompleted,
                }
              )}
            >
              {isCompleted ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <span>{step.id}</span>
              )}
            </div>
            
            {/* Step title and description */}
            <div className="mt-2 pr-4">
              <div
                className={cn("text-sm font-medium", {
                  "text-foreground": isActive || isCompleted,
                })}
              >
                {step.title}
              </div>
              {step.description && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {step.description}
                </div>
              )}
            </div>
            
            {/* Progress line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "absolute top-4 left-8 right-0 h-0.5 -translate-y-1/2",
                  {
                    "bg-primary": isCompleted,
                    "bg-muted-foreground/30": !isCompleted,
                  }
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
