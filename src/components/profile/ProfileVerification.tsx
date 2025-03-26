
import { useState } from "react";
import { ExtendedProfileType } from "@/types/profile-extended";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Shield, 
  FileCheck, 
  Upload, 
  AlertCircle, 
  HelpCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useExtendedProfile } from "@/hooks/use-extended-profile";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

interface ProfileVerificationProps {
  profile: ExtendedProfileType;
}

export default function ProfileVerification({ profile }: ProfileVerificationProps) {
  const { user } = useAuth();
  const isOwnProfile = user?.id === profile.id;
  const { submitVerification } = useExtendedProfile();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      // Validate file types and sizes
      const validFiles = fileArray.filter(file => {
        const isValidType = ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max
        if (!isValidType) {
          alert(`Invalid file type: ${file.name}. Only JPEG, PNG, and PDF files are allowed.`);
        }
        if (!isValidSize) {
          alert(`File too large: ${file.name}. Maximum size is 5MB.`);
        }
        return isValidType && isValidSize;
      });
      
      setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      alert("Please upload at least one verification document");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await submitVerification(selectedFiles);
      setIsDialogOpen(false);
      setSelectedFiles([]);
      setNote("");
    } catch (error) {
      console.error("Error submitting verification:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getVerificationStatusElement = () => {
    switch (profile.verification_status) {
      case 'verified':
        return (
          <div className="flex items-center text-primary">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Verified</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center text-amber-500">
            <Clock className="h-5 w-5 mr-2" />
            <span className="font-medium">Pending Verification</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center text-destructive">
            <XCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Verification Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-muted-foreground">
            <Shield className="h-5 w-5 mr-2" />
            <span className="font-medium">Not Verified</span>
          </div>
        );
    }
  };
  
  const renderVerificationDialog = () => {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Verify Your Identity</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-md text-sm">
              <div className="flex">
                <div className="mt-0.5">
                  <HelpCircle className="h-5 w-5 text-blue-500 mr-2" />
                </div>
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-300">Verification Requirements</p>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-blue-600 dark:text-blue-200">
                    <li>Government-issued ID (passport, driver's license)</li>
                    <li>Proof of professional credentials (if applying as a mentor)</li>
                    <li>Clear, readable images or PDFs (max 5MB each)</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="verification-files">Upload Documents</Label>
              <div className="border-2 border-dashed rounded-md p-4 text-center">
                <input
                  id="verification-files"
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm mb-2">Drag and drop files or</p>
                  <Label 
                    htmlFor="verification-files" 
                    className="cursor-pointer text-primary text-sm hover:underline"
                  >
                    Browse files
                  </Label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Accepted formats: JPEG, PNG, PDF (max 5MB)
                  </p>
                </div>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Selected Files:</p>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                        <div className="flex items-center">
                          <FileCheck className="h-4 w-4 mr-2 text-primary" />
                          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="note">Additional Note (Optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any additional information you'd like to share with the verification team"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={selectedFiles.length === 0 || isSubmitting}
              className="relative"
            >
              {isSubmitting ? (
                <>
                  <span className="opacity-0">Submit Verification</span>
                  <span className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      className="h-5 w-5 border-2 border-current border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  </span>
                </>
              ) : (
                "Submit Verification"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <>
      <Card className="overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-idolyst-blue to-idolyst-indigo" />
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center">
            <Shield className="mr-2 h-5 w-5 text-idolyst-blue" />
            Identity Verification
          </CardTitle>
          <CardDescription>
            Verify your identity to access additional features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              {getVerificationStatusElement()}
              
              {profile.verification_status === 'pending' && (
                <p className="text-sm text-muted-foreground mt-2">
                  Your verification request is being reviewed. This usually takes 1-2 business days.
                </p>
              )}
              
              {profile.verification_status === 'rejected' && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">
                        Verification Rejected
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-200 mt-1">
                        Please submit a new verification request with clearer documentation.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {(profile.verification_status === 'unverified' || profile.verification_status === 'rejected') && (
                <p className="text-sm mt-2">
                  Verification gives you access to premium features such as mentor applications.
                </p>
              )}
            </div>
            
            {isOwnProfile && ['unverified', 'rejected'].includes(profile.verification_status || 'unverified') && (
              <Button onClick={() => setIsDialogOpen(true)}>
                Get Verified
              </Button>
            )}
          </div>
        </CardContent>
        {profile.verification_status === 'verified' && (
          <CardFooter className="bg-green-50 dark:bg-green-900/20 border-t py-3">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Your identity has been verified. You have access to all platform features.
              </p>
            </div>
          </CardFooter>
        )}
      </Card>
      
      {renderVerificationDialog()}
    </>
  );
}
