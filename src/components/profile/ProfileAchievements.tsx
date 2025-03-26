
import { useState } from "react";
import { ExtendedProfileType, Achievement } from "@/types/profile-extended";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Calendar, Plus, Edit, Trash2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useExtendedProfile } from "@/hooks/use-extended-profile";
import { motion } from "framer-motion";

interface ProfileAchievementsProps {
  profile: ExtendedProfileType;
  editable?: boolean;
}

export default function ProfileAchievements({ profile, editable = false }: ProfileAchievementsProps) {
  const { updateProfile } = useExtendedProfile();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);
  
  const achievements = profile.achievements || [];
  
  const handleAdd = () => {
    setCurrentAchievement({
      title: "",
      description: "",
      date: new Date().toISOString().split('T')[0]
    });
    setIsAddDialogOpen(true);
  };
  
  const handleEdit = (index: number) => {
    setCurrentAchievement(achievements[index]);
    setEditIndex(index);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = async (index: number) => {
    if (!confirm("Are you sure you want to remove this achievement?")) return;
    
    const newAchievements = [...achievements];
    newAchievements.splice(index, 1);
    
    try {
      await updateProfile({ achievements: newAchievements });
    } catch (error) {
      console.error("Failed to delete achievement:", error);
    }
  };
  
  const handleSave = async () => {
    if (!currentAchievement) return;
    
    // Format date
    if (currentAchievement.date) {
      currentAchievement.date = new Date(currentAchievement.date).toISOString().split('T')[0];
    }
    
    try {
      const newAchievements = [...achievements];
      
      if (isEditDialogOpen && editIndex >= 0) {
        // Edit existing
        newAchievements[editIndex] = currentAchievement;
      } else {
        // Add new
        newAchievements.push(currentAchievement);
      }
      
      await updateProfile({ achievements: newAchievements });
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to save achievement:", error);
    }
  };
  
  const renderAchievementDialog = () => {
    const isOpen = isAddDialogOpen || isEditDialogOpen;
    const title = isAddDialogOpen ? "Add Achievement" : "Edit Achievement";
    
    return (
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
        }
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Achievement Title</Label>
              <Input
                id="title"
                value={currentAchievement?.title || ""}
                onChange={(e) => setCurrentAchievement(prev => 
                  prev ? { ...prev, title: e.target.value } : null
                )}
                placeholder="e.g. Best App Design Award"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date Received</Label>
              <Input
                id="date"
                type="date"
                value={currentAchievement?.date ? new Date(currentAchievement.date).toISOString().split('T')[0] : ""}
                onChange={(e) => setCurrentAchievement(prev => 
                  prev ? { ...prev, date: e.target.value } : null
                )}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentAchievement?.description || ""}
                onChange={(e) => setCurrentAchievement(prev => 
                  prev ? { ...prev, description: e.target.value } : null
                )}
                placeholder="Brief description of the achievement and its significance"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url">URL (Optional)</Label>
              <Input
                id="url"
                value={currentAchievement?.url || ""}
                onChange={(e) => setCurrentAchievement(prev => 
                  prev ? { ...prev, url: e.target.value } : null
                )}
                placeholder="Link to award, certificate, or related content"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setIsEditDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl flex items-center">
              <Award className="mr-2 h-5 w-5 text-idolyst-blue" />
              Achievements
            </CardTitle>
            <CardDescription>
              Awards, certifications, and notable recognition
            </CardDescription>
          </div>
          {editable && (
            <Button variant="ghost" size="sm" onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No achievements added yet.
              {editable && (
                <Button variant="link" onClick={handleAdd} className="mt-2">
                  Add Achievement
                </Button>
              )}
            </div>
          ) : (
            <motion.div 
              className="space-y-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {achievements.map((achievement, index) => (
                <motion.div 
                  key={index}
                  variants={item}
                  className="border-b last:border-b-0 pb-4 last:pb-0"
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-base">{achievement.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center">
                        <Calendar className="h-3 w-3 mr-1 inline" />
                        {achievement.date && formatDate(new Date(achievement.date))}
                      </p>
                      {achievement.description && (
                        <p className="text-sm mt-2">{achievement.description}</p>
                      )}
                      {achievement.url && (
                        <a 
                          href={achievement.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary text-sm flex items-center mt-2 hover:underline"
                        >
                          <LinkIcon className="h-3.5 w-3.5 mr-1" />
                          View Certificate
                        </a>
                      )}
                    </div>
                    
                    {editable && (
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(index)}>
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
      
      {renderAchievementDialog()}
    </>
  );
}
