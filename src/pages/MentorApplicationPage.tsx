
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  Award, 
  Lightbulb, 
  Rocket, 
  Users,
  Calendar
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMentor } from "@/hooks/use-mentor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AppLayout from "@/components/layout/AppLayout";
import MentorApplicationForm from "@/components/mentor/MentorApplicationForm";
import { PageTransition } from "@/components/ui/page-transition";
import { toast } from "sonner";

export default function MentorApplicationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("why-mentor");
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  
  // Query the user's application status
  const { useMentorApplication } = useMentor();
  const { data: application, isLoading } = useMentorApplication(user?.id || "");
  
  // If application already exists, set submitted state
  useEffect(() => {
    if (application) {
      setApplicationSubmitted(true);
      
      if (application.status === 'approved') {
        toast.success("Your application has been approved! You are now a mentor.");
        navigate("/mentor-space");
      }
    }
  }, [application, navigate]);
  
  // Benefits of mentoring items
  const benefits = [
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "Build Your Reputation",
      description: "Establish yourself as a thought leader in your field, gaining recognition for your expertise."
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-yellow-500" />,
      title: "Share Your Knowledge",
      description: "Pass on your hard-earned wisdom to help others avoid common pitfalls and accelerate their growth."
    },
    {
      icon: <Rocket className="h-8 w-8 text-blue-500" />,
      title: "Expand Your Network",
      description: "Connect with ambitious professionals and entrepreneurs, potentially leading to new opportunities."
    },
    {
      icon: <Users className="h-8 w-8 text-green-500" />,
      title: "Develop Leadership Skills",
      description: "Enhance your coaching and leadership abilities through regular mentoring interactions."
    }
  ];
  
  // FAQ items
  const faqs = [
    {
      question: "What qualifications do I need to become a mentor?",
      answer: "We're looking for professionals with substantial experience in their field. This typically means at least 3+ years of industry experience, with demonstrated expertise in specific areas like fundraising, product development, or marketing. However, we value diverse perspectives, so don't hesitate to apply even if you have an unconventional background but strong expertise to share."
    },
    {
      question: "How much time do I need to commit?",
      answer: "Mentoring is flexible and fits your schedule. You can set your availability and the number of sessions you're willing to take on each week or month. Some mentors dedicate as little as 1-2 hours per week, while others offer more extensive availability."
    },
    {
      question: "Can I set my own rates for mentoring sessions?",
      answer: "Yes! You have complete control over your pricing. You can set different rates for different types of sessions, offer special rates for certain mentees, or even provide free introductory sessions if you wish."
    },
    {
      question: "How long does the application review process take?",
      answer: "We typically review mentor applications within 1-2 weeks. During the review, we assess your expertise, experience, and the potential value you can bring to our community of entrepreneurs and professionals."
    },
    {
      question: "What support do I receive as a mentor?",
      answer: "We provide tools to manage your availability, session bookings, and communications with mentees. You'll also have access to resources to help you become an effective mentor, and you'll join our community of mentors for peer support and knowledge sharing."
    }
  ];
  
  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">Become a Mentor</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Share your expertise, guide fellow professionals, and make a meaningful impact while building your reputation.
            </p>
          </motion.div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Info Section */}
            <div className="lg:col-span-5">
              <Tabs defaultValue="why-mentor" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="why-mentor">Why Mentor</TabsTrigger>
                  <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                </TabsList>
                
                <TabsContent value="why-mentor" className="mt-0">
                  <div className="space-y-8">
                    {benefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex gap-4"
                      >
                        <div className="h-12 w-12 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                          {benefit.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-medium mb-2">{benefit.title}</h3>
                          <p className="text-muted-foreground">{benefit.description}</p>
                        </div>
                      </motion.div>
                    ))}
                    
                    <div className="pt-6">
                      <Button 
                        size="lg" 
                        onClick={() => setActiveTab("how-it-works")}
                        className="w-full md:w-auto"
                      >
                        Learn More
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="how-it-works" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>How Mentoring Works on Idolyst</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                            1
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">Apply to become a mentor</h3>
                            <p className="text-muted-foreground">
                              Complete our application process by sharing your expertise, experience, and what you can offer mentees.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-4 items-start">
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                            2
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">Set your availability</h3>
                            <p className="text-muted-foreground">
                              Once approved, set your availability and session types. You control when and how you want to mentor.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-4 items-start">
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                            3
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">Receive booking requests</h3>
                            <p className="text-muted-foreground">
                              Mentees will book sessions based on your expertise and availability. You'll be notified of new bookings.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-4 items-start">
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                            4
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">Conduct sessions</h3>
                            <p className="text-muted-foreground">
                              Connect with mentees through our platform for video calls or chat-based sessions, providing guidance and feedback.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-4 items-start">
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                            5
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">Receive reviews and build reputation</h3>
                            <p className="text-muted-foreground">
                              After sessions, mentees can leave reviews, which helps build your mentor profile and reputation.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button 
                          size="lg" 
                          onClick={() => setActiveTab("faq")}
                          className="w-full md:w-auto"
                        >
                          View FAQs
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="faq" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Frequently Asked Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                          <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      
                      <div className="pt-6">
                        <Button 
                          size="lg" 
                          onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })}
                          className="w-full md:w-auto"
                        >
                          Apply Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <div className="mt-8 hidden lg:block">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      Your Mentoring Journey
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Join our community of mentors who are making a difference in the careers and ventures of others. As a mentor, you'll have the opportunity to:
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span>Build a personal brand as a thought leader</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span>Earn additional income through paid sessions</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span>Access exclusive mentor-only content and events</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span>Contribute to the success of emerging professionals</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Application Form */}
            <div className="lg:col-span-7" id="application-form">
              <Card>
                <CardHeader>
                  <CardTitle>Mentor Application</CardTitle>
                </CardHeader>
                <CardContent>
                  {!user ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                      <h3 className="text-lg font-medium mb-2">Sign in to apply</h3>
                      <p className="text-muted-foreground mb-4">
                        You need to be signed in to apply as a mentor.
                      </p>
                      <Button size="lg" onClick={() => navigate("/auth/sign-in")}>
                        Sign In
                      </Button>
                    </div>
                  ) : applicationSubmitted ? (
                    <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <AlertTitle>Application Submitted</AlertTitle>
                      <AlertDescription>
                        Thank you for applying to become a mentor! We are reviewing your application and will get back to you soon.
                        {application?.status === 'pending' && (
                          <div className="mt-2">
                            <strong>Status:</strong> Pending Review
                          </div>
                        )}
                        {application?.status === 'more_info' && (
                          <div className="mt-2">
                            <strong>Status:</strong> Additional Information Requested
                            <p className="mt-1">{application.feedback}</p>
                            <Button className="mt-3" variant="outline" size="sm">
                              Update Application
                            </Button>
                          </div>
                        )}
                        {application?.status === 'rejected' && (
                          <div className="mt-2">
                            <strong>Status:</strong> Not Approved
                            <p className="mt-1">{application.feedback || "We're sorry, but your application didn't meet our current requirements."}</p>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <p className="text-muted-foreground mb-6">
                        Tell us about your expertise and experience to apply as a mentor. Our team will review your application within 1-2 weeks.
                      </p>
                      <MentorApplicationForm />
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
