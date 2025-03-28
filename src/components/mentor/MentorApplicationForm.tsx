
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { 
  Check, 
  ChevronsUpDown, 
  Briefcase, 
  Book, 
  DollarSign 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMentor } from "@/hooks/use-mentor";
import { MentorSpecialty } from "@/types/mentor";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const specialties: MentorSpecialty[] = [
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

// Form schema
const applicationSchema = z.object({
  bio: z.string()
    .min(100, "Bio must be at least 100 characters long")
    .max(1000, "Bio cannot exceed 1000 characters"),
  experience: z.string()
    .min(100, "Professional experience must be at least 100 characters long")
    .max(2000, "Professional experience cannot exceed 2000 characters"),
  expertise: z.array(z.string())
    .min(1, "Select at least one area of expertise")
    .max(5, "You can select up to 5 areas of expertise"),
  hourly_rate: z.preprocess(
    (value) => (value === "" ? 0 : Number(value)),
    z.number().min(0, "Hourly rate cannot be negative")
  ),
  terms_agreed: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms" }),
  }),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export default function MentorApplicationForm() {
  const { user } = useAuth();
  const { useApplyAsMentor, useMentorApplication } = useMentor();
  const applyAsMentor = useApplyAsMentor();
  const { data: existingApplication } = useMentorApplication(user?.id || "");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specialtiesOpen, setSpecialtiesOpen] = useState(false);
  
  // Form setup
  const form = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      bio: existingApplication?.bio || "",
      experience: existingApplication?.experience || "",
      expertise: existingApplication?.expertise || [],
      hourly_rate: existingApplication?.hourly_rate || 0,
      terms_agreed: false,
    },
  });
  
  // Submit handler
  async function onSubmit(values: ApplicationFormValues) {
    if (!user) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await applyAsMentor.mutateAsync({
        bio: values.bio,
        experience: values.experience,
        expertise: values.expertise,
        hourly_rate: values.hourly_rate,
      });
      
      // Success! Form will be automatically reset by React Query
    } catch (error) {
      console.error("Application submission error:", error);
      // Error is handled by React Query's onError
    } finally {
      setIsSubmitting(false);
    }
  }
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };
  
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full max-w-3xl mx-auto"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <motion.div variants={item}>
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mentor Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself, your experience, and what makes you a great mentor..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This will be displayed on your mentor profile. Highlight your expertise, accomplishments, and what you can offer as a mentor.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
          
          <motion.div variants={item}>
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Experience</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your professional background, companies you've worked with, and relevant achievements..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Share your career journey, key roles, and how your experience can benefit mentees.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
          
          <motion.div variants={item}>
            <FormField
              control={form.control}
              name="expertise"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Areas of Expertise</FormLabel>
                  <Popover open={specialtiesOpen} onOpenChange={setSpecialtiesOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={specialtiesOpen}
                          className={cn(
                            "w-full justify-between",
                            !field.value?.length && "text-muted-foreground"
                          )}
                        >
                          {field.value?.length
                            ? `${field.value.length} area${field.value.length > 1 ? "s" : ""} selected`
                            : "Select areas of expertise"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search expertise..." />
                        <CommandEmpty>No expertise found.</CommandEmpty>
                        <CommandGroup>
                          {specialties.map((specialty) => (
                            <CommandItem
                              key={specialty}
                              value={specialty}
                              onSelect={() => {
                                const current = field.value || [];
                                const updated = current.includes(specialty)
                                  ? current.filter((value) => value !== specialty)
                                  : [...current, specialty];
                                
                                if (updated.length <= 5) {
                                  field.onChange(updated);
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value?.includes(specialty)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {specialty}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value?.map((specialty) => (
                      <div
                        key={specialty}
                        className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm"
                      >
                        {specialty === "Startup Strategy" && <Briefcase className="h-3.5 w-3.5" />}
                        {specialty === "Product Development" && <Book className="h-3.5 w-3.5" />}
                        <span>{specialty}</span>
                        <button
                          type="button"
                          className="ml-1 rounded-full text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            field.onChange(
                              field.value?.filter((value) => value !== specialty)
                            );
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <FormDescription>
                    Select up to 5 areas where you can provide the most value to mentees.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
          
          <motion.div variants={item}>
            <FormField
              control={form.control}
              name="hourly_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hourly Rate (USD)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="pl-10"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Set your standard hourly rate. You can offer free or discounted sessions as well.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
          
          <motion.div variants={item}>
            <FormField
              control={form.control}
              name="terms_agreed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Terms and Conditions</FormLabel>
                    <FormDescription>
                      I agree to the mentor terms of service and code of conduct. I understand that my application will be reviewed before being approved.
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
          
          <motion.div variants={item} className="flex justify-end">
            <Button 
              type="submit" 
              size="lg"
              disabled={isSubmitting || applyAsMentor.isPending}
            >
              {(isSubmitting || applyAsMentor.isPending) ? "Submitting..." : "Submit Application"}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
}
