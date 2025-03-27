
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, ArrowRight, Check, Lightbulb, Users, 
  PenTool, Tag, Upload, RocketIcon, Info
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PitchCategory, PitchFormData } from "@/types/pitch";
import { useIsMobile } from "@/hooks/use-mobile";
import { Progress } from "@/components/ui/progress";

// Steps for the form
type FormStep = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const formSteps: FormStep[] = [
  {
    id: "idea",
    title: "Idea Details",
    description: "What's your startup idea about?",
    icon: <Lightbulb className="h-5 w-5" />
  },
  {
    id: "problem",
    title: "Problem & Solution",
    description: "What problem does it solve?",
    icon: <PenTool className="h-5 w-5" />
  },
  {
    id: "audience",
    title: "Target Audience",
    description: "Who is this for?",
    icon: <Users className="h-5 w-5" />
  },
  {
    id: "media",
    title: "Media & Tags",
    description: "Add visuals and tags",
    icon: <Tag className="h-5 w-5" />
  }
];

// Validation schema
const pitchFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  problem_statement: z.string().min(20, "Problem statement must be at least 20 characters"),
  target_audience: z.string().min(10, "Target audience must be at least 10 characters"),
  solution: z.string().min(20, "Solution must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  tags: z.array(z.string()).min(1, "Add at least one tag").max(5, "Maximum 5 tags"),
  media_file: z.any().optional(),
  is_premium: z.boolean().default(false),
});

