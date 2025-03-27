
import React, { useState } from "react";
import { X, Upload, Plus, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PitchCategory, PitchFormData } from "@/types/pitch";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SubmitPitchFormProps {
  onSubmit: (data: PitchFormData) => void;
  isSubmitting: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

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

export default function SubmitPitchForm({ onSubmit, isSubmitting }: SubmitPitchFormProps) {
  const [tagInput, setTagInput] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof pitchFormSchema>>({
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
  });

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      
      const value = tagInput.trim();
      if (!value) return;
      
      const currentTags = form.getValues("tags");
      
      if (currentTags.includes(value)) {
        setTagInput("");
        return;
      }
      
      if (currentTags.length >= 5) {
        form.setError("tags", { message: "Maximum 5 tags" });
        return;
      }
      
      form.setValue("tags", [...currentTags, value]);
      form.clearErrors("tags");
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    const currentTags = form.getValues("tags");
    form.setValue("tags", currentTags.filter(t => t !== tag));
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      form.setValue("media_file", undefined);
      setMediaPreview(null);
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      form.setError("media_file", { message: "File size should be less than 5MB" });
      return;
    }
    
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      form.setError("media_file", { message: "Only JPEG, JPG, PNG and WEBP formats are supported" });
      return;
    }
    
    form.setValue("media_file", file);
    form.clearErrors("media_file");
    
    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearMedia = () => {
    form.setValue("media_file", undefined);
    setMediaPreview(null);
    
    // Reset the file input
    const fileInput = document.getElementById("media_file") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleFormSubmit = (values: z.infer<typeof pitchFormSchema>) => {
    const formData: PitchFormData = {
      ...values,
      media_file: values.media_file instanceof File ? values.media_file : undefined
    };
    
    onSubmit(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a catchy title for your idea" {...field} />
              </FormControl>
              <FormDescription>
                Summarize your startup idea in a compelling title
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="problem_statement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Problem Statement</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What problem does your idea solve?" 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Clearly articulate the problem your startup solves
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="target_audience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Audience</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Who is your primary user or customer?" 
                  className="min-h-[80px]" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Describe who would benefit most from your solution
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="solution"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Solution</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="How does your idea solve the problem?" 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Explain your proposed solution in detail
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PITCH_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Choose the most relevant category for your idea
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tags"
            render={() => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <div className="space-y-3">
                  <FormControl>
                    <Input
                      placeholder="Type and press Enter to add tags..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                  </FormControl>
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {form.watch("tags").map((tag) => (
                        <motion.div
                          key={tag}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge className="gap-1 px-3 py-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5"
                            >
                              <X className="h-3 w-3" />
                              <span className="sr-only">Remove {tag}</span>
                            </button>
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
                <FormDescription>
                  Add up to 5 relevant tags for your idea
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="media_file"
          render={({ field: { value, onChange, ...fieldProps }, formState }) => (
            <FormItem>
              <FormLabel>Media (Optional)</FormLabel>
              <div className="space-y-3">
                <FormControl>
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
                        {...fieldProps}
                      />
                    </label>
                  </div>
                </FormControl>
                {formState.errors.media_file && (
                  <FormMessage>{formState.errors.media_file.message?.toString()}</FormMessage>
                )}
              </div>
              <FormDescription>
                Upload an image to illustrate your idea (optional)
              </FormDescription>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="is_premium"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="flex items-center gap-2">
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
                </FormLabel>
                <FormDescription>
                  Mark as premium to boost visibility and engagement
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Submit Idea
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
