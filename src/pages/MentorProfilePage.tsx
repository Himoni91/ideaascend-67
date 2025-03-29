
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Calendar,
  CalendarDateRangePicker, 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui";
import { useMentor } from "@/hooks/use-mentor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { DateRange } from "react-day-picker";
import { startOfDay, addDays } from "date-fns";
import { toast } from "sonner";
import { MentorAvailabilitySlot, MentorSessionTypeInfo } from "@/types/mentor";
import MentorReviews from "@/components/mentor/MentorReviews";
import { MentorProfile } from "@/types/mentor";
import { motion } from "framer-motion";

const MentorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getMentorProfile, 
    getMentorSessionTypes, 
    getMentorAvailability,
    bookMentorSession
  } = useMentor();

  const [activeTab, setActiveTab] = useState("about");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedSessionType, setSelectedSessionType] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<MentorAvailabilitySlot | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: addDays(startOfDay(new Date()), 7)
  });
  const [bookingNote, setBookingNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: mentor, isLoading: isMentorLoading, error: mentorError } = 
    getMentorProfile(id);
  
  const { data: sessionTypes, isLoading: isSessionTypesLoading } = 
    getMentorSessionTypes(id);
  
  const { data: availabilitySlots, isLoading: isAvailabilityLoading } = 
    getMentorAvailability(id, dateRange?.from, dateRange?.to);

  const handleBookingSubmit = async () => {
    if (!user || !mentor || !selectedSessionType || !selectedSlot) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const selectedType = sessionTypes?.find(type => type.id === selectedSessionType);
      
      if (!selectedType) {
        toast.error("Invalid session type selected");
        return;
      }

      await bookMentorSession({
        mentorId: mentor.id,
        menteeId: user.id,
        startTime: selectedSlot.start_time,
        endTime: selectedSlot.end_time,
        sessionTypeId: selectedType.id,
        note: bookingNote
      });

      toast.success("Booking successful!");
      setIsBookingOpen(false);
      
      // Refetch data
      // Refresh availability
      getMentorAvailability(id, dateRange?.from, dateRange?.to);
      
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to book session. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isMentorLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin h-12 w-12 border-4 border-idolyst-blue border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (mentorError || !mentor) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-800">Mentor not found</h2>
        <p className="text-gray-600 mt-2">The mentor profile you're looking for doesn't exist or has been removed.</p>
        <Button 
          onClick={() => navigate("/mentor-space")}
          className="mt-4"
        >
          Back to Mentor Space
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row gap-6 mb-8 items-start"
      >
        <div className="relative">
          <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
            <AvatarImage src={mentor.avatar_url || ''} alt={mentor.full_name || 'Mentor'} />
            <AvatarFallback>{mentor.full_name?.charAt(0) || 'M'}</AvatarFallback>
          </Avatar>
          {mentor.is_verified && (
            <div className="absolute -bottom-2 -right-2 bg-idolyst-blue text-white p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <h1 className="text-3xl font-bold">{mentor.full_name}</h1>
              <p className="text-lg text-gray-600">{mentor.professional_headline || mentor.position}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {mentor.expertise?.map((skill, index) => (
                  <Badge key={index} variant="outline" className="bg-idolyst-purple/10">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0">
              <Button 
                onClick={() => setIsBookingOpen(true)}
                size="lg"
                className="bg-idolyst-blue hover:bg-idolyst-blue/90"
              >
                Book a Session
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <Card className="bg-idolyst-blue/5">
              <CardContent className="pt-4 text-center">
                <p className="text-3xl font-bold">{mentor.stats?.mentorRating || '4.8'}</p>
                <p className="text-sm text-gray-600">Average Rating</p>
              </CardContent>
            </Card>
            <Card className="bg-idolyst-purple/5">
              <CardContent className="pt-4 text-center">
                <p className="text-3xl font-bold">{mentor.stats?.mentorReviews || '0'}</p>
                <p className="text-sm text-gray-600">Reviews</p>
              </CardContent>
            </Card>
            <Card className="bg-idolyst-orange/5">
              <CardContent className="pt-4 text-center">
                <p className="text-3xl font-bold">{mentor.mentor_session_types?.length || '0'}</p>
                <p className="text-sm text-gray-600">Session Types</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
      
      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="sessions">Session Types</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>
        
        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>About {mentor.full_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>{mentor.mentor_bio || mentor.bio || 'No bio available'}</p>
              </div>
              
              {mentor.work_experience && mentor.work_experience.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Work Experience</h3>
                  <div className="space-y-4">
                    {mentor.work_experience.map((exp: any, index: number) => (
                      <div key={index} className="border-l-2 border-idolyst-blue pl-4 py-2">
                        <h4 className="font-medium">{exp.title} at {exp.company}</h4>
                        <p className="text-sm text-gray-600">{exp.startDate} - {exp.endDate || 'Present'}</p>
                        <p className="mt-2">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {mentor.education && mentor.education.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4">Education</h3>
                  <div className="space-y-4">
                    {mentor.education.map((edu: any, index: number) => (
                      <div key={index} className="border-l-2 border-idolyst-purple pl-4 py-2">
                        <h4 className="font-medium">{edu.degree} from {edu.institution}</h4>
                        <p className="text-sm text-gray-600">{edu.startYear} - {edu.endYear || 'Present'}</p>
                        <p className="mt-2">{edu.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Types</CardTitle>
            </CardHeader>
            <CardContent>
              {isSessionTypesLoading ? (
                <div className="py-10 text-center">Loading session types...</div>
              ) : !sessionTypes || sessionTypes.length === 0 ? (
                <div className="py-10 text-center">No session types available</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sessionTypes.map((type) => (
                    <Card key={type.id} className="overflow-hidden border-2 hover:border-idolyst-blue/60 transition-all">
                      <div className={`h-2 ${type.color || 'bg-idolyst-blue'}`}></div>
                      <CardHeader>
                        <CardTitle>{type.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4">{type.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{type.duration} minutes</span>
                          <span className="font-semibold">
                            {type.is_free ? 'Free' : `$${type.price}`}
                          </span>
                        </div>
                        <Button 
                          className="w-full mt-4"
                          onClick={() => {
                            setSelectedSessionType(type.id);
                            setIsBookingOpen(true);
                          }}
                        >
                          Book This Session
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <MentorReviews mentorId={mentor.id} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="availability" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <CalendarDateRangePicker
                  date={dateRange}
                  onDateChange={setDateRange}
                />
              </div>
              
              {isAvailabilityLoading ? (
                <div className="py-10 text-center">Loading availability...</div>
              ) : !availabilitySlots || availabilitySlots.length === 0 ? (
                <div className="py-10 text-center">No available slots for the selected dates</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                  {availabilitySlots.map((slot) => {
                    const startDate = new Date(slot.start_time);
                    const endDate = new Date(slot.end_time);
                    
                    return (
                      <Button
                        key={slot.id}
                        variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                        className={`h-auto py-3 px-4 justify-start ${slot.is_booked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={slot.is_booked}
                        onClick={() => setSelectedSlot(slot.is_booked ? null : slot)}
                      >
                        <div className="text-left">
                          <div className="font-medium">
                            {formatDate(startDate)}
                          </div>
                          <div className="text-sm opacity-90">
                            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                            {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book a Session with {mentor.full_name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="session-type" className="text-sm font-medium">Session Type</label>
              <Select
                value={selectedSessionType}
                onValueChange={setSelectedSessionType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                  {sessionTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.duration} min) - {type.price ? `$${type.price}` : 'Free'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="date-range" className="text-sm font-medium">Date Range</label>
              <CalendarDateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
            
            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium">Available Slots</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2">
                {isAvailabilityLoading ? (
                  <div className="col-span-2 text-center py-4">Loading slots...</div>
                ) : !availabilitySlots || availabilitySlots.length === 0 ? (
                  <div className="col-span-2 text-center py-4">No available slots for the selected dates</div>
                ) : (
                  availabilitySlots.map((slot) => {
                    const startDate = new Date(slot.start_time);
                    
                    return (
                      <Button
                        key={slot.id}
                        variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                        className={`h-auto py-2 justify-start text-left ${slot.is_booked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={slot.is_booked}
                        onClick={() => setSelectedSlot(slot.is_booked ? null : slot)}
                        size="sm"
                      >
                        <div>
                          <div className="font-medium text-xs">
                            {formatDate(startDate)}
                          </div>
                          <div className="text-xs">
                            {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </Button>
                    );
                  })
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="note" className="text-sm font-medium">Note (Optional)</label>
              <textarea
                id="note"
                value={bookingNote}
                onChange={(e) => setBookingNote(e.target.value)}
                className="w-full min-h-[100px] p-2 border rounded-md"
                placeholder="Add any notes or questions for the mentor..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBookingSubmit} 
              disabled={!selectedSessionType || !selectedSlot || isSubmitting}
              className={isSubmitting ? 'opacity-70' : ''}
            >
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MentorProfilePage;
