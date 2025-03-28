
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, X } from "lucide-react";
import { MentorSpecialty } from "@/types/mentor";
import { ProfileType } from "@/types/profile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

// Form schema with zod
const formSchema = z.object({
  bio: z.string().min(100, "Bio must be at least 100 characters").max(1000, "Bio must be less than 1000 characters"),
  experience: z.string().min(50, "Experience description must be at least 50 characters").max(1000, "Experience description must be less than 1000 characters"),
  expertise: z.array(z.string()).min(1, "Select at least one area of expertise"),
  hourly_rate: z.number().min(0, "Hourly rate must be a positive number").optional(),
  certifications: z.array(z.object({
    name: z.string().min(1, "Certification name is required"),
    issuer: z.string().min(1, "Issuer name is required"),
    date: z.string().optional(),
    url: z.string().url("Please enter a valid URL").optional().or(z.literal(''))
  })).optional(),
  portfolio_links: z.array(z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    url: z.string().url("Please enter a valid URL"),
  })).optional()
});

type FormValues = z.infer<typeof formSchema>;

interface MentorApplicationFormProps {
  profile?: ProfileType;
  onSubmit: (data: FormValues) => Promise<void>;
  isSubmitting: boolean;
}

const specialtyOptions: MentorSpecialty[] = [
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

export default function MentorApplicationForm({ 
  profile,
  onSubmit,
  isSubmitting 
}: MentorApplicationFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  
  // Pre-populate form with profile data if available
  const defaultValues: Partial<FormValues> = {
    bio: profile?.bio || "",
    experience: profile?.position && profile?.company 
      ? `${profile.position} at ${profile.company}` 
      : "",
    expertise: profile?.expertise || [],
    hourly_rate: profile?.mentor_hourly_rate || undefined,
    certifications: [],
    portfolio_links: []
  };
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange"
  });
  
  const handleFormSubmit = async (data: FormValues) => {
    await onSubmit(data);
  };
  
  const moveToNextTab = () => {
    if (activeTab === "basic") {
      setActiveTab("portfolio");
    } else if (activeTab === "portfolio") {
      form.handleSubmit(handleFormSubmit)();
    }
  };
  
  const moveToPreviousTab = () => {
    if (activeTab === "portfolio") {
      setActiveTab("basic");
    }
  };
  
  // Add a certification field
  const addCertification = () => {
    const currentCertifications = form.getValues("certifications") || [];
    form.setValue("certifications", [
      ...currentCertifications,
      { name: "", issuer: "", date: "", url: "" }
    ]);
  };
  
  // Remove a certification field
  const removeCertification = (index: number) => {
    const currentCertifications = form.getValues("certifications") || [];
    form.setValue("certifications", currentCertifications.filter((_, i) => i !== index));
  };
  
  // Add a portfolio link field
  const addPortfolioLink = () => {
    const currentLinks = form.getValues("portfolio_links") || [];
    form.setValue("portfolio_links", [
      ...currentLinks,
      { title: "", description: "", url: "" }
    ]);
  };
  
  // Remove a portfolio link field
  const removePortfolioLink = (index: number) => {
    const currentLinks = form.getValues("portfolio_links") || [];
    form.setValue("portfolio_links", currentLinks.filter((_, i) => i !== index));
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Mentor Application</CardTitle>
        <CardDescription>
          Share your expertise and help others succeed. Your application will be reviewed by our team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio & Certifications</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="mt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mentor Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your background, expertise, and what makes you a valuable mentor..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This will be displayed on your mentor profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Experience</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your relevant professional experience..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Highlight your career milestones and areas of expertise.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expertise"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Areas of Expertise</FormLabel>
                      <FormControl>
                        <Select
                          multiple
                          value={field.value}
                          onChange={field.onChange}
                          render={(selectedItems) => (
                            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[70px]">
                              {selectedItems.map((item) => (
                                <div 
                                  key={item} 
                                  className="flex items-center bg-primary/10 px-2 py-1 rounded-md"
                                >
                                  <span>{item}</span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto w-auto p-1 ml-1 rounded-full"
                                    onClick={() => field.onChange(field.value.filter(i => i !== item))}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                              {selectedItems.length === 0 && (
                                <div className="flex items-center text-muted-foreground text-sm">
                                  Select areas of expertise...
                                </div>
                              )}
                            </div>
                          )}
                        >
                          <SelectTrigger className="hidden" />
                          <SelectContent
                            className="p-0"
                            position="item-aligned"
                          >
                            <div className="max-h-[200px] overflow-auto p-1">
                              {specialtyOptions.map((specialty) => (
                                <SelectItem
                                  key={specialty}
                                  value={specialty}
                                  className="cursor-pointer"
                                >
                                  {specialty}
                                </SelectItem>
                              ))}
                            </div>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Select the areas where you can provide the most value as a mentor.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="hourly_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            className="pl-7"
                            {...field}
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Leave empty if you want to mentor for free.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4">
                  <Button
                    type="button"
                    onClick={moveToNextTab}
                    className="w-full sm:w-auto"
                  >
                    Next: Portfolio & Certifications
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="portfolio" className="mt-6 space-y-4">
                {/* Certifications */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-base">Certifications (Optional)</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCertification}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Certification
                    </Button>
                  </div>
                  
                  <FormDescription>
                    Add any relevant certifications or qualifications you have earned.
                  </FormDescription>
                  
                  <AnimatePresence>
                    {(form.watch("certifications") || []).map((_, index) => (
                      <motion.div
                        key={`cert-${index}`}
                        className="p-4 border rounded-md"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium">Certification #{index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCertification(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name={`certifications.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Certification Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., AWS Certified Solutions Architect" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`certifications.${index}.issuer`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Issuing Organization</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Amazon Web Services" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`certifications.${index}.date`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date Issued</FormLabel>
                                <FormControl>
                                  <Input type="month" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`certifications.${index}.url`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Certification URL (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://example.com/certification" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                {/* Portfolio Links */}
                <div className="space-y-3 mt-6">
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-base">Portfolio Links (Optional)</FormLabel>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addPortfolioLink}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Link
                    </Button>
                  </div>
                  
                  <FormDescription>
                    Add links to your relevant work, projects, or content that showcase your expertise.
                  </FormDescription>
                  
                  <AnimatePresence>
                    {(form.watch("portfolio_links") || []).map((_, index) => (
                      <motion.div
                        key={`link-${index}`}
                        className="p-4 border rounded-md"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium">Portfolio Item #{index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePortfolioLink(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <FormField
                            control={form.control}
                            name={`portfolio_links.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Personal Blog" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`portfolio_links.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Brief description of this resource..."
                                    className="min-h-[80px]" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`portfolio_links.${index}.url`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                <div className="pt-4 flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={moveToPreviousTab}
                  >
                    Back
                  </Button>
                  
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
