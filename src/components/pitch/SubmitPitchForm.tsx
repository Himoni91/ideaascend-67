
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Upload, PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PitchCategory, PitchFormData } from "@/types/pitch";
import { Card, CardContent } from "../ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }).max(100, {
    message: "Title must be less than 100 characters."
  }),
  problem_statement: z.string().min(20, {
    message: "Problem statement must be at least 20 characters.",
  }).max(2000, {
    message: "Problem statement must be less than 2000 characters."
  }),
  target_audience: z.string().min(10, {
    message: "Target audience must be at least 10 characters.",
  }).max(500, {
    message: "Target audience must be less than 500 characters."
  }),
  solution: z.string().min(20, {
    message: "Solution must be at least 20 characters.",
  }).max(2000, {
    message: "Solution must be less than 2000 characters."
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  tags: z.array(z.string()).min(1, {
    message: "Please add at least one tag.",
  }).max(5, {
    message: "You can add a maximum of 5 tags.",
  }),
  is_premium: z.boolean().default(false),
});

interface SubmitPitchFormProps {
  onSubmit: (data: PitchFormData) => void;
  isSubmitting: boolean;
}

export default function SubmitPitchForm({ onSubmit, isSubmitting }: SubmitPitchFormProps) {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size should be less than 5MB");
      return;
    }
    
    // Validate file type (for images)
    if (file.type.startsWith('image/') && !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Invalid image format. Please use JPEG, PNG or WebP");
      return;
    }
    
    setMediaFile(file);
    
    // Preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // For other file types, just show the name
      setMediaPreview(null);
    }
  };
  
  const removeFile = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };
  
  const addTag = () => {
    if (!tagInput.trim()) return;
    
    const currentTags = form.getValues("tags");
    
    if (currentTags.includes(tagInput.trim())) {
      toast.error("Tag already exists");
      return;
    }
    
    if (currentTags.length >= 5) {
      toast.error("You can add a maximum of 5 tags");
      return;
    }
    
    form.setValue("tags", [...currentTags, tagInput.trim()]);
    setTagInput("");
  };
  
  const removeTag = (tag: string) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag)
    );
  };

  const handleSubmitPitch = (values: z.infer<typeof formSchema>) => {
    const pitchData: PitchFormData = {
      ...values,
      media_file: mediaFile
    };
    
    onSubmit(pitchData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitPitch)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pitch Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a compelling title for your idea" {...field} />
              </FormControl>
              <FormDescription>
                A clear, concise name for your startup idea.
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
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Clearly explain the problem you're solving and why it matters.
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
                  placeholder="Who is your target audience?" 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Describe the specific users or customers who will benefit from your solution.
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
              <FormLabel>Your Solution</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="How does your idea solve the problem?" 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Explain your proposed solution and how it addresses the problem.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
                Choose the category that best describes your idea.
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
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addTag}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {form.getValues("tags").map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 rounded-full hover:bg-secondary-foreground/10 p-0.5"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {tag}</span>
                    </button>
                  </Badge>
                ))}
              </div>
              <FormDescription>
                Add up to 5 relevant tags for your idea (e.g., Mobile, AI, B2B).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel>Media (Optional)</FormLabel>
          <Card className="mt-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-center">
                <label 
                  htmlFor="media-upload" 
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-secondary/40 transition-colors"
                >
                  {!mediaFile ? (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Drag and drop or click to upload
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Images (max. 5MB)
                      </p>
                    </div>
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {mediaPreview ? (
                        <img
                          src={mediaPreview}
                          alt="Preview"
                          className="max-h-28 max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <p className="text-sm font-medium">{mediaFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(mediaFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      )}
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm"
                        onClick={removeFile}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                      </button>
                    </div>
                  )}
                  <input
                    id="media-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground mt-2">
            Upload an image to illustrate your idea (optional).
          </p>
        </div>
        
        <FormField
          control={form.control}
          name="is_premium"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  Premium Submission
                </FormLabel>
                <FormDescription>
                  Premium pitches get featured placement and priority review by mentors.
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
        
        <AnimatePresence>
          {form.formState.isSubmitting || isSubmitting ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-4"
            >
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </motion.div>
          ) : (
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting || isSubmitting}
            >
              Submit Pitch
            </Button>
          )}
        </AnimatePresence>
      </form>
    </Form>
  );
}
