
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PitchFormData } from "@/types/pitch";
import SubmitPitchForm from "@/components/pitch/SubmitPitchForm";
import { Steps } from "@/components/ui/steps";

interface MultiStepPitchFormProps {
  onSubmit: (data: PitchFormData) => void;
  onCancel?: () => void;
  isSubmitting: boolean;
}

export default function MultiStepPitchForm({
  onSubmit,
  onCancel,
  isSubmitting
}: MultiStepPitchFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<PitchFormData>>({});
  
  const steps = [
    { id: 1, title: "Pitch Details" },
    { id: 2, title: "Review & Submit" }
  ];
  
  const handleFormChange = (newData: Partial<PitchFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };
  
  const handleNext = () => {
    setStep(prev => Math.min(prev + 1, steps.length));
  };
  
  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };
  
  const handleSubmit = () => {
    if (formData.title && formData.problem_statement && formData.category) {
      onSubmit(formData as PitchFormData);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Steps steps={steps} currentStep={step} />
      </div>
      
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SubmitPitchForm
              onSubmit={(data) => {
                handleFormChange(data);
                handleNext();
              }}
              initialData={formData}
              isSubmitting={false}
            />
          </motion.div>
        )}
        
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-1">Pitch Title</h3>
                  <p>{formData.title}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-1">Problem Statement</h3>
                  <p className="whitespace-pre-line">{formData.problem_statement}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-1">Target Audience</h3>
                  <p className="whitespace-pre-line">{formData.target_audience}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-1">Solution</h3>
                  <p className="whitespace-pre-line">{formData.solution}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Category:</h3>
                  <p>{formData.category}</p>
                </div>
                
                {formData.tags && formData.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-1">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span key={tag} className="bg-muted px-2 py-1 rounded text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.media_file && (
                  <div>
                    <h3 className="text-lg font-medium mb-1">Media</h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.media_file.name} ({Math.round(formData.media_file.size / 1024)} KB)
                    </p>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Premium:</h3>
                  <p>{formData.is_premium ? "Yes" : "No"}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                
                <div className="flex gap-3">
                  {onCancel && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  )}
                  
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Pitch
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
