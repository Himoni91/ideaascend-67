
import { useState } from "react";
import { ProfileType } from "@/types/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MessageSquare, Star, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ProfileMentorProps {
  profile: ProfileType;
  isCurrentUser: boolean;
}

export default function ProfileMentor({ profile, isCurrentUser }: ProfileMentorProps) {
  const [openRequestDialog, setOpenRequestDialog] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center">
              <CardTitle className="text-xl flex items-center">
                <Award className="mr-2 h-5 w-5 text-idolyst-blue" />
                Mentor Profile
              </CardTitle>
              <Badge className="ml-2 bg-idolyst-blue/90 text-xs">Verified</Badge>
            </div>
            <CardDescription>
              {isCurrentUser 
                ? "Your mentor profile and mentorship stats" 
                : `Connect with ${profile.full_name || profile.username} for mentorship`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Expertise badges */}
          <div>
            <h4 className="text-sm font-medium mb-2">Areas of Expertise</h4>
            <div className="flex flex-wrap gap-2">
              {profile.expertise?.map((item, i) => (
                <Badge key={i} variant="outline" className="bg-primary/5">
                  {item}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 py-2">
            <div className="text-center">
              <p className="text-2xl font-semibold">{profile.stats?.mentorSessions || 0}</p>
              <p className="text-xs text-muted-foreground">Sessions</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-2xl font-semibold">
                <span className="mr-1">4.9</span>
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold">97%</p>
              <p className="text-xs text-muted-foreground">Response</p>
            </div>
          </div>
          
          {/* Action buttons */}
          {!isCurrentUser ? (
            <div className="flex flex-col gap-2 pt-2">
              <Dialog open={openRequestDialog} onOpenChange={setOpenRequestDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Session
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Schedule Mentorship Session</DialogTitle>
                    <DialogDescription>
                      Request a mentorship session with {profile.full_name || profile.username}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="flex items-center space-x-4 py-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback>{profile.full_name?.charAt(0) || "M"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{profile.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{profile.position} at {profile.company}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Available Time Slots</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="justify-start">
                          <Calendar className="mr-2 h-4 w-4" />
                          Tomorrow, 10:00 AM
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Calendar className="mr-2 h-4 w-4" />
                          Tomorrow, 2:00 PM
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Calendar className="mr-2 h-4 w-4" />
                          Friday, 11:00 AM
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Calendar className="mr-2 h-4 w-4" />
                          Friday, 3:00 PM
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Session Type</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="justify-start">
                          30 min Quick Chat
                        </Button>
                        <Button variant="outline" className="justify-start">
                          60 min Deep Dive
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter className="flex flex-col space-y-2 sm:space-y-0">
                    <Button onClick={() => setOpenRequestDialog(false)}>Continue to Booking</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
              </Button>
            </div>
          ) : (
            <div className="border rounded-md p-4 mt-2">
              <div className="flex items-start">
                <div className="bg-muted w-10 h-10 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">Your next mentoring session</p>
                  <p className="text-xs text-muted-foreground mt-1">No upcoming sessions scheduled</p>
                  <Button variant="link" className="text-xs p-0 h-auto mt-1">
                    View your schedule
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
