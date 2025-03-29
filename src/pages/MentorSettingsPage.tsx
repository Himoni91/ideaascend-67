import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MentorSessionTypeInfo } from "@/types/mentor";
import AppLayout from "@/components/layout/AppLayout";

export default function MentorSettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [sessionTypes, setSessionTypes] = useState<MentorSessionTypeInfo[]>([]);
  const [newSessionType, setNewSessionType] = useState<Omit<MentorSessionTypeInfo, "id" | "created_at" | "mentor_id">>({
    name: "",
    description: "",
    duration: 30,
    price: 0,
    is_free: false
  });
  
  // Fetch session types
  const { data: sessionTypesData, isLoading: isLoadingSessionTypes } = useQuery({
    queryKey: ["mentor-session-types", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('mentor_session_types')
        .select('*')
        .eq('mentor_id', user.id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });
  
  useEffect(() => {
    if (sessionTypesData) {
      setSessionTypes(sessionTypesData);
    }
  }, [sessionTypesData]);
  
  // Create session type mutation
  const createSessionType = useMutation(
    async (newSessionType: Omit<MentorSessionTypeInfo, "created_at" | "id"> & { id?: string }) => {
      const { data, error } = await supabase
        .from('mentor_session_types')
        .insert([
          {
            ...newSessionType,
            mentor_id: user?.id
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      return data as MentorSessionTypeInfo;
    },
    {
      onSuccess: (data) => {
        toast.success("Session type created successfully");
        setSessionTypes([...sessionTypes, data]);
        setNewSessionType({
          name: "",
          description: "",
          duration: 30,
          price: 0,
          is_free: false
        });
        queryClient.invalidateQueries(["mentor-session-types", user?.id]);
      },
      onError: (error: any) => {
        toast.error(`Failed to create session type: ${error.message}`);
      }
    }
  );
  
  // Update session type mutation
  const updateSessionType = useMutation(
    async (updatedSessionType: Omit<MentorSessionTypeInfo, "created_at" | "id"> & { id?: string }) => {
      const { data, error } = await supabase
        .from('mentor_session_types')
        .update(updatedSessionType)
        .eq('id', updatedSessionType.id)
        .select()
        .single();
        
      if (error) throw error;
      return data as MentorSessionTypeInfo;
    },
    {
      onSuccess: (data) => {
        toast.success("Session type updated successfully");
        setSessionTypes(
          sessionTypes.map((sessionType) =>
            sessionType.id === data.id ? data : sessionType
          )
        );
        queryClient.invalidateQueries(["mentor-session-types", user?.id]);
      },
      onError: (error: any) => {
        toast.error(`Failed to update session type: ${error.message}`);
      }
    }
  );
  
  // Delete session type mutation
  const deleteSessionType = useMutation(
    async (id: string) => {
      const { data, error } = await supabase
        .from('mentor_session_types')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return data;
    },
    {
      onSuccess: () => {
        toast.success("Session type deleted successfully");
        setSessionTypes(sessionTypes.filter((sessionType) => sessionType.id !== id));
        queryClient.invalidateQueries(["mentor-session-types", user?.id]);
      },
      onError: (error: any) => {
        toast.error(`Failed to delete session type: ${error.message}`);
      }
    }
  );
  
  const handleCreateSessionType = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSessionType.name || !newSessionType.description) {
      toast.error("Name and description are required");
      return;
    }
    
    createSessionType.mutate({
      name: newSessionType.name,
      description: newSessionType.description,
      duration: newSessionType.duration,
      price: newSessionType.price,
      is_free: newSessionType.is_free,
      mentor_id: user?.id || ''
    });
  };
  
  const handleUpdateSessionType = async (sessionType: MentorSessionTypeInfo) => {
    updateSessionType.mutate({
      ...sessionType,
      mentor_id: user?.id
    });
  };
  
  const handleDeleteSessionType = async (id: string) => {
    deleteSessionType.mutate(id);
  };
  
  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button onClick={() => navigate("/mentor-space")}>
            Back to Mentor Space
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Mentor Settings</h1>
        <p className="text-muted-foreground mb-6">
          Manage your mentor profile and session types.
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>Session Types</CardTitle>
            <CardDescription>
              Create and manage the session types you offer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSessionTypes ? (
              <div className="text-center py-4">Loading session types...</div>
            ) : (
              <div className="space-y-4">
                {sessionTypes.map((sessionType) => (
                  <div key={sessionType.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold">{sessionType.name}</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateSessionType(sessionType)}
                        >
                          Update
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSessionType(sessionType.id)}
                        >
                          {deleteSessionType.isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {sessionType.description}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">
                        Duration: {sessionType.duration} minutes
                      </span>
                      <span className="text-sm">
                        Price: {sessionType.is_free ? "Free" : `$${sessionType.price}`}
                      </span>
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <form onSubmit={handleCreateSessionType} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      type="text"
                      id="name"
                      value={newSessionType.name}
                      onChange={(e) =>
                        setNewSessionType({ ...newSessionType, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newSessionType.description}
                      onChange={(e) =>
                        setNewSessionType({ ...newSessionType, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        type="number"
                        id="duration"
                        value={newSessionType.duration}
                        onChange={(e) =>
                          setNewSessionType({
                            ...newSessionType,
                            duration: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        type="number"
                        id="price"
                        value={newSessionType.price}
                        onChange={(e) =>
                          setNewSessionType({
                            ...newSessionType,
                            price: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="is_free">Free</Label>
                      <Input
                        type="checkbox"
                        id="is_free"
                        checked={newSessionType.is_free}
                        onChange={(e) =>
                          setNewSessionType({ ...newSessionType, is_free: e.target.checked })
                        }
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={createSessionType.isLoading}>
                    {createSessionType.isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Session Type
                      </>
                    )}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
