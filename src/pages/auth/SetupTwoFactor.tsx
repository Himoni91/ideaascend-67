
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Check, ArrowLeft, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SetupTwoFactor() {
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const { setupTwoFactor, enableTwoFactor, isAuthenticated, userVerification } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not authenticated or 2FA already enabled, redirect
    if (!isAuthenticated) {
      navigate("/auth/sign-in");
      return;
    }
    
    if (userVerification?.two_factor_enabled) {
      navigate("/profile/settings");
      return;
    }
    
    // Initialize 2FA setup
    initSetup();
  }, [isAuthenticated, userVerification, navigate]);

  async function initSetup() {
    try {
      const setupData = await setupTwoFactor();
      if (setupData) {
        setQrCode(setupData.qrCode);
        setSecret(setupData.secret);
      }
    } catch (error) {
      console.error("2FA setup error:", error);
      toast.error("Failed to set up two-factor authentication");
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    
    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await enableTwoFactor(code);
      if (success) {
        setStep(3);
      } else {
        setCode("");
      }
    } catch (error) {
      console.error("2FA verification error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(secret);
    setIsCopied(true);
    toast.success("Secret key copied to clipboard");
    setTimeout(() => setIsCopied(false), 3000);
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
            Set up two-factor authentication
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
                {step === 1 && "Scan the QR code with your authenticator app"}
                {step === 2 && "Enter the verification code from your app"}
                {step === 3 && "Two-factor authentication enabled"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    {qrCode && (
                      <img 
                        src={qrCode} 
                        alt="QR Code for two-factor authentication" 
                        className="border rounded-lg p-2 bg-white"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-center font-medium">Or enter this code manually:</p>
                    <div className="relative bg-muted p-3 rounded-md">
                      <code className="text-sm break-all">{secret}</code>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="absolute right-2 top-2"
                        onClick={copyToClipboard}
                      >
                        {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Alert variant="default">
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      Make sure to save your recovery codes in a safe place. You'll need them if you lose access to your authenticator app.
                    </AlertDescription>
                  </Alert>
                  <Button className="w-full" onClick={() => setStep(2)}>
                    Continue
                  </Button>
                </div>
              )}
              
              {step === 2 && (
                <form onSubmit={handleVerify} className="space-y-6">
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
                      "Verify & Enable"
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                </form>
              )}
              
              {step === 3 && (
                <div className="space-y-6 text-center">
                  <div className="flex justify-center">
                    <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-3">
                      <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Two-factor authentication enabled</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your account is now protected with an additional layer of security.
                    </p>
                  </div>
                  <Button className="w-full" onClick={() => navigate("/profile/settings")}>
                    Return to Settings
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              {step !== 3 && (
                <div className="text-center text-sm">
                  <Button
                    variant="link"
                    onClick={() => navigate("/profile/settings")}
                    className="text-muted-foreground w-full justify-center"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Settings
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