const PITCH_CATEGORIES: PitchCategory[] = [
  'AI',
  'Fintech',
  'Health',
  'Education',
  'E-commerce',
  'SaaS',
  'Mobile App',
  'Social Media',
  'Blockchain',
  'Gaming',
  'Environment',
  'Other'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

interface MultiStepPitchFormProps {
  onSubmit: (data: PitchFormData) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export default function MultiStepPitchForm({ 
  onSubmit, 
  isSubmitting,
  onCancel
}: MultiStepPitchFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tagInput, setTagInput] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  // Calculate progress percentage
  const progress = ((currentStep + 1) / formSteps.length) * 100;
  
  const methods = useForm<z.infer<typeof pitchFormSchema>>({
    resolver: zodResolver(pitchFormSchema),
    defaultValues: {
      title: "",
      problem_statement: "",
      target_audience: "",
      solution: "",
      category: "",
      tags: [],
      is_premium: false,
    },
    mode: "onChange"
  });
  
  const { 
    handleSubmit, 
    trigger, 
    formState: { errors, isValid },
    getValues,
    setValue,
    watch,
    clearErrors
  } = methods;

  // Check if the current step is valid before proceeding
  const validateStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof z.infer<typeof pitchFormSchema>)[] = [];
    
    switch (currentStep) {
      case 0:
        fieldsToValidate = ["title", "category"];
        break;
      case 1:
        fieldsToValidate = ["problem_statement", "solution"];
        break;
      case 2:
        fieldsToValidate = ["target_audience"];
        break;
      case 3:
        fieldsToValidate = ["tags"];
        break;
      default:
        return true;
    }
    
    const result = await trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async () => {
    const isStepValid = await validateStep();
    if (isStepValid) {
      setCurrentStep(prev => Math.min(prev + 1, formSteps.length - 1));
    } else {
      toast.error("Please fix the errors before proceeding");
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      
      const value = tagInput.trim();
      if (!value) return;
      
      const currentTags = getValues("tags");
      
      if (currentTags.includes(value)) {
        setTagInput("");
        return;
      }
      
      if (currentTags.length >= 5) {
        setValue("tags", currentTags, { shouldValidate: true });
        return;
      }
      
      setValue("tags", [...currentTags, value], { shouldValidate: true });
      clearErrors("tags");
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    const currentTags = getValues("tags");
    setValue("tags", currentTags.filter(t => t !== tag), { shouldValidate: true });
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      setValue("media_file", undefined);
      setMediaPreview(null);
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size should be less than 5MB");
      return;
    }
    
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPEG, JPG, PNG and WEBP formats are supported");
      return;
    }
    
    setValue("media_file", file);
    
    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearMedia = () => {
    setValue("media_file", undefined);
    setMediaPreview(null);
    
    // Reset the file input
    const fileInput = document.getElementById("media_file") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleFormSubmit = (values: z.infer<typeof pitchFormSchema>) => {
    const formData: PitchFormData = {
      title: values.title,
      problem_statement: values.problem_statement,
      target_audience: values.target_audience,
      solution: values.solution,
      category: values.category,
      tags: values.tags,
      is_premium: values.is_premium,
      media_file: values.media_file instanceof File ? values.media_file : undefined
    };
    
    onSubmit(formData);
  };

  return (
    <FormProvider {...methods}>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {formSteps.length}
          </p>
          <p className="text-sm font-medium">{progress.toFixed(0)}% Complete</p>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="hidden md:flex mb-8 justify-between">
        {formSteps.map((step, index) => (
          <div 
            key={step.id}
            className={`flex flex-col items-center w-full max-w-[120px] relative ${
              index < currentStep 
                ? 'text-primary' 
                : index === currentStep 
                  ? 'text-primary font-medium' 
                  : 'text-muted-foreground'
            }`}
          >
            <div className={`flex items-center justify-center h-10 w-10 rounded-full mb-2 ${
              index < currentStep 
                ? 'bg-primary text-primary-foreground' 
                : index === currentStep 
                  ? 'bg-primary/10 text-primary border-2 border-primary' 
                  : 'bg-muted text-muted-foreground'
            }`}>
              {index < currentStep ? (
                <Check className="h-5 w-5" />
              ) : (
                step.icon
              )}
            </div>
            <span className="text-sm text-center">{step.title}</span>
            
            {index < formSteps.length - 1 && (
              <div className={`absolute h-[2px] w-[calc(100%-2rem)] top-5 left-[calc(50%+1rem)] ${
                index < currentStep ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>
      
      <form className="space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="flex items-center mb-2">
                  <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="text-lg font-medium">Idea Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-medium">
                      Title <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="title"
                      className={`flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                        errors.title ? 'border-destructive' : 'border-input bg-background'
                      }`}
                      placeholder="Enter a catchy title for your idea"
                      {...methods.register("title")}
                    />
                    {errors.title && (
                      <p className="text-sm font-medium text-destructive">{errors.title.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Summarize your startup idea in a compelling title
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="category" className="block text-sm font-medium">
                      Category <span className="text-destructive">*</span>
                    </label>
                    <select
                      id="category"
                      className={`flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                        errors.category ? 'border-destructive' : 'border-input bg-background'
                      }`}
                      {...methods.register("category")}
                    >
                      <option value="">Select a category</option>
                      {PITCH_CATEGORIES.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-sm font-medium text-destructive">{errors.category.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Choose the most relevant category for your idea
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        {...methods.register("is_premium")} 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      <span className="ms-3 text-sm font-medium flex items-center gap-1">
                        Premium Idea
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Premium ideas get featured placement and higher visibility
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Mark as premium to boost visibility and engagement
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center mb-2">
                  <PenTool className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="text-lg font-medium">Problem & Solution</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="problem_statement" className="block text-sm font-medium">
                      Problem Statement <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      id="problem_statement"
                      className={`flex min-h-[120px] w-full rounded-md border px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                        errors.problem_statement ? 'border-destructive' : 'border-input bg-background'
                      }`}
                      placeholder="What problem does your idea solve?"
                      {...methods.register("problem_statement")}
                    />
                    {errors.problem_statement && (
                      <p className="text-sm font-medium text-destructive">{errors.problem_statement.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Clearly articulate the problem your startup solves
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="solution" className="block text-sm font-medium">
                      Solution <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      id="solution"
                      className={`flex min-h-[120px] w-full rounded-md border px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                        errors.solution ? 'border-destructive' : 'border-input bg-background'
                      }`}
                      placeholder="How does your idea solve the problem?"
                      {...methods.register("solution")}
                    />
                    {errors.solution && (
                      <p className="text-sm font-medium text-destructive">{errors.solution.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Explain your proposed solution in detail
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center mb-2">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="text-lg font-medium">Target Audience</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="target_audience" className="block text-sm font-medium">
                      Target Audience <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      id="target_audience"
                      className={`flex min-h-[120px] w-full rounded-md border px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                        errors.target_audience ? 'border-destructive' : 'border-input bg-background'
                      }`}
                      placeholder="Who is your primary user or customer?"
                      {...methods.register("target_audience")}
                    />
                    {errors.target_audience && (
                      <p className="text-sm font-medium text-destructive">{errors.target_audience.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Describe who would benefit most from your solution
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="flex items-center mb-2">
                  <Tag className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="text-lg font-medium">Media & Tags</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="tags-input" className="block text-sm font-medium">
                      Tags <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="tags-input"
                      className={`flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                        errors.tags ? 'border-destructive' : 'border-input bg-background'
                      }`}
                      placeholder="Type and press Enter to add tags..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                    {errors.tags && (
                      <p className="text-sm font-medium text-destructive">{errors.tags.message?.toString()}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <AnimatePresence>
                        {watch("tags").map((tag) => (
                          <motion.div
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/50"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-muted-foreground/20"
                            >
                              <span className="sr-only">Remove {tag}</span>
                              <X className="h-3 w-3" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Add up to 5 relevant tags for your idea
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="media_file" className="block text-sm font-medium">
                      Media (Optional)
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="media_file"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${
                          mediaPreview ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          {mediaPreview ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                              <img
                                src={mediaPreview}
                                alt="Preview"
                                className="max-h-24 max-w-full object-contain"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-0 right-0 h-6 w-6"
                                onClick={handleClearMedia}
                              >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remove image</span>
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                              <p className="mb-1 text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground">
                                PNG, JPG or WEBP (MAX. 5MB)
                              </p>
                            </>
                          )}
                        </div>
                        <input
                          id="media_file"
                          type="file"
                          className="hidden"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          onChange={handleMediaChange}
                        />
                      </label>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Upload an image to illustrate your idea (optional)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        <div className="flex justify-between pt-4 border-t mt-8">
          {currentStep > 0 ? (
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          
          {currentStep < formSteps.length - 1 ? (
            <Button 
              type="button" 
              onClick={nextStep}
              className="gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <RocketIcon className="h-4 w-4" />
                  Submit Idea
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
