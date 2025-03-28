
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { format, addDays, isAfter, isBefore, isEqual, parseISO, startOfToday } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MentorAvailabilitySlot } from "@/types/mentor";
import { motion } from "framer-motion";

interface MentorAvailabilityCalendarProps {
  mentorId: string;
  availabilitySlots: MentorAvailabilitySlot[];
  isLoading: boolean;
  onSlotSelected: (slot: MentorAvailabilitySlot) => void;
  selectedSlot: MentorAvailabilitySlot | null;
}

export default function MentorAvailabilityCalendar({
  mentorId,
  availabilitySlots,
  isLoading,
  onSlotSelected,
  selectedSlot
}: MentorAvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [slotsForSelectedDate, setSlotsForSelectedDate] = useState<MentorAvailabilitySlot[]>([]);
  
  // Determine which dates have availability
  useEffect(() => {
    if (availabilitySlots && availabilitySlots.length > 0) {
      const dates = new Set<string>();
      
      availabilitySlots.forEach(slot => {
        if (!slot.is_booked) {
          const dateStr = format(parseISO(slot.start_time), 'yyyy-MM-dd');
          dates.add(dateStr);
        }
      });
      
      const availableDateObjects = Array.from(dates).map(dateStr => new Date(dateStr));
      setAvailableDates(availableDateObjects);
    } else {
      setAvailableDates([]);
    }
  }, [availabilitySlots]);
  
  // Update slots when date changes
  useEffect(() => {
    if (!selectedDate) return;
    
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    
    const filteredSlots = availabilitySlots.filter(slot => {
      const slotDate = format(parseISO(slot.start_time), 'yyyy-MM-dd');
      return slotDate === selectedDateStr && !slot.is_booked;
    });
    
    // Sort slots by start time
    filteredSlots.sort((a, b) => {
      return parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime();
    });
    
    setSlotsForSelectedDate(filteredSlots);
  }, [selectedDate, availabilitySlots]);
  
  const today = startOfToday();
  
  const hasAvailabilityOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availableDates.some(d => format(d, 'yyyy-MM-dd') === dateStr);
  };
  
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-lg border p-4"
      >
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
          Available Dates
        </h3>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full justify-start text-left font-normal"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CalendarIcon className="mr-2 h-4 w-4" />
              )}
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => isBefore(date, today) || !hasAvailabilityOnDate(date)}
              modifiers={{
                available: availableDates,
              }}
              modifiersClassNames={{
                available: "bg-primary/10 text-primary",
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </motion.div>
      
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-lg border p-4"
        >
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Clock className="mr-2 h-5 w-5 text-primary" />
            Available Time Slots
          </h3>
          
          {isLoading ? (
            <div className="flex justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : slotsForSelectedDate.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">
              No available slots for this date. Please select another date.
            </p>
          ) : (
            <ScrollArea className="h-60 pr-4">
              <div className="grid grid-cols-2 gap-2">
                {slotsForSelectedDate.map((slot) => (
                  <Button
                    key={slot.id}
                    variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                    className="justify-center"
                    onClick={() => onSlotSelected(slot)}
                  >
                    {format(parseISO(slot.start_time), "h:mm a")}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}
        </motion.div>
      )}
    </div>
  );
}
