
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Trash2, Plus, Briefcase, GraduationCap, Globe, Link } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MentorSpecialty } from "@/types/mentor";
import { ProfileType } from "@/types/profile";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Available specialties
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
const formSchema = z.object({
  bio: z.string().min(50, "Bio should be at least 50 characters").max(1000, "Bio should not exceed 1000 characters"),
  experience: z.string().min(50, "Experience should be at least 50 characters").max(1000, "Experience should not exceed 1000 characters"),
  expertise: z.array(z.string()).min(1, "Select at least one area of expertise"),
  hourly_rate: z.number().min(0, "Hourly rate cannot be negative").optional(),
  certifications: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      issuer: z.string().min(1, "Issuer is required"),
      date: z.string().min(1, "Date is required"),
      url: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
    })
  ).optional(),
  portfolio_links: z.array(
    z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().min(1, "Description is required"),
      url: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
    })
  ).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MentorApplicationFormProps {
  profile?: ProfileType;
  onSubmit: (data: FormValues) => void;
  isSubmitting: boolean;
}

export default function MentorApplicationForm({ profile, onSubmit, isSubmitting }: MentorApplicationFormProps) {
  const [selectedExpertise, setSelectedExpertise] = useState<string[]>([]);
  
  // Initialize form with profile data if available
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: profile?.bio || "",
      experience: profile?.mentor_bio || "",
      expertise: profile?.expertise || [],
      hourly_rate: profile?.mentor_hourly_rate || 0,
      certifications: [{ name: "", issuer: "", date: "", url: "" }],
      portfolio_links: [{ title: "", description: "", url: "" }],
    },
  });
  
  // Handle certification fields
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({
    control: form.control,
    name: "certifications",
  });
  
  // Handle portfolio fields
  const { fields: portfolioFields, append: appendPortfolio, remove: removePortfolio } = useFieldArray({
    control: form.control,
    name: "portfolio_links",
  });
  
  // Toggle expertise selection
  const toggleExpertise = (value: string) => {
    form.setValue("expertise", 
      form.getValues("expertise").includes(value)
        ? form.getValues("expertise").filter(item => item !== value)
        : [...form.getValues("expertise"), value]
    );
    
    setSelectedExpertise(form.getValues("expertise"));
  };
  
  // Handle form submission
  const handleSubmit = (values: FormValues) => {
    // Filter out empty entries
    const cleanedCertifications = values.certifications?.filter(
      cert => cert.name && cert.issuer && cert.date
    );
    
    const cleanedPortfolio = values.portfolio_links?.filter(
      link => link.title && link.description
    );
    
    onSubmit({
      ...values,
      certifications: cleanedCertifications,
      portfolio_links: cleanedPortfolio,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium flex items-center">
                  <Briefcase className="mr-2 h-5 w-5 text-primary" />
                  Professional Information
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Tell us about your professional background and expertise as a mentor.
                </p>
              </div>
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your professional background, achievements, and what makes you a great mentor..."
                        {...field}
                        rows={5}
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
                    <FormLabel>Mentoring Experience</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your previous mentoring experience and approach to helping entrepreneurs..."
                        {...field}
                        rows={5}
                      />
                    </FormControl>
                    <FormDescription>
                      Share details about your mentoring style and experience.
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
                    <FormLabel>Hourly Rate (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="5"
                        placeholder="0"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        value={field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter 0 if you offer free mentoring sessions.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expertise"
                render={() => (
                  <FormItem>
                    <FormLabel>Areas of Expertise</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                      {specialties.map((specialty) => (
                        <div key={specialty} className="flex items-start space-x-2">
                          <Checkbox
                            id={`expertise-${specialty}`}
                            checked={form.getValues("expertise").includes(specialty)}
                            onCheckedChange={() => toggleExpertise(specialty)}
                          />
                          <Label
                            htmlFor={`expertise-${specialty}`}
                            className="text-sm font-normal leading-none cursor-pointer"
                          >
                            {specialty}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5 text-primary" />
                  Certifications & Credentials
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  List any relevant certifications, degrees, or credentials.
                </p>
              </div>
              
              {certFields.map((field, index) => (
                <motion.div 
                  key={field.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {index > 0 && <Separator />}
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Certification {index + 1}</h4>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCert(index)}
                        className="text-red-500 h-8 px-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certification/Degree</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., MBA, AWS Certified, PMP" {...field} />
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
                            <Input placeholder="e.g., Harvard University, AWS" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`certifications.${index}.date`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issue Date</FormLabel>
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
                          <FormLabel>Certificate URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendCert({ name: "", issuer: "", date: "", url: "" })}
                className="mt-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Certification
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium flex items-center">
                  <Globe className="mr-2 h-5 w-5 text-primary" />
                  Portfolio & Projects
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Share relevant projects, companies, or achievements that showcase your expertise.
                </p>
              </div>
              
              {portfolioFields.map((field, index) => (
                <motion.div 
                  key={field.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {index > 0 && <Separator />}
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Portfolio Item {index + 1}</h4>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removePortfolio(index)}
                        className="text-red-500 h-8 px-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`portfolio_links.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Company Name, Project Title" {...field} />
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
                          <FormLabel>URL (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Link className="h-4 w-4 mr-2 text-muted-foreground" />
                              <Input placeholder="https://..." {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name={`portfolio_links.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Briefly describe the project, your role, and outcomes..." 
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendPortfolio({ title: "", description: "", url: "" })}
                className="mt-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Another Portfolio Item
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
