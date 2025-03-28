
import { useState, useEffect } from "react";
import { format, addDays, startOfWeek, isSameDay, parseISO, isBefore } from "date-fns";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MentorAvailabilitySlot } from "@/types/mentor";

interface MentorAvailabilityCalendarProps {
  availabilitySlots: MentorAvailabilitySlot[];
  onSelectSlot: (slot: MentorAvailabilitySlot) => void;
  isLoading?: boolean;
}

export default function MentorAvailabilityCalendar({ 
  availabilitySlots, 
  onSelectSlot,
  isLoading = false
}: MentorAvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  // Filter slots for the selected date
  const filteredSlots = availabilitySlots.filter(slot => {
    const slotDate = parseISO(slot.start_time);
    return (
      isSameDay(slotDate, selectedDate) && 
      !slot.is_booked && 
      isBefore(new Date(), slotDate)
    );
  });
  
  // Sort slots by time
  const sortedSlots = [...filteredSlots].sort((a, b) => {
    return parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime();
  });
  
  // Generate days for the week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    return addDays(currentWeekStart, i);
  });
  
  // Count available slots for each day
  const slotsPerDay = weekDays.map(day => {
    return availabilitySlots.filter(slot => {
      const slotDate = parseISO(slot.start_time);
      return (
        isSameDay(slotDate, day) && 
        !slot.is_booked && 
        isBefore(new Date(), slotDate)
      );
    }).length;
  });
  
  // Navigation functions
  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };
  
  const goToPreviousWeek = () => {
    const prevWeek = addDays(currentWeekStart, -7);
    if (isBefore(new Date(), prevWeek) || isSameDay(new Date(), prevWeek)) {
      setCurrentWeekStart(prevWeek);
    }
  };
  
  // Reset selected date when week changes
  useEffect(() => {
    setSelectedDate(currentWeekStart);
  }, [currentWeekStart]);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
          Available Slots
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}
            disabled={isBefore(currentWeekStart, new Date())}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {format(currentWeekStart, "MMM d")} - {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
          </span>
          <Button variant="outline" size="sm" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map((day, i) => {
          const isSelected = isSameDay(day, selectedDate);
          const hasSlots = slotsPerDay[i] > 0;
          const isPast = isBefore(day, new Date()) && !isSameDay(day, new Date());
          
          return (
            <Button
              key={day.toString()}
              variant={isSelected ? "default" : "outline"}
              className={`flex flex-col h-auto py-2 ${isPast ? 'opacity-50' : ''} ${!hasSlots && !isPast ? 'border-dashed' : ''}`}
              onClick={() => setSelectedDate(day)}
              disabled={isPast || !hasSlots}
            >
              <span className="text-xs">{format(day, "EEE")}</span>
              <span className="text-lg font-bold my-1">{format(day, "d")}</span>
              {hasSlots ? (
                <span className="text-xs">{slotsPerDay[i]} slot{slotsPerDay[i] !== 1 ? "s" : ""}</span>
              ) : (
                <span className="text-xs text-muted-foreground">No slots</span>
              )}
            </Button>
          );
        })}
      </div>
      
      <h4 className="text-sm font-medium mb-3">
        {format(selectedDate, "EEEE, MMMM d, yyyy")}
      </h4>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-md animate-pulse" />
          ))}
        </div>
      ) : sortedSlots.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05 }}
        >
          {sortedSlots.map((slot) => {
            const startTime = parseISO(slot.start_time);
            const endTime = parseISO(slot.end_time);
            
            return (
              <motion.div
                key={slot.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-auto py-3"
                  onClick={() => onSelectSlot(slot)}
                >
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-medium">{format(startTime, "h:mm a")}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                    </div>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div className="text-center py-8 border rounded-lg">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-3" />
          <h3 className="text-sm font-medium mb-1">No available slots</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            There are no available time slots for this day. Please select another day or contact the mentor.
          </p>
        </div>
      )}
    </div>
  );
}
