
import { useState } from "react";
import { HelpCircle, Search, ChevronDown, ExternalLink, LifeBuoy, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/layout/AppLayout";

const Help = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const faqs = [
    {
      question: "What is Idolyst?",
      answer: "Idolyst is a professional networking platform designed specifically for entrepreneurs and professionals. It combines features for idea sharing, mentorship, networking, and professional growth in one platform."
    },
    {
      question: "How do I connect with a mentor?",
      answer: "You can connect with mentors through the MentorSpace section. Browse available mentors, view their profiles, and book sessions with them based on their expertise and availability."
    },
    {
      question: "What is PitchHub?",
      answer: "PitchHub is a feature where entrepreneurs can submit their startup ideas, get feedback from the community and mentors, and validate their concepts through votes and comments."
    },
    {
      question: "How does the Ascend system work?",
      answer: "Ascend is our gamification system that rewards engagement. You earn XP for various activities like posting, commenting, mentoring, and sharing ideas. As you gain XP, you level up and earn badges that highlight your achievements."
    },
    {
      question: "Can I follow other users?",
      answer: "Yes, you can follow other users to see their posts, ideas, and updates in your feed. This helps you build a network of professionals relevant to your interests."
    },
    {
      question: "How do I become a mentor?",
      answer: "To become a mentor, go to your Profile Settings and apply for mentor status. You'll need to provide information about your expertise, experience, and how you can help others. Our team will review your application."
    },
    {
      question: "Is there a mobile app?",
      answer: "Currently, Idolyst is available as a mobile-optimized web application. A dedicated mobile app for iOS and Android is in development and will be released soon."
    },
    {
      question: "Are there premium features?",
      answer: "Yes, Idolyst offers premium features including priority access to top mentors, advanced analytics, featured placement for your ideas, and additional personalization options."
    }
  ];
  
  const resources = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of using Idolyst and setting up your profile",
      icon: <HelpCircle className="h-8 w-8" />,
      link: "#"
    },
    {
      title: "Mentorship Guide",
      description: "How to make the most of mentorship sessions",
      icon: <MessageSquare className="h-8 w-8" />,
      link: "#"
    },
    {
      title: "PitchHub Tutorial",
      description: "Tips for creating compelling idea pitches",
      icon: <ExternalLink className="h-8 w-8" />,
      link: "#"
    },
    {
      title: "Networking Tips",
      description: "Best practices for connecting with professionals",
      icon: <Users className="h-8 w-8" />,
      link: "#"
    }
  ];
  
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Help Center</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions and learn how to make the most of Idolyst
          </p>
        </div>
        
        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs defaultValue="faq" className="space-y-8 mb-12">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-3">
            <TabsTrigger value="faq">FAQs</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Common questions about using Idolyst
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resources">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map((resource, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-full mr-3">
                        {resource.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <CardDescription>{resource.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={resource.link}>
                        View Resource
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="contact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-3">
                      <Mail className="h-8 w-8" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Email Support</CardTitle>
                      <CardDescription>Get help within 24 hours</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our support team is available to help with any questions or issues you might have with your account.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <a href="mailto:support@idolyst.com">
                      Email Us
                    </a>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-3">
                      <LifeBuoy className="h-8 w-8" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Live Chat</CardTitle>
                      <CardDescription>Available Monday-Friday, 9AM-5PM</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get immediate assistance from our support team through live chat during business hours.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    Start Chat
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="border-t pt-8 pb-12">
          <h2 className="text-2xl font-bold text-center mb-6">Still need help?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="flex items-center">
              <LifeBuoy className="mr-2 h-5 w-5" />
              Contact Support
            </Button>
            <Button size="lg" variant="outline" className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Community Forum
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Help;

// Missing component reference
function Users(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
