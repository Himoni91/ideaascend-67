
import { useState } from "react";
import { ExtendedProfileType } from "@/types/profile-extended";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Edit, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useExtendedProfile } from "@/hooks/use-extended-profile";
import { motion } from "framer-motion";

interface ProfileSummaryProps {
  profile: ExtendedProfileType;
  editable?: boolean;
}

export default function ProfileSummary({ profile, editable = false }: ProfileSummaryProps) {
  const { updateProfile } = useExtendedProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [summary, setSummary] = useState(profile.professional_summary || '');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleEdit = () => {
    setSummary(profile.professional_summary || '');
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    try {
      setIsUpdating(true);
      await updateProfile({ professional_summary: summary });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update summary:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center">
          <FileText className="mr-2 h-5 w-5 text-idolyst-blue" />
          Professional Summary
        </CardTitle>
        {editable && !isEditing && (
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Write a professional summary highlighting your expertise, experience, and what you bring to the table."
              rows={6}
              className="resize-none"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <motion.div 
                      className="h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {!profile.professional_summary ? (
              <div className="text-center py-6 text-muted-foreground">
                No professional summary added yet.
                {editable && (
                  <Button variant="link" onClick={handleEdit} className="mt-2">
                    Add a summary
                  </Button>
                )}
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-line">{profile.professional_summary}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
