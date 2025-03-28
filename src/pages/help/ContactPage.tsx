
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { SearchBar } from '@/components/help/SearchBar';
import { ContactForm } from '@/components/help/ContactForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, LifeBuoy, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const ContactPage = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <Helmet>
        <title>Contact Support | Idolyst</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4"
          onClick={() => navigate('/help')}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Help Center
        </Button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Contact Support</h1>
          <p className="text-muted-foreground">
            Can't find what you're looking for? Get in touch with our support team.
          </p>
        </motion.div>

        <div className="mb-8">
          <SearchBar />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Email</CardTitle>
                <CardDescription>Get a response within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <a 
                  href="mailto:support@idolyst.com" 
                  className="text-primary hover:underline"
                >
                  support@idolyst.com
                </a>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Live Chat</CardTitle>
                <CardDescription>Available weekdays 9am-5pm</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Start Chat
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-2">
                  <LifeBuoy className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Community</CardTitle>
                <CardDescription>Get help from the community</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://community.idolyst.com" target="_blank" rel="noopener noreferrer">
                    Join Forum
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Send a Message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ContactPage;
