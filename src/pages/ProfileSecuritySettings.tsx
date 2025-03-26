
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Key, Shield, AlertTriangle, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ProfileSecuritySettings() {
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, userVerification, disableTwoFactor } = useAuth();
  const navigate = useNavigate();

  async function handleDisable2FA() {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await disableTwoFactor(verificationCode);
      if (success) {
        setIsDisabling2FA(false);
        setVerificationCode("");
      }
    } catch (error) {
      console.error("Error disabling 2FA:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto space-y-8"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <Button variant="outline" onClick={() => navigate("/profile/settings")}>
            Back to Settings
          </Button>
        </div>

        <Card className="border-muted/40 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl flex items-center">
              <Key className="mr-2 h-5 w-5 text-muted-foreground" />
              Account Password
            </CardTitle>
            <CardDescription>
              Update your account password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-sm text-muted-foreground">
                  Last changed: Unknown
                </p>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigate("/auth/forgot-password")}
              >
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted/40 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl flex items-center">
              <Shield className="mr-2 h-5 w-5 text-muted-foreground" />
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication (2FA)</p>
                <p className="text-sm text-muted-foreground">
                  {userVerification?.two_factor_enabled 
                    ? "Enabled - Using authenticator app" 
                    : "Disabled - Your account is less secure"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="two-factor" 
                  checked={userVerification?.two_factor_enabled || false}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      navigate("/auth/setup-two-factor");
                    } else {
                      setIsDisabling2FA(true);
                    }
                  }}
                />
                <Label htmlFor="two-factor" className="sr-only">
                  Two-Factor Authentication
                </Label>
              </div>
            </div>
            
            {!userVerification?.two_factor_enabled && (
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-md p-3 flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-300">
                  <p className="font-medium">Your account is not protected by two-factor authentication</p>
                  <p className="mt-1">We strongly recommend enabling 2FA for additional security.</p>
                </div>
              </div>
            )}
            
            {userVerification?.two_factor_enabled && (
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-md p-3 flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-800 dark:text-green-300">
                  <p className="font-medium">Your account is protected by two-factor authentication</p>
                  <p className="mt-1">Even if someone knows your password, they'll need a verification code to access your account.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-muted/40 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-muted-foreground" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Manage your active sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Current Session</p>
                <p className="text-sm text-muted-foreground">
                  This is your current active session
                </p>
              </div>
              <Button 
                variant="destructive"
                onClick={() => {
                  // Here we would have a confirmation dialog
                  // For now, just show a toast
                  toast("This would sign out all other sessions");
                }}
              >
                Sign Out All Other Devices
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isDisabling2FA} onOpenChange={setIsDisabling2FA}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              To disable two-factor authentication, please enter the verification code from your authenticator app.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
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
          <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDisabling2FA(false);
                setVerificationCode("");
              }}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDisable2FA}
              disabled={isSubmitting || verificationCode.length !== 6}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Disable 2FA
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
