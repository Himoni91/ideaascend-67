
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useHelpCenter } from '@/hooks/use-help-center';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(100, 'Name is too long').optional(),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject is too short').max(100, 'Subject is too long'),
  message: z.string().min(10, 'Message is too short').max(1000, 'Message is too long'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactForm() {
  const { submitContactForm } = useHelpCenter();
  const { user } = useAuth();
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    // Ensure all required fields are present
    const formData = {
      name: data.name || '',
      email: data.email, // This should never be empty due to validation
      subject: data.subject,
      message: data.message
    };
    
    submitContactForm.mutate(formData, {
      onSuccess: () => {
        form.reset({
          name: user?.user_metadata?.full_name || '',
          email: user?.email || '',
          subject: '',
          message: '',
        });
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input placeholder="How can we help?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Please describe your issue or question in detail..." 
                    className="min-h-32 resize-y"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Please provide as much detail as possible so we can better assist you.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            size="lg" 
            className="w-full md:w-auto"
            disabled={submitContactForm.isPending}
          >
            {submitContactForm.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
