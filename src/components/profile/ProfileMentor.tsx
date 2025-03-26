
import { useState } from "react";
import { ProfileType } from "@/types/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, GraduationCap, Calendar as CalendarIcon, Star, MessageSquare, Award } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Navigate } from "react-router-dom";

interface ProfileMentorProps {
  profile: ProfileType;
  isCurrentUser: boolean;
}

export default function ProfileMentor({ profile, isCurrentUser }: ProfileMentorProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  
  if (!profile.is_mentor) return null;
  
  if (bookingComplete) {
    return <Navigate to="/mentor-space/booking-confirmed" />;
  }
  
  // Mock data for mentor availability
  const availability = profile.availability || Array(7).fill(null).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString(),
      slots: [
        { start: "09:00", end: "10:00", booked: Math.random() > 0.7 },
        { start: "10:30", end: "11:30", booked: Math.random() > 0.7 },
        { start: "13:00", end: "14:00", booked: Math.random() > 0.7 },
        { start: "15:30", end: "16:30", booked: Math.random() > 0.7 }
      ]
    };
  });
  
  // Mock data for mentor reviews
  const reviews = profile.reviews || [
    {
      id: "r1",
      reviewer_id: "u123",
      reviewer_name: "Alex Johnson",
      reviewer_avatar: "",
      rating: 5,
      comment: "Amazing mentor! Helped me refine my startup pitch in just one session.",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "r2",
      reviewer_id: "u456",
      reviewer_name: "Samantha Lee",
      reviewer_avatar: "",
      rating: 4,
      comment: "Great insights on product development and market positioning.",
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  // Mock certifications
  const certifications = profile.certifications || [
    { name: "Certified Business Mentor", issuer: "International Mentoring Association", date: "2021-05-15" },
    { name: "Startup Advisors Network", issuer: "Global Entrepreneurship Network", date: "2020-03-10" }
  ];
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };
  
  const handleSlotSelect = (slotTime: string) => {
    setSelectedSlot(slotTime);
  };
  
  const handleBookSession = () => {
    // In production, this would call an API to book the session
    setBookingComplete(true);
  };
  
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getAverageRating = () => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
  };
  
  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <GraduationCap className="w-5 h-5 mr-2 text-idolyst-blue" />
          Mentor Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Certifications */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center">
            <Award className="w-4 h-4 mr-2 text-gray-500" />
            Certifications
          </h3>
          <div className="flex flex-wrap gap-2">
            {certifications.map((cert, index) => (
              <Badge key={index} variant="outline" className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {cert.name}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Reviews Summary */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium flex items-center">
              <Star className="w-4 h-4 mr-2 text-gray-500" />
              Reviews
            </h3>
            <div className="flex items-center">
              <span className="text-sm font-medium mr-1">{getAverageRating()}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-4 h-4 ${
                      star <= Math.round(getAverageRating())
                        ? "text-yellow-400 fill-yellow-400" 
                        : "text-gray-300 dark:text-gray-600"
                    }`} 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">({reviews.length})</span>
            </div>
          </div>
          
          {/* Review Previews */}
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {reviews.slice(0, 2).map((review) => (
              <div key={review.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center mb-1">
                  <Avatar className="w-6 h-6 rounded-full">
                    {review.reviewer_avatar ? (
                      <AvatarImage src={review.reviewer_avatar} alt={review.reviewer_name} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-idolyst-blue to-idolyst-indigo text-white text-xs">
                        {getInitials(review.reviewer_name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="text-xs font-medium ml-2">{review.reviewer_name}</span>
                  <div className="flex ml-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-3 h-3 ${
                          star <= review.rating
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-gray-300 dark:text-gray-600"
                        }`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Booking Button */}
        {!isCurrentUser && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <Button 
              onClick={() => setCalendarOpen(true)} 
              className="w-full flex items-center justify-center"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book a Session
            </Button>
          </div>
        )}
      </CardContent>
      
      {/* Booking Dialog */}
      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book a Mentorship Session</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">1. Select a Date</h3>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border"
                disabled={(date) => {
                  // Disable past dates and dates more than 30 days in the future
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const thirtyDaysLater = new Date();
                  thirtyDaysLater.setDate(today.getDate() + 30);
                  return date < today || date > thirtyDaysLater;
                }}
              />
            </div>
            
            {selectedDate && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">2. Select a Time Slot</h3>
                <div className="grid grid-cols-2 gap-2">
                  {availability
                    .find(a => new Date(a.date).toDateString() === selectedDate.toDateString())
                    ?.slots.map((slot, index) => (
                      <Button
                        key={index}
                        variant={slot.booked ? "outline" : selectedSlot === `${slot.start}-${slot.end}` ? "default" : "outline"}
                        disabled={slot.booked}
                        onClick={() => handleSlotSelect(`${slot.start}-${slot.end}`)}
                        className={`justify-center ${slot.booked ? 'opacity-50' : ''}`}
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {slot.start} - {slot.end}
                      </Button>
                    ))}
                </div>
              </div>
            )}
            
            {selectedSlot && (
              <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-sm font-medium">3. Confirm Booking</h3>
                <Button onClick={handleBookSession} className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Book Session
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
