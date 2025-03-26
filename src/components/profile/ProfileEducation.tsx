
import { useState } from "react";
import { ExtendedProfileType, Education } from "@/types/profile-extended";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Calendar, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useExtendedProfile } from "@/hooks/use-extended-profile";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileEducationProps {
  profile: ExtendedProfileType;
  editable?: boolean;
}

export default function ProfileEducation({ profile, editable = false }: ProfileEducationProps) {
  const { updateProfile } = useExtendedProfile();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEducation, setCurrentEducation] = useState<Education | null>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);
  
  const education = profile.education || [];
  
  const handleAdd = () => {
    setCurrentEducation({
      institution: "",
      degree: "",
      field: "",
      start_date: "",
      is_current: false
    });
    setIsAddDialogOpen(true);
  };
  
  const handleEdit = (index: number) => {
    setCurrentEducation(education[index]);
    setEditIndex(index);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = async (index: number) => {
    if (!confirm("Are you sure you want to remove this education?")) return;
    
    const newEducation = [...education];
    newEducation.splice(index, 1);
    
    try {
      await updateProfile({ education: newEducation });
    } catch (error) {
      console.error("Failed to delete education:", error);
    }
  };
  
  const handleSave = async () => {
    if (!currentEducation) return;
    
    // Format dates
    if (currentEducation.start_date) {
      currentEducation.start_date = new Date(currentEducation.start_date).toISOString().split('T')[0];
    }
    
    if (currentEducation.end_date && !currentEducation.is_current) {
      currentEducation.end_date = new Date(currentEducation.end_date).toISOString().split('T')[0];
    } else if (currentEducation.is_current) {
      currentEducation.end_date = undefined;
    }
    
    try {
      const newEducation = [...education];
      
      if (isEditDialogOpen && editIndex >= 0) {
        // Edit existing
        newEducation[editIndex] = currentEducation;
      } else {
        // Add new
        newEducation.push(currentEducation);
      }
      
      await updateProfile({ education: newEducation });
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to save education:", error);
    }
  };
  
  const renderEducationDialog = () => {
    const isOpen = isAddDialogOpen || isEditDialogOpen;
    const title = isAddDialogOpen ? "Add Education" : "Edit Education";
    
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
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                value={currentEducation?.institution || ""}
                onChange={(e) => setCurrentEducation(prev => 
                  prev ? { ...prev, institution: e.target.value } : null
                )}
                placeholder="e.g. Stanford University"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="degree">Degree</Label>
                <Input
                  id="degree"
                  value={currentEducation?.degree || ""}
                  onChange={(e) => setCurrentEducation(prev => 
                    prev ? { ...prev, degree: e.target.value } : null
                  )}
                  placeholder="e.g. Bachelor's"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="field">Field of Study</Label>
                <Input
                  id="field"
                  value={currentEducation?.field || ""}
                  onChange={(e) => setCurrentEducation(prev => 
                    prev ? { ...prev, field: e.target.value } : null
                  )}
                  placeholder="e.g. Computer Science"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={currentEducation?.start_date ? new Date(currentEducation.start_date).toISOString().split('T')[0] : ""}
                  onChange={(e) => setCurrentEducation(prev => 
                    prev ? { ...prev, start_date: e.target.value } : null
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={currentEducation?.end_date && !currentEducation.is_current 
                    ? new Date(currentEducation.end_date).toISOString().split('T')[0] 
                    : ""}
                  onChange={(e) => setCurrentEducation(prev => 
                    prev ? { ...prev, end_date: e.target.value } : null
                  )}
                  disabled={currentEducation?.is_current}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="current"
                checked={currentEducation?.is_current || false}
                onCheckedChange={(checked) => setCurrentEducation(prev => 
                  prev ? { ...prev, is_current: checked as boolean } : null
                )}
              />
              <Label htmlFor="current">I am currently studying here</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={currentEducation?.description || ""}
                onChange={(e) => setCurrentEducation(prev => 
                  prev ? { ...prev, description: e.target.value } : null
                )}
                placeholder="Activities, achievements, etc."
                rows={3}
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
              <Book className="mr-2 h-5 w-5 text-idolyst-blue" />
              Education
            </CardTitle>
            <CardDescription>
              Academic background and qualifications
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
          {education.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No education information added yet.
              {editable && (
                <Button variant="link" onClick={handleAdd} className="mt-2">
                  Add Education
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
              {education.map((edu, index) => (
                <motion.div 
                  key={index}
                  variants={item}
                  className="border-b last:border-b-0 pb-4 last:pb-0"
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-base">{edu.institution}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {edu.degree} in {edu.field}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center">
                        <Calendar className="h-3 w-3 mr-1 inline" />
                        {edu.start_date && formatDate(new Date(edu.start_date))} - {edu.is_current 
                          ? "Present" 
                          : (edu.end_date ? formatDate(new Date(edu.end_date)) : "")}
                      </p>
                      {edu.description && (
                        <p className="text-sm mt-2">{edu.description}</p>
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
      
      {renderEducationDialog()}
    </>
  );
}
