
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { 
  Award, 
  CheckCircle, 
  ChevronRight, 
  Users, 
  Star, 
  DollarSign,
  Book,
  Briefcase
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMentor } from "@/hooks/use-mentor";
import { MentorSpecialty } from "@/types/mentor";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import AppLayout from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/ui/page-transition";
import { toast } from "sonner";

// Define the form schema
const mentorApplicationSchema = z.object({
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  experience: z.string().min(20, "Experience must be at least 20 characters"),
  expertise: z.array(z.string()).min(1, "Select at least one area of expertise"),
  hourly_rate: z.number().min(0, "Rate must be a positive number").optional(),
});

type MentorApplicationFormValues = z.infer<typeof mentorApplicationSchema>;

export default function MentorApplicationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useApplyAsMentor } = useMentor();
  const applyAsMentor = useApplyAsMentor();
  
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  
  // Initialize the form
  const form = useForm<MentorApplicationFormValues>({
    resolver: zodResolver(mentorApplicationSchema),
    defaultValues: {
      bio: "",
      experience: "",
      expertise: [],
      hourly_rate: undefined,
    },
  });
  
  // Available mentor specialties
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
    'Customer Development'
  ];
  
  // Toggle expertise selection
  const toggleExpertise = (specialty: string) => {
    let updated: string[];
    
    if (selectedExpertise.includes(specialty)) {
      updated = selectedExpertise.filter(s => s !== specialty);
    } else {
      updated = [...selectedExpertise, specialty];
    }
    
    setSelectedExpertise(updated);
    form.setValue("expertise", updated, { shouldValidate: true });
  };
  
  // Handle form submission
  const onSubmit = async (values: MentorApplicationFormValues) => {
    try {
      await applyAsMentor.mutateAsync({
        bio: values.bio,
        experience: values.experience,
        expertise: values.expertise,
        hourly_rate: values.hourly_rate
      });
      
      toast.success("Your mentor application has been submitted successfully!");
      navigate("/mentor-space");
    } catch (error) {
      console.error("Application error:", error);
      toast.error("Failed to submit your application. Please try again.");
    }
  };
  
  if (!user) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <Award className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Sign in to Apply</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Please sign in to apply as a mentor. Creating an account only takes a minute.
          </p>
          <Button asChild>
            <a href="/auth/sign-in">Sign In</a>
          </Button>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center max-w-3xl mx-auto mb-10"
          >
            <h1 className="text-4xl font-bold mb-4">Become a Mentor</h1>
            <p className="text-lg text-muted-foreground">
              Share your expertise, help entrepreneurs grow, and earn while making an impact
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Mentor Application</CardTitle>
                <CardDescription>
                  Tell us about your professional experience and expertise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Bio */}
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Share your background, achievements, and why you want to be a mentor..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This will be displayed on your mentor profile
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Experience */}
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mentorship Experience</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe any previous mentoring experience or relevant leadership roles..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Share your approach to helping others grow
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Expertise Areas */}
                    <FormField
                      control={form.control}
                      name="expertise"
                      render={() => (
                        <FormItem>
                          <FormLabel>Areas of Expertise</FormLabel>
                          <FormDescription className="mb-3">
                            Select areas where you can provide the most value
                          </FormDescription>
                          <div className="flex flex-wrap gap-2">
                            {specialties.map((specialty) => (
                              <Badge
                                key={specialty}
                                variant={selectedExpertise.includes(specialty) ? "default" : "outline"}
                                className="cursor-pointer py-1.5 px-3"
                                onClick={() => toggleExpertise(specialty)}
                              >
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Hourly Rate */}
                    <FormField
                      control={form.control}
                      name="hourly_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate (USD)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                placeholder="0"
                                className="pl-10"
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value === "" ? undefined : Number(e.target.value);
                                  field.onChange(value);
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Leave empty or set to 0 if you're offering free sessions
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={applyAsMentor.isPending}
                      >
                        {applyAsMentor.isPending ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Why Become a Mentor?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Share Your Knowledge</h3>
                      <p className="text-sm text-muted-foreground">
                        Help entrepreneurs avoid common pitfalls by sharing your experience
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Expand Your Network</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect with motivated founders and other mentors
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Earn Income</h3>
                      <p className="text-sm text-muted-foreground">
                        Set your own rates and schedule for mentorship sessions
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Award className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Recognition</h3>
                      <p className="text-sm text-muted-foreground">
                        Build your reputation as a thought leader in your field
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Application Process</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium">Complete Application</h3>
                      <p className="text-sm text-muted-foreground">
                        Fill out the form with your professional background
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium">Review Process</h3>
                      <p className="text-sm text-muted-foreground">
                        Our team reviews your application (1-3 business days)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium">Set Up Availability</h3>
                      <p className="text-sm text-muted-foreground">
                        Add your availability calendar and session types
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      4
                    </div>
                    <div>
                      <h3 className="font-medium">Start Mentoring</h3>
                      <p className="text-sm text-muted-foreground">
                        Accept booking requests and help entrepreneurs grow
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
