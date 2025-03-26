
import { useState } from "react";
import { ExtendedProfileType, WorkExperience } from "@/types/profile-extended";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Calendar, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useExtendedProfile } from "@/hooks/use-extended-profile";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileWorkExperienceProps {
  profile: ExtendedProfileType;
  editable?: boolean;
}

export default function ProfileWorkExperience({ profile, editable = false }: ProfileWorkExperienceProps) {
  const { updateProfile } = useExtendedProfile();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<WorkExperience | null>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [skillInput, setSkillInput] = useState<string>("");
  
  const workExperience = profile.work_experience || [];
  
  const handleAdd = () => {
    setCurrentExperience({
      company: "",
      position: "",
      start_date: "",
      is_current: false,
      skills_used: []
    });
    setSkillInput("");
    setIsAddDialogOpen(true);
  };
  
  const handleEdit = (index: number) => {
    setCurrentExperience(workExperience[index]);
    setSkillInput("");
    setEditIndex(index);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = async (index: number) => {
    if (!confirm("Are you sure you want to remove this work experience?")) return;
    
    const newExperience = [...workExperience];
    newExperience.splice(index, 1);
    
    try {
      await updateProfile({ work_experience: newExperience });
    } catch (error) {
      console.error("Failed to delete work experience:", error);
    }
  };
  
  const addSkill = () => {
    if (!skillInput.trim() || !currentExperience) return;
    
    setCurrentExperience(prev => {
      if (!prev) return null;
      const skills = prev.skills_used || [];
      if (!skills.includes(skillInput.trim())) {
        return { ...prev, skills_used: [...skills, skillInput.trim()] };
      }
      return prev;
    });
    
    setSkillInput("");
  };
  
  const removeSkill = (skill: string) => {
    setCurrentExperience(prev => {
      if (!prev || !prev.skills_used) return prev;
      return {
        ...prev,
        skills_used: prev.skills_used.filter(s => s !== skill)
      };
    });
  };
  
  const handleSave = async () => {
    if (!currentExperience) return;
    
    // Format dates
    if (currentExperience.start_date) {
      currentExperience.start_date = new Date(currentExperience.start_date).toISOString().split('T')[0];
    }
    
    if (currentExperience.end_date && !currentExperience.is_current) {
      currentExperience.end_date = new Date(currentExperience.end_date).toISOString().split('T')[0];
    } else if (currentExperience.is_current) {
      currentExperience.end_date = undefined;
    }
    
    try {
      const newExperience = [...workExperience];
      
      if (isEditDialogOpen && editIndex >= 0) {
        // Edit existing
        newExperience[editIndex] = currentExperience;
      } else {
        // Add new
        newExperience.push(currentExperience);
      }
      
      await updateProfile({ work_experience: newExperience });
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to save work experience:", error);
    }
  };
  
  const renderExperienceDialog = () => {
    const isOpen = isAddDialogOpen || isEditDialogOpen;
    const title = isAddDialogOpen ? "Add Work Experience" : "Edit Work Experience";
    
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
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={currentExperience?.company || ""}
                onChange={(e) => setCurrentExperience(prev => 
                  prev ? { ...prev, company: e.target.value } : null
                )}
                placeholder="e.g. Idolyst"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={currentExperience?.position || ""}
                onChange={(e) => setCurrentExperience(prev => 
                  prev ? { ...prev, position: e.target.value } : null
                )}
                placeholder="e.g. Software Engineer"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={currentExperience?.start_date ? new Date(currentExperience.start_date).toISOString().split('T')[0] : ""}
                  onChange={(e) => setCurrentExperience(prev => 
                    prev ? { ...prev, start_date: e.target.value } : null
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={currentExperience?.end_date && !currentExperience.is_current 
                    ? new Date(currentExperience.end_date).toISOString().split('T')[0] 
                    : ""}
                  onChange={(e) => setCurrentExperience(prev => 
                    prev ? { ...prev, end_date: e.target.value } : null
                  )}
                  disabled={currentExperience?.is_current}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="current"
                checked={currentExperience?.is_current || false}
                onCheckedChange={(checked) => setCurrentExperience(prev => 
                  prev ? { ...prev, is_current: checked as boolean } : null
                )}
              />
              <Label htmlFor="current">I am currently working here</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentExperience?.description || ""}
                onChange={(e) => setCurrentExperience(prev => 
                  prev ? { ...prev, description: e.target.value } : null
                )}
                placeholder="Responsibilities, achievements, etc."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Skills Used</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {currentExperience?.skills_used?.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="px-2 py-1">
                    {skill}
                    <button 
                      className="ml-1 text-xs hover:text-destructive" 
                      onClick={() => removeSkill(skill)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="e.g. React"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                />
                <Button type="button" onClick={addSkill} size="sm">Add</Button>
              </div>
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
              <Briefcase className="mr-2 h-5 w-5 text-idolyst-blue" />
              Work Experience
            </CardTitle>
            <CardDescription>
              Professional background and expertise
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
          {workExperience.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No work experience added yet.
              {editable && (
                <Button variant="link" onClick={handleAdd} className="mt-2">
                  Add Experience
                </Button>
              )}
            </div>
          ) : (
            <motion.div 
              className="space-y-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {workExperience.map((exp, index) => (
                <motion.div 
                  key={index}
                  variants={item}
                  className="border-b last:border-b-0 pb-6 last:pb-0"
                >
                  <div className="flex justify-between">
                    <div className="space-y-2">
                      <h3 className="font-medium text-base">{exp.position}</h3>
                      <p className="text-sm text-muted-foreground">
                        {exp.company}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1 inline" />
                        {exp.start_date && formatDate(new Date(exp.start_date))} - {exp.is_current 
                          ? "Present" 
                          : (exp.end_date ? formatDate(new Date(exp.end_date)) : "")}
                      </p>
                      {exp.description && (
                        <p className="text-sm">{exp.description}</p>
                      )}
                      {exp.skills_used && exp.skills_used.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {exp.skills_used.map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
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
      
      {renderExperienceDialog()}
    </>
  );
}
