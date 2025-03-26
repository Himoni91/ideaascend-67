
import { useState } from "react";
import { ExtendedProfileType } from "@/types/profile-extended";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Plus, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useExtendedProfile } from "@/hooks/use-extended-profile";
import { motion } from "framer-motion";

interface ProfileSkillsProps {
  profile: ExtendedProfileType;
  editable?: boolean;
}

export default function ProfileSkills({ profile, editable = false }: ProfileSkillsProps) {
  const { updateProfile } = useExtendedProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [skillInput, setSkillInput] = useState<string>("");
  const [editedSkills, setEditedSkills] = useState<string[]>(profile.skills || []);
  
  const handleStartEditing = () => {
    setEditedSkills(profile.skills || []);
    setIsEditing(true);
  };
  
  const handleCancelEditing = () => {
    setIsEditing(false);
    setSkillInput("");
  };
  
  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    
    if (!editedSkills.includes(skillInput.trim())) {
      setEditedSkills([...editedSkills, skillInput.trim()]);
    }
    
    setSkillInput("");
  };
  
  const handleRemoveSkill = (skill: string) => {
    setEditedSkills(editedSkills.filter(s => s !== skill));
  };
  
  const handleSaveSkills = async () => {
    try {
      await updateProfile({ skills: editedSkills });
      setIsEditing(false);
      setSkillInput("");
    } catch (error) {
      console.error("Failed to save skills:", error);
    }
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { scale: 0.8, opacity: 0 },
    show: { scale: 1, opacity: 1 }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl flex items-center">
            <Code className="mr-2 h-5 w-5 text-idolyst-blue" />
            Skills
          </CardTitle>
          <CardDescription>
            Technical and professional competencies
          </CardDescription>
        </div>
        {editable && !isEditing && (
          <Button variant="ghost" size="sm" onClick={handleStartEditing}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
        {editable && isEditing && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleCancelEditing}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveSkills}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill (e.g. React, Presentation)"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button type="button" onClick={handleAddSkill}>Add</Button>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {editedSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                  {skill}
                  <button 
                    className="ml-2 text-xs hover:text-destructive" 
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {editedSkills.length === 0 && (
                <p className="text-sm text-muted-foreground p-2">
                  No skills added yet. Use the input above to add skills.
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {!profile.skills || profile.skills.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No skills added yet.
                {editable && (
                  <Button variant="link" onClick={handleStartEditing} className="mt-2">
                    Add Skills
                  </Button>
                )}
              </div>
            ) : (
              <motion.div 
                className="flex flex-wrap gap-2"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {profile.skills.map((skill, index) => (
                  <motion.div key={index} variants={item}>
                    <Badge className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 transition-colors">
                      {skill}
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
