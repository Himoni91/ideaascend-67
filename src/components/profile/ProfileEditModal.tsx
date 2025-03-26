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
import { useProfile } from "@/hooks/use-profile";
import { ProfileType } from "@/types/profile";
import { toast } from "sonner";
import { UploadCloud, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileEditModalProps {
  profile: ProfileType | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: Partial<ProfileType>) => Promise<void>;
}

export default function ProfileEditModal({
  profile,
  isOpen,
  onClose,
  onSave,
}: ProfileEditModalProps) {
  const { updateProfile, uploadAvatar, isUpdating } = useProfile();
  const [formData, setFormData] = useState<Partial<ProfileType>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleSubmit = async () => {
    try {
      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        setIsUploading(true);
        avatarUrl = await uploadAvatar(avatarFile);
        setIsUploading(false);
      }

      if (avatarUrl) {
        await onSave({
          ...formData,
          avatar_url: avatarUrl,
        });
      } else {
        await onSave(formData);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-border">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className="text-xl">
                  {profile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {avatarFile && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                  onClick={clearAvatarSelection}
                >
                  <X size={16} />
                </motion.button>
              )}
            </div>
            <Label
              htmlFor="avatar-upload"
              className="cursor-pointer text-sm text-primary"
            >
              Change Avatar
            </Label>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="byline">Byline (e.g. "CEO & Cofounder at Idolyst")</Label>
            <Input
              id="byline"
              name="byline"
              placeholder="Your professional title"
              value={formData.byline || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                value={formData.company || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                value={formData.position || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              rows={4}
              value={formData.bio || ""}
              onChange={handleInputChange}
              placeholder="Tell us about yourself"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={formData.website || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                name="linkedin_url"
                value={formData.linkedin_url || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter_url">Twitter URL</Label>
              <Input
                id="twitter_url"
                name="twitter_url"
                value={formData.twitter_url || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isUpdating || isUploading}
            className="relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {(isUpdating || isUploading) ? (
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
                      <UploadCloud className="mr-2 h-4 w-4" /> Save & Upload
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
