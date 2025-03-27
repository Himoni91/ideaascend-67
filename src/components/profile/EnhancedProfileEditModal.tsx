
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExtendedProfileType } from "@/types/profile-extended";
import { toast } from "sonner";
import { 
  Camera, 
  Upload, 
  X, 
  Briefcase, 
  Building, 
  MapPin, 
  Link as LinkIcon, 
  Linkedin, 
  Twitter, 
  User, 
  Pencil,
  CheckCircle,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useProfileImage } from "@/hooks/use-profile-image";
import { Separator } from "@/components/ui/separator";

interface EnhancedProfileEditModalProps {
  profile: ExtendedProfileType | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: Partial<ExtendedProfileType>) => Promise<void>;
}

export default function EnhancedProfileEditModal({
  profile,
  isOpen,
  onClose,
  onSave,
}: EnhancedProfileEditModalProps) {
  const [formData, setFormData] = useState<Partial<ExtendedProfileType>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uploadProfileImage, deleteProfileImage, isUploading, progress } = useProfileImage();

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        username: profile.username || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
        company: profile.company || "",
        position: profile.position || "",
        byline: profile.byline || "",
        linkedin_url: profile.linkedin_url || "",
        twitter_url: profile.twitter_url || "",
        expertise: profile.expertise || [],
        professional_summary: profile.professional_summary || "",
        public_email: profile.public_email || false,
      });
      setAvatarPreview(profile.avatar_url);
    }
  }, [profile]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setAvatarFile(file);
      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
    }
  };

  const clearAvatarSelection = () => {
    setAvatarFile(null);
    setAvatarPreview(profile?.avatar_url || null);
  };

  const handleDeleteAvatar = async () => {
    const confirmed = window.confirm("Are you sure you want to delete your profile image?");
    if (!confirmed) return;
    
    const success = await deleteProfileImage();
    if (success) {
      setAvatarPreview(null);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        avatarUrl = await uploadProfileImage(avatarFile);
      }

      const updatedProfile = {
        ...formData,
        avatar_url: avatarUrl,
      };
      
      await onSave(updatedProfile);
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Pencil className="mr-2 h-5 w-5" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="additional">Additional Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-6 pt-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-2 border-border">
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback className="text-3xl bg-muted">
                    {profile?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                  
                  <Label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 cursor-pointer bg-primary text-primary-foreground rounded-full p-2 shadow-md hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </Label>
                </Avatar>
                {avatarFile && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 bg-destructive text-white rounded-full p-1.5"
                    onClick={clearAvatarSelection}
                  >
                    <X size={16} />
                  </motion.button>
                )}
                
                {profile?.avatar_url && !avatarFile && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 bg-destructive/80 text-white rounded-full p-1.5"
                    onClick={handleDeleteAvatar}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                )}
              </div>
              
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              
              {isUploading && (
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
              
              {!isUploading && avatarFile && (
                <div className="text-sm text-muted-foreground flex items-center">
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  New image will be uploaded when you save
                </div>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="flex items-center">
                  <User className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name || ""}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center">
                  <span className="mr-1.5 text-muted-foreground">@</span>
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username || ""}
                  onChange={handleInputChange}
                  placeholder="johndoe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="byline" className="flex items-center">
                <CheckCircle className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                Professional Title
              </Label>
              <Input
                id="byline"
                name="byline"
                placeholder="CEO & Cofounder at Idolyst"
                value={formData.byline || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center">
                  <Building className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  Company
                </Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company || ""}
                  onChange={handleInputChange}
                  placeholder="Idolyst"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="flex items-center">
                  <Briefcase className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  Position
                </Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position || ""}
                  onChange={handleInputChange}
                  placeholder="CEO"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="flex items-center">
                <User className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                Short Bio
              </Label>
              <Textarea
                id="bio"
                name="bio"
                rows={3}
                value={formData.bio || ""}
                onChange={handleInputChange}
                placeholder="Tell us a bit about yourself"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="additional" className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="professional_summary">Professional Summary</Label>
              <Textarea
                id="professional_summary"
                name="professional_summary"
                rows={4}
                value={formData.professional_summary || ""}
                onChange={handleInputChange}
                placeholder="A detailed summary of your professional background, expertise, and what you bring to the table."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center">
                  <MapPin className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleInputChange}
                  placeholder="San Francisco, CA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center">
                  <LinkIcon className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website || ""}
                  onChange={handleInputChange}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin_url" className="flex items-center">
                  <Linkedin className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  LinkedIn URL
                </Label>
                <Input
                  id="linkedin_url"
                  name="linkedin_url"
                  value={formData.linkedin_url || ""}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter_url" className="flex items-center">
                  <Twitter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                  Twitter URL
                </Label>
                <Input
                  id="twitter_url"
                  name="twitter_url"
                  value={formData.twitter_url || ""}
                  onChange={handleInputChange}
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {(isSubmitting || isUploading) ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </motion.div>
              ) : (
                <motion.span
                  key="text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  {avatarFile ? (
                    <>
                      <Upload className="mr-2 h-4 w-4" /> Save & Upload
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
