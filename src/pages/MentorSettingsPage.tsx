
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Clock, 
  Calendar, 
  Pencil, 
  DollarSign, 
  Tag, 
  Plus, 
  Trash, 
  Save,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useMentorSpace } from "@/hooks/use-mentor-space";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageTransition } from "@/components/ui/page-transition";
import AppLayout from "@/components/layout/AppLayout";
import { Helmet } from "react-helmet-async";
import AvailabilityManager from "@/components/mentor/AvailabilityManager";
import { MentorSessionTypeInfo } from "@/types/mentor";
import { useQuery } from "@tanstack/react-query";

const MentorSettingsPage = () => {
  const { user } = useAuth();
  const { 
    getMentorProfile, 
    getMentorSessionTypes,
    getMentorAvailability,
    updateMentorProfile,
    upsertSessionType
  } = useMentorSpace();
  
  // Get mentor profile
  const { 
    data: mentor, 
    isLoading: isLoadingProfile 
  } = getMentorProfile(user?.id);
  
  // Get session types
  const { 
    data: sessionTypes, 
    isLoading: isLoadingSessionTypes 
  } = getMentorSessionTypes(user?.id);
  
  // Get availability slots for availability tab
  const { 
    data: availabilitySlots, 
    isLoading: isLoadingAvailability 
  } = getMentorAvailability(user?.id);
  
  // State for profile form
  const [mentorBio, setMentorBio] = useState(mentor?.mentor_bio || '');
  const [hourlyRate, setHourlyRate] = useState(mentor?.mentor_hourly_rate?.toString() || '');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  
  // State for session type dialog
  const [showSessionTypeDialog, setShowSessionTypeDialog] = useState(false);
  const [editingSessionType, setEditingSessionType] = useState<MentorSessionTypeInfo | null>(null);
  const [sessionTypeName, setSessionTypeName] = useState('');
  const [sessionTypeDescription, setSessionTypeDescription] = useState('');
  const [sessionTypeDuration, setSessionTypeDuration] = useState('60');
  const [sessionTypePrice, setSessionTypePrice] = useState('0');
  const [isSessionTypeFree, setIsSessionTypeFree] = useState(false);
  const [isSubmittingSessionType, setIsSubmittingSessionType] = useState(false);
  
  // Update profile info when data loads
  React.useEffect(() => {
    if (mentor) {
      setMentorBio(mentor.mentor_bio || '');
      setHourlyRate(mentor.mentor_hourly_rate?.toString() || '');
    }
  }, [mentor]);
  
  // Handle profile update
  const handleUpdateProfile = async () => {
    try {
      setIsSubmittingProfile(true);
      
      await updateMentorProfile.mutateAsync({
        mentorBio,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined
      });
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSubmittingProfile(false);
    }
  };
  
  // Open session type dialog
  const openSessionTypeDialog = (sessionType?: MentorSessionTypeInfo) => {
    if (sessionType) {
      setEditingSessionType(sessionType);
      setSessionTypeName(sessionType.name);
      setSessionTypeDescription(sessionType.description);
      setSessionTypeDuration(sessionType.duration.toString());
      setSessionTypePrice(sessionType.price.toString());
      setIsSessionTypeFree(sessionType.is_free || false);
    } else {
      setEditingSessionType(null);
      setSessionTypeName('');
      setSessionTypeDescription('');
      setSessionTypeDuration('60');
      setSessionTypePrice('0');
      setIsSessionTypeFree(false);
    }
    
    setShowSessionTypeDialog(true);
  };
  
  // Handle session type save
  const handleSaveSessionType = async () => {
    try {
      setIsSubmittingSessionType(true);
      
      if (!sessionTypeName) {
        toast.error("Session name is required");
        return;
      }
      
      if (!sessionTypeDescription) {
        toast.error("Description is required");
        return;
      }
      
      if (!sessionTypeDuration || parseInt(sessionTypeDuration) <= 0) {
        toast.error("Duration must be greater than 0");
        return;
      }
      
      if (!isSessionTypeFree && (!sessionTypePrice || parseFloat(sessionTypePrice) < 0)) {
        toast.error("Price must be valid");
        return;
      }
      
      const sessionTypeData = {
        name: sessionTypeName,
        description: sessionTypeDescription,
        duration: parseInt(sessionTypeDuration),
        price: isSessionTypeFree ? 0 : parseFloat(sessionTypePrice),
        is_free: isSessionTypeFree,
        id: editingSessionType?.id
      };
      
      await upsertSessionType.mutateAsync(sessionTypeData);
      
      setShowSessionTypeDialog(false);
      toast.success("Session type saved successfully");
    } catch (error) {
      console.error("Error saving session type:", error);
      toast.error("Failed to save session type");
    } finally {
      setIsSubmittingSessionType(false);
    }
  };

  return (
    <AppLayout>
      <Helmet>
        <title>Mentor Settings | Idolyst</title>
      </Helmet>
      
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <Settings className="mr-3 h-7 w-7 text-primary" />
              Mentor Settings
            </h1>
            <p className="text-muted-foreground max-w-3xl">
              Manage your mentor profile, availability, and session types
            </p>
          </motion.div>
          
          {isLoadingProfile ? (
            <div className="flex justify-center items-center h-60">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : !user?.is_mentor ? (
            <Card>
              <CardContent className="pt-6 px-6 text-center">
                <div className="mb-3">
                  <Settings className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-lg font-medium mb-1">You're not a mentor yet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Apply to become a mentor to access these settings
                </p>
                <Button onClick={() => window.location.href = "/mentor-space/apply"}>
                  Apply to Become a Mentor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="profile" className="space-y-8">
              <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="sessions">Session Types</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
              </TabsList>
              
              {/* Profile Settings */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Mentor Profile Settings</CardTitle>
                    <CardDescription>
                      Configure your mentor profile and rates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="mentor-bio">Mentor Bio</Label>
                      <Textarea
                        id="mentor-bio"
                        value={mentorBio}
                        onChange={(e) => setMentorBio(e.target.value)}
                        placeholder="Describe your mentoring style, expertise, and what mentees can expect"
                        rows={6}
                      />
                      <p className="text-sm text-muted-foreground">
                        This will be displayed on your mentor profile. Be clear about your expertise and mentoring approach.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="hourly-rate">Base Hourly Rate (USD)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="hourly-rate"
                            type="number"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            placeholder="e.g., 50"
                            className="pl-10"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Your default rate per hour. You can set different rates for different session types.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleUpdateProfile} disabled={isSubmittingProfile}>
                      {isSubmittingProfile ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Session Types */}
              <TabsContent value="sessions">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Session Types</CardTitle>
                      <CardDescription>
                        Define the types of mentorship sessions you offer
                      </CardDescription>
                    </div>
                    
                    <Button onClick={() => openSessionTypeDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Session Type
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSessionTypes ? (
                      <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : sessionTypes && sessionTypes.length > 0 ? (
                      <div className="space-y-4">
                        {sessionTypes.map((sessionType) => (
                          <div
                            key={sessionType.id}
                            className="flex flex-col sm:flex-row justify-between gap-4 p-4 border rounded-lg hover:border-primary/20 transition-colors"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">{sessionType.name}</h3>
                                {sessionType.is_free && (
                                  <div className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400 px-2 py-0.5 rounded-full">
                                    Free
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1.5" />
                                  {sessionType.duration} minutes
                                </div>
                                
                                {!sessionType.is_free && (
                                  <div className="flex items-center">
                                    <DollarSign className="h-4 w-4 mr-1.5" />
                                    ${sessionType.price.toFixed(2)}
                                  </div>
                                )}
                              </div>
                              
                              <p className="text-sm">{sessionType.description}</p>
                            </div>
                            
                            <div className="flex items-start gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => openSessionTypeDialog(sessionType)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-destructive"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border rounded-lg border-dashed">
                        <Tag className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
                        <h3 className="text-lg font-medium mb-1">No session types yet</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                          Define the types of mentorship sessions you offer to help mentees understand your services
                        </p>
                        <Button onClick={() => openSessionTypeDialog()}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Session Type
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Session Type Dialog */}
                <Dialog open={showSessionTypeDialog} onOpenChange={setShowSessionTypeDialog}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingSessionType ? "Edit Session Type" : "Add Session Type"}
                      </DialogTitle>
                      <DialogDescription>
                        Define the details of the mentorship session you offer
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="session-name">Session Name</Label>
                        <Input
                          id="session-name"
                          value={sessionTypeName}
                          onChange={(e) => setSessionTypeName(e.target.value)}
                          placeholder="e.g., Quick Consultation"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="session-description">Description</Label>
                        <Textarea
                          id="session-description"
                          value={sessionTypeDescription}
                          onChange={(e) => setSessionTypeDescription(e.target.value)}
                          placeholder="Describe what this session includes"
                          rows={3}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="session-duration">Duration (minutes)</Label>
                          <Input
                            id="session-duration"
                            type="number"
                            value={sessionTypeDuration}
                            onChange={(e) => setSessionTypeDuration(e.target.value)}
                            min="15"
                            step="15"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="session-price">Price (USD)</Label>
                            <div className="flex items-center space-x-2">
                              <Label 
                                htmlFor="free-session" 
                                className="text-sm cursor-pointer"
                              >
                                Free
                              </Label>
                              <input
                                id="free-session"
                                type="checkbox"
                                checked={isSessionTypeFree}
                                onChange={(e) => setIsSessionTypeFree(e.target.checked)}
                                className="h-4 w-4"
                              />
                            </div>
                          </div>
                          
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="session-price"
                              type="number"
                              value={sessionTypePrice}
                              onChange={(e) => setSessionTypePrice(e.target.value)}
                              className="pl-10"
                              min="0"
                              step="0.01"
                              disabled={isSessionTypeFree}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowSessionTypeDialog(false)}
                        disabled={isSubmittingSessionType}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSaveSessionType}
                        disabled={isSubmittingSessionType}
                      >
                        {isSubmittingSessionType ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Session Type
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TabsContent>
              
              {/* Availability */}
              <TabsContent value="availability">
                <AvailabilityManager 
                  availabilitySlots={availabilitySlots}
                  isLoading={isLoadingAvailability}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default MentorSettingsPage;
