
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function TwoFactor() {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { verifyTwoFactor, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If no partial session exists or user is already authenticated, redirect
    const partialSession = localStorage.getItem('partialSession');
    if (!partialSession || isAuthenticated) {
      navigate("/auth/sign-in");
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await verifyTwoFactor(code);
      if (!success) {
        setCode("");
      }
    } catch (error) {
      console.error("2FA verification error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

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
        <motion.div 
          className="text-center"
          variants={itemVariants}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-idolyst-blue to-idolyst-indigo bg-clip-text text-transparent">
            Idolyst
          </h1>
          <p className="mt-2 text-muted-foreground">
            Enter your verification code to continue
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="border-muted/40 shadow-lg transition-all hover:shadow-xl">
            <CardHeader className="space-y-1">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl text-center">Two-Factor Authentication</CardTitle>
              <CardDescription className="text-center">
                Enter the verification code from your authenticator app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={code} onChange={setCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11" 
                  disabled={isSubmitting || code.length !== 6}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm">
                <Button
                  variant="link"
                  onClick={() => {
                    localStorage.removeItem('partialSession');
                    navigate("/auth/sign-in");
                  }}
                  className="text-destructive w-full justify-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Sign In
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
