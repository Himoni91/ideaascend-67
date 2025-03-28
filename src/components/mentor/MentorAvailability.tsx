
import { useState, useEffect } from "react";
import { format, parseISO, addDays, isSameDay, startOfWeek, addWeeks, isBefore } from "date-fns";
import { Calendar, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MentorAvailabilitySlot } from "@/types/mentor";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MentorAvailabilityProps {
  slots: MentorAvailabilitySlot[];
  isLoading: boolean;
  onSelectSlot: (slot: MentorAvailabilitySlot) => void;
  selectedSlot?: MentorAvailabilitySlot;
}

export default function MentorAvailability({ 
  slots, 
  isLoading, 
  onSelectSlot,
  selectedSlot 
}: MentorAvailabilityProps) {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(startOfWeek(today, { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Filter slots for the selected date
  const filteredSlots = selectedDate
    ? slots.filter(slot => isSameDay(parseISO(slot.start_time), selectedDate))
    : [];
  
  // Generate an array of 7 days from week start
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Check if a day has available slots
  const dayHasSlots = (day: Date) => {
    return slots.some(slot => isSameDay(parseISO(slot.start_time), day));
  };
  
  // Navigate to previous/next week
  const goToPreviousWeek = () => {
    const newWeekStart = addDays(weekStart, -7);
    if (!isBefore(newWeekStart, today)) {
      setWeekStart(newWeekStart);
      setSelectedDate(null);
    }
  };
  
  const goToNextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
    setSelectedDate(null);
  };
  
  // Select a day
  const selectDay = (day: Date) => {
    setSelectedDate(day);
  };
  
  // Handle slot selection
  const handleSelectSlot = (slot: MentorAvailabilitySlot) => {
    onSelectSlot(slot);
  };

  // Set today as selected date initially if there are slots
  useEffect(() => {
    if (slots.length > 0 && !selectedDate) {
      // Try to find slots for today
      const todaySlots = slots.filter(slot => 
        isSameDay(parseISO(slot.start_time), today)
      );
      
      if (todaySlots.length > 0) {
        setSelectedDate(today);
      } else {
        // Find the earliest date with slots
        const datesWithSlots = slots
          .map(slot => parseISO(slot.start_time))
          .sort((a, b) => a.getTime() - b.getTime());
        
        if (datesWithSlots.length > 0) {
          const earliestDate = datesWithSlots[0];
          setSelectedDate(earliestDate);
          
          // Adjust week if earliest date is not in current week
          const earliestWeekStart = startOfWeek(earliestDate, { weekStartsOn: 1 });
          if (earliestWeekStart.getTime() !== weekStart.getTime()) {
            setWeekStart(earliestWeekStart);
          }
        }
      }
    }
  }, [slots, selectedDate]);

  // Generate variant for the weekday button
  const getDayButtonVariant = (day: Date) => {
    const isSelected = selectedDate && isSameDay(day, selectedDate);
    const hasSlots = dayHasSlots(day);
    
    if (isSelected) return "default";
    if (hasSlots) return "outline";
    return "ghost";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-9 w-9" />
              <div className="flex space-x-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-12" />
                ))}
              </div>
              <Skeleton className="h-9 w-9" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-primary" />
          Availability
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Week navigation */}
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goToPreviousWeek}
              disabled={isBefore(weekStart, today)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              {format(weekStart, "MMMM d")} - {format(addDays(weekStart, 6), "MMMM d, yyyy")}
            </div>
            <Button variant="ghost" size="icon" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Days of the week */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, i) => {
              const hasSlots = dayHasSlots(day);
              const isDisabled = isBefore(day, today) && !isSameDay(day, today);
              
              return (
                <div key={i} className="flex flex-col items-center">
                  <div className="text-xs text-muted-foreground mb-1">
                    {format(day, "EEE")}
                  </div>
                  <Button 
                    variant={getDayButtonVariant(day)}
                    size="sm"
                    className={cn(
                      "w-9 h-9",
                      hasSlots ? "font-semibold" : "opacity-50",
                      selectedDate && isSameDay(day, selectedDate) && "ring-2 ring-primary-300"
                    )}
                    onClick={() => selectDay(day)}
                    disabled={isDisabled || !hasSlots}
                  >
                    {format(day, "d")}
                  </Button>
                </div>
              );
            })}
          </div>
          
          {/* Available time slots */}
          {selectedDate && (
            <div className="pt-2">
              <div className="text-sm font-medium mb-2">
                {filteredSlots.length === 0 ? (
                  <p className="text-muted-foreground text-center my-4">
                    No available slots for {format(selectedDate, "EEEE, MMMM d")}
                  </p>
                ) : (
                  <p>Available on {format(selectedDate, "EEEE, MMMM d")}:</p>
                )}
              </div>
              
              <ScrollArea className="h-48 rounded-md">
                <div className="space-y-2 pr-3">
                  {filteredSlots.map((slot) => (
                    <motion.div 
                      key={slot.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="outline" 
                        className={cn(
                          "w-full justify-start",
                          selectedSlot?.id === slot.id && "border-primary bg-primary/5"
                        )}
                        onClick={() => handleSelectSlot(slot)}
                      >
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(parseISO(slot.start_time), "h:mm a")} - {format(parseISO(slot.end_time), "h:mm a")}
                        </span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          
          {slots.length === 0 && !isLoading && (
            <div className="text-center py-6">
              <CalendarIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground">No availability slots found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
