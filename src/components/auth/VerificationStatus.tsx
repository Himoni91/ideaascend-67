
import { useState } from "react";
import { CheckCircle, AlertCircle, RefreshCw, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export function VerificationStatus() {
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const { user } = useAuth();

  if (!user) return null;

  const isVerified = user.email_confirmed_at !== null;

  const handleResendEmail = async () => {
    setResendingEmail(true);
    setResendSuccess(false);
    setResendError(null);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      
      if (error) throw error;
      
      setResendSuccess(true);
    } catch (error: any) {
      setResendError(error.message || "Failed to resend verification email");
    } finally {
      setResendingEmail(false);
    }
  };

  if (isVerified) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Email Verified</AlertTitle>
          <AlertDescription>
            Your email address has been verified.
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <Alert variant="destructive" className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Email Not Verified</AlertTitle>
        <AlertDescription className="flex flex-col space-y-2">
          <span>Please check your email and click the verification link to verify your account.</span>
          
          {resendSuccess && (
            <span className="text-green-600 dark:text-green-400 font-medium text-sm">
              Verification email has been resent. Please check your inbox.
            </span>
          )}
          
          {resendError && (
            <span className="text-red-600 dark:text-red-400 font-medium text-sm">
              {resendError}
            </span>
          )}
          
          <Button 
            size="sm" 
            variant="outline"
            className="w-fit"
            onClick={handleResendEmail}
            disabled={resendingEmail}
          >
            {resendingEmail ? (
              <>
                <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-3 w-3" />
                Resend Verification Email
              </>
            )}
          </Button>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}
