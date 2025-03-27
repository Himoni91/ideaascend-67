
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, ArrowLeft, MailCheck, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

export default function Verification() {
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already verified, redirect to home
    if (user?.email_confirmed_at) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    
    setResendingEmail(true);
    setResendSuccess(false);
    setResendError(null);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email,
      });
      
      if (error) throw error;
      
      setResendSuccess(true);
      setCountdown(60); // 60 seconds cooldown
    } catch (error: any) {
      setResendError(error.message || "Failed to resend verification email");
    } finally {
      setResendingEmail(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <motion.div 
        className="w-full max-w-md space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-idolyst-blue to-idolyst-indigo bg-clip-text text-transparent">
            Idolyst
          </h1>
          <p className="mt-2 text-muted-foreground">
            Verify your email to complete registration
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-muted/40 shadow-lg transition-all hover:shadow-xl">
            <CardHeader className="space-y-1">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <MailCheck className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl text-center">Verify Your Email</CardTitle>
              <CardDescription className="text-center">
                We've sent a verification link to {user?.email || "your email address"}. Please check your inbox and click the link to verify your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resendSuccess && (
                <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Email Sent!</AlertTitle>
                  <AlertDescription>
                    Verification email has been resent. Please check your inbox.
                  </AlertDescription>
                </Alert>
              )}
              
              {resendError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{resendError}</AlertDescription>
                </Alert>
              )}
              
              <p className="text-sm text-muted-foreground">
                If you don't see the email in your inbox, check your spam folder. The verification link will expire after 24 hours.
              </p>
              
              <Button 
                className="w-full"
                variant="outline"
                onClick={handleResendEmail}
                disabled={resendingEmail || countdown > 0}
              >
                {resendingEmail ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : countdown > 0 ? (
                  `Resend Email (${countdown}s)`
                ) : (
                  "Resend Verification Email"
                )}
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                variant="link" 
                asChild 
                className="w-full"
              >
                <Link to="/auth/sign-in" className="flex items-center justify-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign in
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
