
import { useState, useEffect } from "react";
import { ProfileType } from "@/types/profile";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Save, Upload, PlusCircle, Minus } from "lucide-react";
import { toast } from "sonner";

interface ProfileEditModalProps {
  profile: ProfileType;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: Partial<ProfileType>) => void;
}

export default function ProfileEditModal({ 
  profile, 
  isOpen, 
  onClose, 
  onSave 
}: ProfileEditModalProps) {
  const [formData, setFormData] = useState<Partial<ProfileType>>({});
  const [expertiseInput, setExpertiseInput] = useState("");
  
  // Reset form when profile changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        position: profile.position || "",
        company: profile.company || "",
        location: profile.location || "",
        website: profile.website || "",
        linkedin_url: profile.linkedin_url || "",
        twitter_url: profile.twitter_url || "",
        expertise: [...(profile.expertise || [])]
      });
    }
  }, [profile, isOpen]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleAddExpertise = () => {
    if (!expertiseInput.trim()) return;
    
    setFormData((prev) => ({
      ...prev,
      expertise: [...(prev.expertise || []), expertiseInput.trim()]
    }));
    setExpertiseInput("");
  };
  
  const handleRemoveExpertise = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise?.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const handleAvatarUpload = () => {
    // In production, this would implement a file upload to Supabase Storage
    toast.info("Avatar upload functionality will be implemented soon");
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Avatar upload */}
          <div className="flex flex-col items-center">
            <Avatar className="w-24 h-24 rounded-full">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.full_name || "User"} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-idolyst-blue to-idolyst-indigo text-white text-2xl">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              )}
            </Avatar>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={handleAvatarUpload}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
          </div>
          
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name || ""}
                  onChange={handleChange}
                  placeholder="Your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleChange}
                  placeholder="Tell others about yourself"
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          {/* Professional Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Professional Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position || ""}
                  onChange={handleChange}
                  placeholder="Your job title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company || ""}
                  onChange={handleChange}
                  placeholder="Your company"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleChange}
                  placeholder="City, Country"
                />
              </div>
            </div>
          </div>
          
          {/* Expertise/Skills */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Areas of Expertise</h3>
            
            <div className="flex gap-2">
              <Input
                value={expertiseInput}
                onChange={(e) => setExpertiseInput(e.target.value)}
                placeholder="Add a skill or expertise"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddExpertise();
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={handleAddExpertise}
                size="icon"
                variant="outline"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.expertise?.map((skill, index) => (
                <div 
                  key={index} 
                  className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium flex items-center group"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveExpertise(index)}
                    className="ml-2 text-blue-400 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200 focus:outline-none"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {formData.expertise?.length === 0 && (
                <p className="text-sm text-gray-500">No expertise added yet</p>
              )}
            </div>
          </div>
          
          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Social Links</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website || ""}
                  onChange={handleChange}
                  placeholder="https://yourdomain.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn</Label>
                <Input
                  id="linkedin_url"
                  name="linkedin_url"
                  value={formData.linkedin_url || ""}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourusername"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="twitter_url">Twitter</Label>
                <Input
                  id="twitter_url"
                  name="twitter_url"
                  value={formData.twitter_url || ""}
                  onChange={handleChange}
                  placeholder="https://twitter.com/yourusername"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
